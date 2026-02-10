/**
 * Project Provisioning Service
 *
 * Handles the complete lifecycle of Drawer CIS project infrastructure:
 * - Creates project files from templates
 * - Starts/stops/restarts Docker containers
 * - Manages MySQL, Redis, phpMyAdmin, and Redis Insight services
 *
 * Each project gets its own isolated Docker Compose stack with unique ports.
 *
 * Directory structure per project:
 * /var/www/html/active/auroreia/projects/{projectId}/
 * ├── docker-compose.project.{dev|staging|prod}.yml
 * ├── .env
 * ├── .project.json
 * └── mysql-init/
 *     ├── 01-create-databases.sql
 *     ├── 02-init-users-db.sql
 *     └── 03-init-content-db.sql
 */
import { randomUUID, randomBytes } from 'crypto'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getMySQLPool } from '../utils/mysql'

const execAsync = promisify(exec)

/**
 * Environment-specific configuration for provisioning.
 * Uses APP_ENV to determine which Drawer containers and network to connect to.
 */
const APP_ENV = process.env.APP_ENV || 'development'

interface ProvisioningEnvConfig {
  projectsBasePath: string
  apiContainers: string[]
  drawerNetworkName: string
}

const ENV_CONFIG: { development: ProvisioningEnvConfig; staging: ProvisioningEnvConfig; production: ProvisioningEnvConfig } = {
  development: {
    projectsBasePath: '/var/www/html/active/auroreia/projects',
    apiContainers: ['drawer-nodejs-user-api-1', 'drawer-nodejs-content-api-1'],
    drawerNetworkName: 'auroreia_auroreia-net',
  },
  staging: {
    projectsBasePath: '/var/www/applications/auroreia/projects',
    apiContainers: ['drawer-api-user-staging', 'drawer-api-content-staging'],
    drawerNetworkName: 'drawer-core-net',
  },
  production: {
    projectsBasePath: '/var/www/applications/auroreia/projects',
    apiContainers: ['drawer-api-user-prod', 'drawer-api-content-prod'],
    drawerNetworkName: 'drawer-core-net',
  },
}

const envConfig: ProvisioningEnvConfig = (APP_ENV in ENV_CONFIG)
  ? ENV_CONFIG[APP_ENV as keyof typeof ENV_CONFIG]
  : ENV_CONFIG.development

console.log(`[Provisioning] Environment: ${APP_ENV}`)
console.log(`[Provisioning] Projects path: ${envConfig.projectsBasePath}`)
console.log(`[Provisioning] Drawer containers: ${envConfig.apiContainers.join(', ')}`)
console.log(`[Provisioning] Drawer network: ${envConfig.drawerNetworkName}`)

/** Base path for all project directories (on host, outside container) */
const PROJECTS_BASE_PATH = envConfig.projectsBasePath

/** Path to template files for project generation */
const TEMPLATES_PATH = join(process.cwd(), 'server', 'provisioning', 'templates')

/** Docker compose filename per environment (dev, staging, production) */
const COMPOSE_FILENAME = `docker-compose.project.${APP_ENV === 'production' ? 'prod' : APP_ENV === 'staging' ? 'staging' : 'dev'}.yml`

/**
 * Base ports for services. Each new project gets ports offset by project count.
 * Example: First project gets MySQL 3310, second gets 3311, etc.
 */
const BASE_PORTS = {
  mysql: 3310,
  redis: 6380,
  pma: 8100,
  redisinsight: 5550,
}

/**
 * Configuration for provisioning a new project
 */
interface ProvisioningConfig {
  projectId: string
  projectName: string
  ownerId: string
  ownerEmail: string
  adminUsername: string
  adminPasswordHash: string
}

/**
 * Generates a cryptographically secure random password.
 * Avoids $ character which is interpreted as variable by Docker Compose.
 *
 * @param length - Password length (default: 16)
 * @returns Generated password string
 */
function generatePassword(length: number = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%^&*_-+='
  const bytes = randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

/**
 * Calculates the next available port for a service.
 * Port = basePort + number of non-deleted projects.
 *
 * @param basePort - Starting port for the service type
 * @returns Next available port number
 */
async function getNextAvailablePort(basePort: number): Promise<number> {
  const pool = getMySQLPool()

  // Count active projects to calculate port offset
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count FROM projects WHERE status NOT IN ('deleted')`
  )
  const count = (rows as any[])[0].count

  return basePort + count
}

/**
 * Replaces template placeholders with actual values.
 * Placeholders use format: {{PLACEHOLDER_NAME}}
 *
 * @param content - Template content with placeholders
 * @param replacements - Map of placeholder names to values
 * @returns Content with placeholders replaced
 */
function replacePlaceholders(content: string, replacements: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}

/**
 * Creates all project files from templates.
 * Generates passwords, assigns ports, and writes configuration files.
 *
 * @param config - Project configuration
 * @returns Object containing assigned ports and generated passwords
 */
async function createProjectFiles(config: ProvisioningConfig): Promise<{
  mysqlPort: number
  redisPort: number
  mysqlPassword: string
  redisPassword: string
}> {
  const projectPath = join(PROJECTS_BASE_PATH, config.projectId)
  const mysqlInitPath = join(projectPath, 'mysql-init')

  // Generate secure passwords for services
  const mysqlRootPassword = generatePassword(20)
  const mysqlPassword = generatePassword(16)
  const redisPassword = generatePassword(16)

  // Get available ports for all services
  const mysqlPort = await getNextAvailablePort(BASE_PORTS.mysql)
  const redisPort = await getNextAvailablePort(BASE_PORTS.redis)
  const pmaPort = await getNextAvailablePort(BASE_PORTS.pma)
  const redisinsightPort = await getNextAvailablePort(BASE_PORTS.redisinsight)


  // Create project directories
  await mkdir(projectPath, { recursive: true })
  await mkdir(mysqlInitPath, { recursive: true })

  // Prepare template replacements
  const adminUuid = randomUUID()
  const replacements: Record<string, string> = {
    PROJECT_ID: config.projectId,
    PROJECT_NAME: config.projectName,
    OWNER_ID: config.ownerId,
    CREATED_AT: new Date().toISOString(),
    MYSQL_ROOT_PASSWORD: mysqlRootPassword,
    MYSQL_USER: 'admin',
    MYSQL_PASSWORD: mysqlPassword,
    MYSQL_PORT: mysqlPort.toString(),
    REDIS_PASSWORD: redisPassword,
    REDIS_PORT: redisPort.toString(),
    PMA_PORT: pmaPort.toString(),
    REDISINSIGHT_PORT: redisinsightPort.toString(),

    DRAWER_NETWORK_NAME: envConfig.drawerNetworkName,

    ADMIN_UUID: adminUuid,
    ADMIN_USERNAME: config.adminUsername,
    ADMIN_EMAIL: config.ownerEmail,
    ADMIN_PASSWORD_HASH: config.adminPasswordHash
  }

  // Process each template file
  const templates = [
    { src: 'docker-compose.project.yml.template', dest: COMPOSE_FILENAME },
    { src: 'env.template', dest: '.env' },
    { src: 'project.json.template', dest: '.project.json' },
    { src: '01-create-databases.sql.template', dest: 'mysql-init/01-create-databases.sql' },
    { src: '02-init-users-db.sql.template', dest: 'mysql-init/02-init-users-db.sql' },
    { src: '03-init-content-db.sql.template', dest: 'mysql-init/03-init-content-db.sql' }
  ]

  for (const template of templates) {
    const templateContent = await readFile(join(TEMPLATES_PATH, template.src), 'utf-8')
    const finalContent = replacePlaceholders(templateContent, replacements)
    await writeFile(join(projectPath, template.dest), finalContent)
  }

  return {
    mysqlPort,
    redisPort,
    mysqlPassword,
    redisPassword
  }
}

/**
 * Starts Docker containers for a project using docker-compose.
 * Waits for MySQL container to be fully ready before returning.
 *
 * Note: Uses /bin/sh with `. ./.env` (POSIX syntax) because Alpine Linux
 * doesn't have bash. The `source` command is bash-specific.
 *
 * @param projectId - Project identifier
 * @throws Error if containers fail to start or MySQL doesn't become ready
 */
async function startProjectContainers(projectId: string): Promise<void> {
  const projectPath = join(PROJECTS_BASE_PATH, projectId)

  try {
    console.log(`[Provisioning] Starting docker-compose for ${projectId}...`)

    // Start containers with environment variables from .env file
    // Note: --env-file doesn't work well from inside a container, so we source the file
    // Using /bin/sh because Alpine doesn't have bash (. instead of source)
    const { stdout, stderr } = await execAsync(
      `cd ${projectPath} && set -a && . ./.env && set +a && docker compose -p ${projectId} -f ${COMPOSE_FILENAME} up -d`,
      { timeout: 120000, shell: '/bin/sh' }
    )
    console.log(`[Provisioning] docker-compose stdout: ${stdout}`)
    if (stderr) console.log(`[Provisioning] docker-compose stderr: ${stderr}`)

    // Wait for MySQL container to be running (up to 60 seconds)
    console.log(`[Provisioning] Waiting for MySQL container...`)
    let mysqlReady = false
    for (let i = 0; i < 30; i++) {
      try {
        const { stdout: status } = await execAsync(
          `docker inspect -f '{{.State.Status}}' ${projectId}-mysql`,
          { timeout: 5000 }
        )
        if (status.trim() === 'running') {
          // Wait a bit more for MySQL to fully initialize
          await new Promise(resolve => setTimeout(resolve, 5000))
          mysqlReady = true
          console.log(`[Provisioning] MySQL container running after ${(i + 1) * 2} seconds`)
          break
        }
      } catch (e) {
        console.log(`[Provisioning] Waiting... (${i + 1}/30)`)
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (!mysqlReady) {
      console.error(`[Provisioning] MySQL failed to start in time`)
      throw new Error('MySQL failed to start in time')
    }
  } catch (error) {
    console.error('[Provisioning] Error starting containers:', error)
    throw error
  }
}

/**
 * Connects Drawer APIs (user-api and content-api) to a project's Docker network.
 * This allows the APIs to communicate with the project's MySQL and Redis containers.
 *
 * This is a "hot connect" - no restart needed for the API containers.
 * If already connected, Docker will simply ignore the command.
 *
 * @param projectId - Project identifier
 */
async function connectApisToProjectNetwork(projectId: string): Promise<void> {
  const projectNetworkName = `${projectId}-net`
  const auroreaNetworkName = envConfig.drawerNetworkName
  const apiContainers = envConfig.apiContainers

  for (const container of apiContainers) {
    // Connect to project network (for MySQL/Redis access)
    try {
      await execAsync(`docker network connect ${projectNetworkName} ${container}`, { timeout: 10000 })
      console.log(`[Provisioning] Connected ${container} to ${projectNetworkName}`)
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.stderr?.includes('already exists')) {
        console.log(`[Provisioning] ${container} already connected to ${projectNetworkName}`)
      } else {
        console.warn(`[Provisioning] Warning: Could not connect ${container} to ${projectNetworkName}:`, error.message)
      }
    }

    // Connect to AuroreIA network (for credentials API access)
    try {
      await execAsync(`docker network connect ${auroreaNetworkName} ${container}`, { timeout: 10000 })
      console.log(`[Provisioning] Connected ${container} to ${auroreaNetworkName}`)
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.stderr?.includes('already exists')) {
        console.log(`[Provisioning] ${container} already connected to ${auroreaNetworkName}`)
      } else {
        console.warn(`[Provisioning] Warning: Could not connect ${container} to ${auroreaNetworkName}:`, error.message)
      }
    }
  }
}


/**
 * Disconnects Drawer APIs from a project's Docker network.
 * Called during deprovisioning to clean up network connections.
 *
 * @param projectId - Project identifier
 */
async function disconnectApisFromProjectNetwork(projectId: string): Promise<void> {
  const networkName = `${projectId}-net`
  const apiContainers = envConfig.apiContainers

  for (const container of apiContainers) {
    try {
      await execAsync(`docker network disconnect ${networkName} ${container}`, { timeout: 10000 })
      console.log(`[Deprovisioning] Disconnected ${container} from ${networkName}`)
    } catch (error: any) {
      // Ignore "not connected" errors
      console.warn(`[Deprovisioning] Warning: Could not disconnect ${container} from ${networkName}:`, error.message)
    }
  }
}


/**
 * Updates project status in the platform database.
 * Optionally sets MySQL and Redis host addresses and credentials.
 *
 * @param projectId - Project identifier
 * @param status - New status value
 * @param options - Optional connection info and credentials
 */
async function updateProjectStatus(
  projectId: string,
  status: string,
  options?: {
    mysqlHost?: string
    redisHost?: string
    mysqlUser?: string
    mysqlPassword?: string
    redisPassword?: string
  }
): Promise<void> {
  const pool = getMySQLPool()

  if (options?.mysqlHost && options?.redisHost) {
    await pool.execute(
      `UPDATE projects SET
        status = ?,
        mysql_host = ?,
        redis_host = ?,
        mysql_user = ?,
        mysql_password = ?,
        redis_password = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        status,
        options.mysqlHost,
        options.redisHost,
        options.mysqlUser || 'admin',
        options.mysqlPassword || null,
        options.redisPassword || null,
        projectId
      ]
    )
  } else {
    await pool.execute(
      `UPDATE projects SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, projectId]
    )
  }
}

/**
 * Provisions a complete new project.
 * Creates files, starts containers, and updates status.
 *
 * Status flow: pending -> provisioning -> active
 * On error: reverts to pending status
 *
 * @param projectId - Unique project identifier
 * @param projectName - Human-readable project name
 * @param ownerId - UUID of the project owner
 * @param ownerEmail - Email of the project owner
 * @param adminUsername - Drawer admin username
 * @param adminPasswordHash - Bcrypt hash of Drawer admin password
 * @returns Success status and optional error message
 */
export async function provisionProject(
  projectId: string,
  projectName: string,
  ownerId: string,
  ownerEmail: string,
  adminUsername: string,
  adminPasswordHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Provisioning] ========== STARTING for ${projectId} ==========`)

    // Step 1: Update status to "provisioning"
    console.log(`[Provisioning] Step 1: Updating status -> provisioning`)
    await updateProjectStatus(projectId, 'provisioning')
    console.log(`[Provisioning] Step 1: OK`)

    // Step 2: Create project files from templates
    console.log(`[Provisioning] Step 2: Creating project files...`)
    const { mysqlPort, redisPort, mysqlPassword, redisPassword } = await createProjectFiles({
      projectId,
      projectName,
      ownerId,
      ownerEmail,
      adminUsername,
      adminPasswordHash
    })
    console.log(`[Provisioning] Step 2: OK - Files created`)

    // Step 3: Start Docker containers
    console.log(`[Provisioning] Step 3: Starting containers...`)
    await startProjectContainers(projectId)
    console.log(`[Provisioning] Step 3: OK - Containers started`)

    // Step 4: Connect Drawer APIs to project network (hot connect, no restart needed)
    console.log(`[Provisioning] Step 4: Connecting APIs to project network...`)
    await connectApisToProjectNetwork(projectId)
    console.log(`[Provisioning] Step 4: OK - APIs connected to ${projectId}-net`)

    // Step 5: Update status to "active" with host info and credentials
    console.log(`[Provisioning] Step 5: Updating status -> active`)
    const mysqlHost = `${projectId}-mysql`
    const redisHost = `${projectId}-redis`
    await updateProjectStatus(projectId, 'active', {
      mysqlHost,
      redisHost,
      mysqlUser: 'admin',
      mysqlPassword,
      redisPassword
    })
    console.log(`[Provisioning] Step 5: OK`)

    console.log(`[Provisioning] ========== SUCCESS for ${projectId} ==========`)
    console.log(`[Provisioning]   - MySQL: localhost:${mysqlPort}`)
    console.log(`[Provisioning]   - Redis: localhost:${redisPort}`)

    return { success: true }
  } catch (error: any) {
    console.error(`[Provisioning] Error for ${projectId}:`, error)

    // Revert status to "pending" on error
    await updateProjectStatus(projectId, 'pending')

    return { success: false, error: error.message }
  }
}

/**
 * Stops Docker containers for a project without removing volumes.
 * Used for soft delete (moving to trash) to free up RAM while preserving data.
 * Also disconnects Drawer APIs from the project network.
 *
 * @param projectId - Project identifier
 * @returns Success status and optional error message
 */
export async function stopProjectContainers(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectPath = join(PROJECTS_BASE_PATH, projectId)

    console.log(`[StopContainers] Stopping containers for ${projectId}...`)

    await execAsync(
      `cd ${projectPath} && set -a && . ./.env && set +a && docker compose -p ${projectId} -f ${COMPOSE_FILENAME} stop`,
      { timeout: 60000, shell: '/bin/sh' }
    )

    console.log(`[StopContainers] Containers stopped for ${projectId}`)

    // Disconnect APIs from project network when stopping
    console.log(`[StopContainers] Disconnecting APIs from ${projectId} network...`)
    await disconnectApisFromProjectNetwork(projectId)
    console.log(`[StopContainers] APIs disconnected from ${projectId}-net`)

    return { success: true }
  } catch (error: any) {
    console.error(`[StopContainers] Error for ${projectId}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Restarts stopped Docker containers for a project.
 * Used when restoring a project from trash.
 * Waits for MySQL container to be ready before returning.
 * Also reconnects Drawer APIs to the project network.
 *
 * @param projectId - Project identifier
 * @returns Success status and optional error message
 */
export async function restartProjectContainers(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectPath = join(PROJECTS_BASE_PATH, projectId)

    console.log(`[RestartContainers] Restarting containers for ${projectId}...`)

    await execAsync(
      `cd ${projectPath} && set -a && . ./.env && set +a && docker compose -p ${projectId} -f ${COMPOSE_FILENAME} start`,
      { timeout: 120000, shell: '/bin/sh' }
    )

    // Wait for MySQL container to be ready
    console.log(`[RestartContainers] Waiting for MySQL container...`)
    for (let i = 0; i < 15; i++) {
      try {
        const { stdout: status } = await execAsync(
          `docker inspect -f '{{.State.Status}}' ${projectId}-mysql`,
          { timeout: 5000 }
        )
        if (status.trim() === 'running') {
          console.log(`[RestartContainers] Containers restarted for ${projectId}`)
          break
        }
      } catch (e) {
        console.log(`[RestartContainers] Waiting... (${i + 1}/15)`)
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Reconnect APIs to project network after restart
    console.log(`[RestartContainers] Reconnecting APIs to ${projectId} network...`)
    await connectApisToProjectNetwork(projectId)
    console.log(`[RestartContainers] APIs reconnected to ${projectId}-net`)

    return { success: true }
  } catch (error: any) {
    console.error(`[RestartContainers] Error for ${projectId}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Completely removes a project (hard delete).
 * Stops and removes containers, deletes volumes, and removes all project files.
 * This action is IRREVERSIBLE.
 *
 * @param projectId - Project identifier
 * @returns Success status and optional error message
 */
export async function deprovisionProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectPath = join(PROJECTS_BASE_PATH, projectId)

    // Step 1: Disconnect APIs from project network
    console.log(`[Deprovisioning] Disconnecting APIs from ${projectId} network...`)
    await disconnectApisFromProjectNetwork(projectId)

    // Step 2: Stop and remove containers with volumes
    console.log(`[Deprovisioning] Stopping containers for ${projectId}...`)
    try {
      await execAsync(
        `cd ${projectPath} && docker compose -p ${projectId} --env-file .env -f ${COMPOSE_FILENAME} down -v`,
        { timeout: 60000 }
      )
    } catch (e) {
      console.warn(`[Deprovisioning] Containers may already be stopped:`, e)
    }

    // Step 3: Delete project directory and all files
    console.log(`[Deprovisioning] Deleting files...`)
    await execAsync(`rm -rf ${projectPath}`, { timeout: 30000 })

    // Step 4: Update status in database
    await updateProjectStatus(projectId, 'deleted')

    console.log(`[Deprovisioning] Project ${projectId} deleted successfully!`)

    return { success: true }
  } catch (error: any) {
    console.error(`[Deprovisioning] Error for ${projectId}:`, error)
    return { success: false, error: error.message }
  }
}

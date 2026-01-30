import { randomUUID, randomBytes } from 'crypto'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import bcrypt from 'bcryptjs'
import { getMySQLPool } from '../utils/mysql'

const execAsync = promisify(exec)

// Chemin vers les projets (hors du container, sur l'hôte)
const PROJECTS_BASE_PATH = '/var/www/html/active/auroreia/projects'
const TEMPLATES_PATH = join(process.cwd(), 'server', 'provisioning', 'templates')

// Ports de base pour les services (incrémentés pour chaque projet)
const BASE_PORTS = {
  mysql: 3310,
  redis: 6380,
  pma: 8100,
  redisinsight: 5550,
  filebrowser: 8200
}

interface ProvisioningConfig {
  projectId: string
  projectName: string
  ownerId: string
  ownerEmail: string
  adminUsername: string
  adminPasswordHash: string
}

/**
 * Génère un mot de passe aléatoire sécurisé
 * Note: Évite $ qui est interprété comme variable par Docker Compose
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
 * Récupère le prochain port disponible pour un service
 */
async function getNextAvailablePort(basePort: number): Promise<number> {
  const pool = getMySQLPool()

  // Compte le nombre de projets actifs pour calculer l'offset
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as count FROM projects WHERE status NOT IN ('deleted')`
  )
  const count = (rows as any[])[0].count

  return basePort + count
}

/**
 * Remplace les placeholders dans un template
 */
function replacePlaceholders(content: string, replacements: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}

/**
 * Crée le dossier du projet avec tous les fichiers nécessaires
 */
async function createProjectFiles(config: ProvisioningConfig): Promise<{
  mysqlPort: number
  redisPort: number
  mysqlPassword: string
  redisPassword: string
}> {
  const projectPath = join(PROJECTS_BASE_PATH, config.projectId)
  const mysqlInitPath = join(projectPath, 'mysql-init')

  // Générer les mots de passe
  const mysqlRootPassword = generatePassword(20)
  const mysqlPassword = generatePassword(16)
  const redisPassword = generatePassword(16)

  // Récupérer les ports disponibles
  const mysqlPort = await getNextAvailablePort(BASE_PORTS.mysql)
  const redisPort = await getNextAvailablePort(BASE_PORTS.redis)
  const pmaPort = await getNextAvailablePort(BASE_PORTS.pma)
  const redisinsightPort = await getNextAvailablePort(BASE_PORTS.redisinsight)
  const filebrowserPort = await getNextAvailablePort(BASE_PORTS.filebrowser)

  // Créer les dossiers
  await mkdir(projectPath, { recursive: true })
  await mkdir(mysqlInitPath, { recursive: true })

  // Préparer les remplacements
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
    FILEBROWSER_PORT: filebrowserPort.toString(),
    ADMIN_UUID: adminUuid,
    ADMIN_USERNAME: config.adminUsername,
    ADMIN_EMAIL: config.ownerEmail,
    ADMIN_PASSWORD_HASH: config.adminPasswordHash
  }

  // Lire et écrire chaque template
  const templates = [
    { src: 'docker-compose.project.yml.template', dest: 'docker-compose.project.dev.yml' },
    { src: '.env.template', dest: '.env' },
    { src: '.project.json.template', dest: '.project.json' },
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
 * Lance les containers Docker pour le projet
 */
async function startProjectContainers(projectId: string): Promise<void> {
  const projectPath = join(PROJECTS_BASE_PATH, projectId)

  try {
    console.log(`[Provisioning] Lancement docker-compose pour ${projectId}...`)

    // Lancer docker-compose en exportant les variables du .env
    // Note: --env-file ne fonctionne pas bien depuis un container, donc on source le fichier
    // Utiliser /bin/sh car Alpine n'a pas bash (. au lieu de source)
    const { stdout, stderr } = await execAsync(
      `cd ${projectPath} && set -a && . ./.env && set +a && docker compose -p ${projectId} -f docker-compose.project.dev.yml up -d`,
      { timeout: 120000, shell: '/bin/sh' }
    )
    console.log(`[Provisioning] docker-compose stdout: ${stdout}`)
    if (stderr) console.log(`[Provisioning] docker-compose stderr: ${stderr}`)

    // Attendre que le container MySQL soit running (jusqu'à 60 secondes)
    console.log(`[Provisioning] Attente du container MySQL...`)
    let mysqlReady = false
    for (let i = 0; i < 30; i++) {
      try {
        const { stdout: status } = await execAsync(
          `docker inspect -f '{{.State.Status}}' ${projectId}-mysql`,
          { timeout: 5000 }
        )
        if (status.trim() === 'running') {
          // Attendre encore un peu que MySQL soit vraiment prêt
          await new Promise(resolve => setTimeout(resolve, 5000))
          mysqlReady = true
          console.log(`[Provisioning] Container MySQL running après ${(i + 1) * 2} secondes`)
          break
        }
      } catch (e) {
        console.log(`[Provisioning] Attente... (${i + 1}/30)`)
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (!mysqlReady) {
      console.error(`[Provisioning] MySQL n'a pas démarré dans les temps`)
      throw new Error('MySQL n\'a pas démarré dans les temps')
    }
  } catch (error) {
    console.error('[Provisioning] Erreur lors du démarrage des containers:', error)
    throw error
  }
}

/**
 * Met à jour le statut du projet dans la base plateforme
 */
async function updateProjectStatus(
  projectId: string,
  status: string,
  mysqlHost?: string,
  redisHost?: string
): Promise<void> {
  const pool = getMySQLPool()

  if (mysqlHost && redisHost) {
    await pool.execute(
      `UPDATE projects SET status = ?, mysql_host = ?, redis_host = ?, updated_at = NOW() WHERE id = ?`,
      [status, mysqlHost, redisHost, projectId]
    )
  } else {
    await pool.execute(
      `UPDATE projects SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, projectId]
    )
  }
}

/**
 * Provisionne un nouveau projet complet
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
    console.log(`[Provisioning] ========== DÉMARRAGE pour ${projectId} ==========`)

    // 1. Mettre à jour le statut à "provisioning"
    console.log(`[Provisioning] Étape 1: Mise à jour status -> provisioning`)
    await updateProjectStatus(projectId, 'provisioning')
    console.log(`[Provisioning] Étape 1: OK`)

    // 2. Créer les fichiers du projet
    console.log(`[Provisioning] Étape 2: Création des fichiers...`)
    const { mysqlPort, redisPort } = await createProjectFiles({
      projectId,
      projectName,
      ownerId,
      ownerEmail,
      adminUsername,
      adminPasswordHash
    })
    console.log(`[Provisioning] Étape 2: OK - Fichiers créés`)

    // 3. Démarrer les containers
    console.log(`[Provisioning] Étape 3: Démarrage des containers...`)
    await startProjectContainers(projectId)
    console.log(`[Provisioning] Étape 3: OK - Containers démarrés`)

    // 4. Mettre à jour le statut à "active"
    console.log(`[Provisioning] Étape 4: Mise à jour status -> active`)
    const mysqlHost = `mysql-${projectId}`
    const redisHost = `redis-${projectId}`
    await updateProjectStatus(projectId, 'active', mysqlHost, redisHost)
    console.log(`[Provisioning] Étape 4: OK`)

    console.log(`[Provisioning] ========== SUCCÈS pour ${projectId} ==========`)
    console.log(`[Provisioning]   - MySQL: localhost:${mysqlPort}`)
    console.log(`[Provisioning]   - Redis: localhost:${redisPort}`)

    return { success: true }
  } catch (error: any) {
    console.error(`[Provisioning] Erreur pour ${projectId}:`, error)

    // Remettre le statut à "pending" en cas d'erreur
    await updateProjectStatus(projectId, 'pending')

    return { success: false, error: error.message }
  }
}

/**
 * Arrête les containers d'un projet (sans supprimer les volumes ni les fichiers)
 */
export async function stopProjectContainers(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectPath = join(PROJECTS_BASE_PATH, projectId)

    console.log(`[StopContainers] Arrêt des containers pour ${projectId}...`)

    await execAsync(
      `cd ${projectPath} && set -a && . ./.env && set +a && docker compose -p ${projectId} -f docker-compose.project.dev.yml stop`,
      { timeout: 60000, shell: '/bin/sh' }
    )

    console.log(`[StopContainers] Containers arrêtés pour ${projectId}`)
    return { success: true }
  } catch (error: any) {
    console.error(`[StopContainers] Erreur pour ${projectId}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Redémarre les containers d'un projet existant
 */
export async function restartProjectContainers(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectPath = join(PROJECTS_BASE_PATH, projectId)

    console.log(`[RestartContainers] Redémarrage des containers pour ${projectId}...`)

    await execAsync(
      `cd ${projectPath} && set -a && . ./.env && set +a && docker compose -p ${projectId} -f docker-compose.project.dev.yml start`,
      { timeout: 120000, shell: '/bin/sh' }
    )

    // Attendre que MySQL soit prêt
    console.log(`[RestartContainers] Attente du container MySQL...`)
    for (let i = 0; i < 15; i++) {
      try {
        const { stdout: status } = await execAsync(
          `docker inspect -f '{{.State.Status}}' ${projectId}-mysql`,
          { timeout: 5000 }
        )
        if (status.trim() === 'running') {
          console.log(`[RestartContainers] Containers redémarrés pour ${projectId}`)
          return { success: true }
        }
      } catch (e) {
        console.log(`[RestartContainers] Attente... (${i + 1}/15)`)
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return { success: true }
  } catch (error: any) {
    console.error(`[RestartContainers] Erreur pour ${projectId}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Supprime un projet (arrête les containers et supprime les fichiers)
 */
export async function deprovisionProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projectPath = join(PROJECTS_BASE_PATH, projectId)

    console.log(`[Deprovisioning] Arrêt des containers pour ${projectId}...`)

    // Arrêter et supprimer les containers
    try {
      await execAsync(
        `cd ${projectPath} && docker compose -p ${projectId} --env-file .env -f docker-compose.project.dev.yml down -v`,
        { timeout: 60000 }
      )
    } catch (e) {
      console.warn(`[Deprovisioning] Containers peut-être déjà arrêtés:`, e)
    }

    // Supprimer le dossier du projet
    console.log(`[Deprovisioning] Suppression des fichiers...`)
    await execAsync(`rm -rf ${projectPath}`, { timeout: 30000 })

    // Mettre à jour le statut
    await updateProjectStatus(projectId, 'deleted')

    console.log(`[Deprovisioning] Projet ${projectId} supprimé avec succès !`)

    return { success: true }
  } catch (error: any) {
    console.error(`[Deprovisioning] Erreur pour ${projectId}:`, error)
    return { success: false, error: error.message }
  }
}

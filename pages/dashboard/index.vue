<template>
  <div class="dashboard-page">
    <header class="dashboard-header">
      <NuxtLink to="/" class="logo">AuroreIA</NuxtLink>
      <div class="user-menu">
        <span class="user-email">{{ owner?.email }}</span>
        <button @click="handleLogout" class="logout-btn">Déconnexion</button>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="dashboard-container">
        <div class="page-header">
          <h1>Mes projets</h1>
          <button @click="showCreateModal = true" class="create-btn">
            + Nouveau projet
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          Chargement des projets...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-state">
          {{ error }}
        </div>

        <!-- Empty state -->
        <div v-else-if="activeProjects.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <h2>Aucun projet</h2>
          <p>Créez votre premier projet Drawer CIS pour commencer.</p>
          <button @click="showCreateModal = true" class="create-btn">
            Créer un projet
          </button>
        </div>

        <!-- Projects list -->
        <div v-else class="projects-grid">
          <div v-for="project in activeProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <h3>{{ project.displayName }}</h3>
              <span :class="['status-badge', `status-${project.status}`]">
                {{ statusLabels[project.status] }}
              </span>
            </div>
            <div class="project-info">
              <p class="project-id">{{ project.id }}</p>
              <p class="project-date">
                Créé le {{ formatDate(project.createdAt) }}
              </p>
            </div>
            <div class="project-actions">
              <a
                v-if="project.status === 'active'"
                :href="drawerUrl + '?project=' + project.id"
                target="_blank"
                class="action-btn primary"
              >
                Ouvrir dans Drawer
              </a>
              <button
                v-if="project.status === 'pending' && provisioningProjectId !== project.id"
                @click="handleProvision(project.id)"
                class="action-btn primary"
              >
                Lancer le provisioning
              </button>
              <button
                v-if="project.status === 'provisioning' || provisioningProjectId === project.id"
                class="action-btn secondary"
                disabled
              >
                Provisioning en cours...
              </button>
              <button
                @click="confirmDelete(project)"
                class="action-btn danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Corbeille section -->
        <div v-if="deletedProjects.length > 0" class="trash-section">
          <div class="trash-header">
            <h2>Corbeille</h2>
            <button
              v-if="deletedProjects.length > 0"
              @click="confirmEmptyTrash"
              class="empty-trash-btn"
            >
              Vider la corbeille
            </button>
          </div>
          <div class="projects-grid">
            <div v-for="project in deletedProjects" :key="project.id" class="project-card deleted">
              <div class="project-header">
                <h3>{{ project.displayName }}</h3>
                <span class="status-badge status-deleted">
                  Dans la corbeille
                </span>
              </div>
              <div class="project-info">
                <p class="project-id">{{ project.id }}</p>
                <p class="project-date">
                  Créé le {{ formatDate(project.createdAt) }}
                </p>
              </div>
              <div class="project-actions">
                <button
                  @click="handleRestore(project.id)"
                  class="action-btn restore"
                  :disabled="isRestoring === project.id"
                >
                  {{ isRestoring === project.id ? 'Restauration...' : 'Restaurer' }}
                </button>
                <button
                  @click="confirmHardDelete(project)"
                  class="action-btn danger"
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Project Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Nouveau projet</h2>
          <button @click="showCreateModal = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleCreateProject" class="modal-form">
          <div v-if="createError" class="error-message">
            {{ createError }}
          </div>

          <div class="form-group">
            <label for="projectName">Nom du projet *</label>
            <input
              id="projectName"
              v-model="newProject.displayName"
              type="text"
              placeholder="Mon super projet"
              required
            />
          </div>

          <div class="form-divider">
            <span>Identifiants administrateur Drawer</span>
          </div>

          <div class="form-group">
            <label for="drawerUsername">Username Drawer *</label>
            <input
              id="drawerUsername"
              v-model="newProject.drawerUsername"
              type="text"
              placeholder="admin"
              required
            />
          </div>

          <div class="form-group">
            <label for="drawerPassword">Mot de passe Drawer *</label>
            <input
              id="drawerPassword"
              v-model="newProject.drawerPassword"
              type="password"
              placeholder="Minimum 8 caractères"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="cancel-btn">
              Annuler
            </button>
            <button type="submit" class="submit-btn" :disabled="isCreating">
              {{ isCreating ? 'Création...' : 'Créer le projet' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal (Soft delete - corbeille) -->
    <div v-if="projectToDelete" class="modal-overlay" @click.self="projectToDelete = null">
      <div class="modal modal-small">
        <div class="modal-header">
          <h2>Mettre dans la corbeille ?</h2>
        </div>
        <div class="modal-body">
          <p>
            Le projet <strong>{{ projectToDelete.displayName }}</strong> sera déplacé dans la corbeille.
          </p>
          <p class="info">Vous pourrez le restaurer ou le supprimer définitivement depuis la corbeille.</p>
        </div>
        <div class="modal-actions">
          <button @click="projectToDelete = null" class="cancel-btn">
            Annuler
          </button>
          <button @click="handleDelete" class="delete-btn" :disabled="isDeleting">
            {{ isDeleting ? 'Suppression...' : 'Mettre dans la corbeille' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Hard Delete Confirmation Modal -->
    <div v-if="projectToHardDelete" class="modal-overlay" @click.self="projectToHardDelete = null">
      <div class="modal modal-small">
        <div class="modal-header">
          <h2>Supprimer définitivement ?</h2>
        </div>
        <div class="modal-body">
          <p>
            Êtes-vous sûr de vouloir supprimer définitivement le projet
            <strong>{{ projectToHardDelete.displayName }}</strong> ?
          </p>
          <p class="warning">Cette action est irréversible. Tous les conteneurs, volumes et fichiers seront supprimés.</p>
        </div>
        <div class="modal-actions">
          <button @click="projectToHardDelete = null" class="cancel-btn">
            Annuler
          </button>
          <button @click="handleHardDelete" class="delete-btn" :disabled="isHardDeleting">
            {{ isHardDeleting ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Trash Confirmation Modal -->
    <div v-if="showEmptyTrashModal" class="modal-overlay" @click.self="showEmptyTrashModal = false">
      <div class="modal modal-small">
        <div class="modal-header">
          <h2>Vider la corbeille ?</h2>
        </div>
        <div class="modal-body">
          <p>
            Cette action supprimera définitivement <strong>{{ deletedProjects.length }}</strong> projet(s).
          </p>
          <p class="warning">Cette action est irréversible. Tous les conteneurs, volumes et fichiers seront supprimés.</p>
        </div>
        <div class="modal-actions">
          <button @click="showEmptyTrashModal = false" class="cancel-btn">
            Annuler
          </button>
          <button @click="handleEmptyTrash" class="delete-btn" :disabled="isEmptyingTrash">
            {{ isEmptyingTrash ? 'Suppression...' : 'Vider la corbeille' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { owner, logout } = useAuth()
const { projects, loading, error, fetchProjects, createProject, deleteProject, restoreProject, hardDeleteProject, provisionProject } = useProjects()

const drawerUrl = 'https://drawer.auroreia.fr'

const showCreateModal = ref(false)
const isCreating = ref(false)
const provisioningProjectId = ref<string | null>(null)
const createError = ref('')

const newProject = reactive({
  displayName: '',
  drawerUsername: '',
  drawerPassword: ''
})

const projectToDelete = ref<any>(null)
const isDeleting = ref(false)

// Trash management state
const projectToHardDelete = ref<any>(null)
const isHardDeleting = ref(false)
const isRestoring = ref<string | null>(null)
const showEmptyTrashModal = ref(false)
const isEmptyingTrash = ref(false)

// Computed filters to separate active projects from deleted ones
const activeProjects = computed(() => projects.value.filter(p => p.status !== 'deleted'))
const deletedProjects = computed(() => projects.value.filter(p => p.status === 'deleted'))

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  provisioning: 'Provisioning',
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé'
}

// Fetch projects on component mount
onMounted(() => {
  fetchProjects()
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function handleLogout() {
  await logout()
}

async function handleCreateProject() {
  if (isCreating.value) return

  try {
    isCreating.value = true
    createError.value = ''
    await createProject(
      newProject.displayName,
      newProject.drawerUsername,
      newProject.drawerPassword
    )
    showCreateModal.value = false
    // Reset form fields
    newProject.displayName = ''
    newProject.drawerUsername = ''
    newProject.drawerPassword = ''
  } catch (e: any) {
    createError.value = e.data?.message || 'Erreur lors de la création'
  } finally {
    isCreating.value = false
  }
}

function confirmDelete(project: any) {
  projectToDelete.value = project
}

async function handleDelete() {
  if (!projectToDelete.value || isDeleting.value) return

  try {
    isDeleting.value = true
    console.log('Deleting project:', projectToDelete.value.id)
    await deleteProject(projectToDelete.value.id)
    console.log('Project deleted successfully')
    projectToDelete.value = null
  } catch (e: any) {
    console.error('Delete error:', e)
    alert('Erreur lors de la suppression: ' + (e.data?.message || e.message || 'Erreur inconnue'))
  } finally {
    isDeleting.value = false
  }
}

async function handleProvision(projectId: string) {
  if (provisioningProjectId.value) return

  try {
    provisioningProjectId.value = projectId
    await provisionProject(projectId)

    // Poll periodically to detect status change
    const interval = setInterval(async () => {
      await fetchProjects()
      const project = projects.value.find(p => p.id === projectId)
      if (project?.status === 'active') {
        clearInterval(interval)
        provisioningProjectId.value = null
      }
    }, 3000)

    // Timeout after 2 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(interval)
      provisioningProjectId.value = null
    }, 120000)
  } catch (e: any) {
    console.error('Provisioning error:', e)
    provisioningProjectId.value = null
  }
}

// Trash management functions
async function handleRestore(projectId: string) {
  if (isRestoring.value) return

  try {
    isRestoring.value = projectId
    await restoreProject(projectId)
  } catch (e: any) {
    console.error('Restore error:', e)
    alert('Erreur lors de la restauration: ' + (e.data?.message || e.message || 'Erreur inconnue'))
  } finally {
    isRestoring.value = null
  }
}

function confirmHardDelete(project: any) {
  projectToHardDelete.value = project
}

async function handleHardDelete() {
  if (!projectToHardDelete.value || isHardDeleting.value) return

  try {
    isHardDeleting.value = true
    await hardDeleteProject(projectToHardDelete.value.id)
    projectToHardDelete.value = null
  } catch (e: any) {
    console.error('Hard delete error:', e)
    alert('Erreur lors de la suppression: ' + (e.data?.message || e.message || 'Erreur inconnue'))
  } finally {
    isHardDeleting.value = false
  }
}

function confirmEmptyTrash() {
  showEmptyTrashModal.value = true
}

async function handleEmptyTrash() {
  if (isEmptyingTrash.value) return

  try {
    isEmptyingTrash.value = true
    // Delete all projects in trash one by one
    for (const project of deletedProjects.value) {
      await hardDeleteProject(project.id)
    }
    showEmptyTrashModal.value = false
  } catch (e: any) {
    console.error('Empty trash error:', e)
    alert('Erreur lors du vidage de la corbeille: ' + (e.data?.message || e.message || 'Erreur inconnue'))
  } finally {
    isEmptyingTrash.value = false
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00c2c7;
  text-decoration: none;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #fff;
  margin: 0;
}

.create-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00c2c7, #00a5a9);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 194, 199, 0.4);
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.2s, transform 0.2s;
}

.project-card:hover {
  border-color: rgba(0, 194, 199, 0.3);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-provisioning {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.status-active {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-suspended {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.project-info {
  margin-bottom: 1.5rem;
}

.project-id {
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.project-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
  margin: 0;
}

.project-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
}

.action-btn.primary {
  background: #00c2c7;
  color: #000;
}

.action-btn.primary:hover {
  background: #00d4d9;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.action-btn.danger {
  background: transparent;
  border: 1px solid rgba(255, 59, 48, 0.5);
  color: #ff6b6b;
}

.action-btn.danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  width: 100%;
  max-width: 480px;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.modal-small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  color: #fff;
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.modal-form {
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.modal-body p {
  margin: 0 0 0.5rem 0;
}

.modal-body .warning {
  color: #ff6b6b;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #00c2c7;
}

.form-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-divider::before,
.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.form-divider span {
  padding: 0 1rem;
}

.error-message {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff6b6b;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00c2c7, #00a5a9);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  padding: 0.75rem 1.5rem;
  background: #ff3b30;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Trash section */
.trash-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.trash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.trash-header h2 {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.25rem;
  margin: 0;
}

.empty-trash-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 59, 48, 0.5);
  border-radius: 6px;
  color: #ff6b6b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-trash-btn:hover {
  background: rgba(255, 59, 48, 0.1);
}

.project-card.deleted {
  opacity: 0.7;
  border-color: rgba(255, 255, 255, 0.05);
}

.project-card.deleted:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.status-deleted {
  background: rgba(255, 59, 48, 0.2);
  color: #ff6b6b;
}

.action-btn.restore {
  background: transparent;
  border: 1px solid rgba(76, 175, 80, 0.5);
  color: #4caf50;
}

.action-btn.restore:hover {
  background: rgba(76, 175, 80, 0.1);
}

.modal-body .info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}
</style>

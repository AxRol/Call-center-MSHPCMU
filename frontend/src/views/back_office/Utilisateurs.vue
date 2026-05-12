<template>
  <div class="users-page">
    <div class="page-header">
      <div>
        <h1>Utilisateurs</h1>
        <p>{{ filteredUsers.length }} utilisateur(s) trouvé(s)</p>
      </div>
      <button v-if="canWrite" class="btn-primary" @click="openModal('create')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nouvel utilisateur
      </button>
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="search-input">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher par nom..." />
      </div>
      <select v-model="filterRole" class="filter-select">
        <option value="">Tous les rôles</option>
        <option v-for="r in rolesList" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>
      <select v-model="filterActif" class="filter-select">
        <option value="">Tous les statuts</option>
        <option value="true">Actif</option>
        <option value="false">Inactif</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortBy('username')" class="sortable">
                Nom d'utilisateur <span class="sort-icon">{{ sortKey === 'username' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </th>
              <th @click="sortBy('role')" class="sortable">
                Rôle <span class="sort-icon">{{ sortKey === 'role' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </th>
              <th>Statut</th>
              <th @click="sortBy('created_at')" class="sortable">
                Créé le <span class="sort-icon">{{ sortKey === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" class="empty-state">Aucun utilisateur trouvé.</td>
            </tr>
            <tr v-for="u in paginatedUsers" :key="u.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-sm">{{ initiales(u.username) }}</div>
                  <span>{{ u.username }}</span>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="u.role">{{ roleLabel(u.role) }}</span>
              </td>
              <td>
                <span class="actif-badge" :class="u.is_active ? 'actif' : 'inactif'">
                  {{ u.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="muted">{{ formatDate(u.created_at) }}</td>
              <td>
                <div class="action-btns">
                  <button class="action-btn detail" title="Détail" @click="openModal('detail', u)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button v-if="canWrite" class="action-btn edit" title="Éditer" @click="openModal('edit', u)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button v-if="canDelete && u.id !== currentUser.id" class="action-btn delete" title="Supprimer" @click="confirmDelete(u)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <span class="pagination-info">
          {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredUsers.length) }} sur {{ filteredUsers.length }}
        </span>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
          <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === currentPage }" @click="currentPage = p">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
        </div>
        <select v-model="perPage" class="filter-select compact">
          <option :value="5">5 / page</option>
          <option :value="10">10 / page</option>
          <option :value="25">25 / page</option>
        </select>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="modal.show" @click.self="closeModal">
          <div class="modal" :class="modal.type">

            <!-- Détail -->
            <template v-if="modal.type === 'detail'">
              <div class="modal-header">
                <h2>Détail de l'utilisateur</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="user-profile">
                  <div class="user-avatar-lg">{{ initiales(modal.data?.username) }}</div>
                  <div class="user-profile-info">
                    <h3>{{ modal.data?.username }}</h3>
                    <span class="role-badge" :class="modal.data?.role">{{ roleLabel(modal.data?.role) }}</span>
                  </div>
                </div>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Statut</span>
                    <span class="actif-badge" :class="modal.data?.is_active ? 'actif' : 'inactif'">
                      {{ modal.data?.is_active ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Créé le</span>
                    <span class="detail-value">{{ formatDate(modal.data?.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Fermer</button>
                <button v-if="canWrite" class="btn-primary" @click="openModal('edit', modal.data)">Éditer</button>
              </div>
            </template>

            <!-- Créer / Éditer -->
            <template v-else-if="modal.type === 'create' || modal.type === 'edit'">
              <div class="modal-header">
                <h2>{{ modal.type === 'create' ? 'Nouvel utilisateur' : 'Éditer l\'utilisateur' }}</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group full">
                    <label>Nom d'utilisateur <span class="required">*</span></label>
                    <input v-model="form.username" type="text" placeholder="ex: agent_dupont" :class="{ 'error-border': errors.username }" />
                    <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
                  </div>
                  <div class="form-group full">
                    <label>Rôle <span class="required">*</span></label>
                    <select v-model="form.role" :class="{ 'error-border': errors.role }">
                      <option value="">-- Sélectionner --</option>
                      <option v-for="r in rolesList" :key="r.value" :value="r.value">{{ r.label }}</option>
                    </select>
                    <span v-if="errors.role" class="error-msg">{{ errors.role }}</span>
                  </div>
                  <div class="form-group full">
                    <label>
                      Mot de passe
                      <span class="required" v-if="modal.type === 'create'">*</span>
                      <span class="optional" v-else>(laisser vide pour ne pas modifier)</span>
                    </label>
                    <div class="password-wrap">
                      <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" :class="{ 'error-border': errors.password }" />
                      <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                        <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-primary" @click="saveForm" :disabled="saving">
                  <span v-if="saving" class="spinner-sm"></span>
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </template>

            <!-- Supprimer -->
            <template v-else-if="modal.type === 'delete'">
              <div class="modal-header danger">
                <h2>Supprimer l'utilisateur</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="delete-confirm">
                  <div class="delete-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <p>Êtes-vous sûr de vouloir supprimer <strong>{{ modal.data?.username }}</strong> ?</p>
                  <p class="delete-warning">Cette action est irréversible.</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete" :disabled="saving">Supprimer définitivement</button>
              </div>
            </template>

          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { API_BASE } from '@/config/api.js'
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const apiBase = API_BASE + '/api/user'
const router  = useRouter()

const users       = ref([])
const currentUser = ref({})
const loading     = ref(false)
const saving      = ref(false)
const showPassword = ref(false)

const search      = ref('')
const filterRole  = ref('')
const filterActif = ref('')
const sortKey     = ref('username')
const sortDir     = ref('asc')
const currentPage = ref(1)
const perPage     = ref(10)

const modal  = ref({ show: false, type: '', data: null })
const form   = ref({})
const errors = ref({})

const rolesList = [
  { value: 'agent',       label: 'Agent' },
  { value: 'superviseur', label: 'Superviseur' },
  { value: 'manager',     label: 'Manager' },
  { value: 'inspecteur',  label: 'Inspecteur' },
  { value: 'admin',       label: 'Administrateur' },
  { value: 'super_admin', label: 'Super Admin' },
]

const canWrite  = computed(() => ['admin', 'superviseur'].includes(currentUser.value?.role))
const canDelete = computed(() => currentUser.value?.role === 'admin')

// ── Helpers ──────────────────────────────────────────────────────────────────
function initiales(username) {
  if (!username) return '?'
  return username.slice(0, 2).toUpperCase()
}
function roleLabel(role) {
  return rolesList.find(r => r.value === role)?.label ?? role ?? 'N/A'
}
function formatDate(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`
}
function handleInvalidToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// ── Filtres / tri / pagination ────────────────────────────────────────────────
const filteredUsers = computed(() => {
  let list = users.value
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(u => u.username.toLowerCase().includes(s))
  }
  if (filterRole.value)  list = list.filter(u => u.role === filterRole.value)
  if (filterActif.value) list = list.filter(u => String(u.is_active) === filterActif.value)
  return [...list].sort((a, b) => {
    let va = a[sortKey.value] ?? '', vb = b[sortKey.value] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
})
const totalPages    = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage.value)))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredUsers.value.slice(start, start + perPage.value)
})
watch([search, filterRole, filterActif, perPage], () => { currentPage.value = 1 })
function sortBy(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

// ── Chargement ────────────────────────────────────────────────────────────────
async function loadUsers() {
  const token = localStorage.getItem('token')
  if (!token) return handleInvalidToken()
  loading.value = true
  try {
    const resp = await fetch(apiBase, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.status === 401 || resp.status === 403) return handleInvalidToken()
    if (resp.ok) {
      const result = await resp.json()
      const items  = Array.isArray(result) ? result : result.data ?? result.rows ?? []
      users.value  = items.map(u => ({
        id:         u.uid || u.id,
        username:   u.username,
        role:       u.role || '',
        is_active:  u.is_active ?? true,
        created_at: u.created_at || '',
      }))
    }
  } catch (err) {
    console.error('Erreur chargement utilisateurs:', err)
  } finally {
    loading.value = false
  }
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openModal(type, data = null) {
  errors.value     = {}
  showPassword.value = false
  modal.value = { show: true, type, data }
  if (type === 'edit' && data) {
    form.value = { username: data.username, role: data.role, password: '' }
  } else if (type === 'create') {
    form.value = { username: '', role: '', password: '' }
  }
}
function closeModal() { modal.value.show = false }
function confirmDelete(u) { openModal('delete', u) }

// ── Validation ────────────────────────────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.username?.trim()) e.username = 'Le nom d\'utilisateur est requis'
  if (!form.value.role)             e.role     = 'Le rôle est requis'
  if (modal.value.type === 'create' && !form.value.password)
    e.password = 'Le mot de passe est requis'
  if (form.value.password && form.value.password.length < 6)
    e.password = 'Le mot de passe doit contenir au moins 6 caractères'
  errors.value = e
  return Object.keys(e).length === 0
}

// ── Sauvegarde ────────────────────────────────────────────────────────────────
async function saveForm() {
  if (!validate()) return
  const token = localStorage.getItem('token')
  if (!token) return handleInvalidToken()
  saving.value = true
  try {
    const payload = { username: form.value.username, role: form.value.role }
    if (form.value.password) payload.password = form.value.password

    const isEdit = modal.value.type === 'edit'
    const url    = isEdit ? `${apiBase}/${modal.value.data.id}` : apiBase
    const method = isEdit ? 'PUT' : 'POST'

    const resp = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    const data = await resp.json()
    if (!resp.ok) {
      if (resp.status === 409) errors.value.username = data.message
      else throw new Error(data.message || 'Erreur serveur')
      return
    }
    await loadUsers()
    closeModal()
    alert(`✅ Utilisateur ${isEdit ? 'modifié' : 'créé'} avec succès`)
  } catch (err) {
    console.error(err)
    alert('Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  const token = localStorage.getItem('token')
  if (!token) return handleInvalidToken()
  saving.value = true
  try {
    const resp = await fetch(`${apiBase}/${modal.value.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (!resp.ok) throw new Error('Erreur serveur')
    users.value = users.value.filter(u => u.id !== modal.value.data.id)
    closeModal()
    alert('✅ Utilisateur supprimé')
  } catch (err) {
    console.error(err)
    alert('Impossible de supprimer l\'utilisateur')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  const stored = localStorage.getItem('user')
  if (stored) currentUser.value = JSON.parse(stored)
  loadUsers()
})
</script>

<style scoped>
.users-page { display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
.page-header p  { color: var(--text-muted); font-size: 13px; margin-top: 2px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border); padding: 9px 16px;
  border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.btn-outline:hover { border-color: var(--text-muted); color: var(--text-primary); }

.btn-danger {
  background: var(--danger); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* Filtres */
.filters-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.search-input {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-card); border: 1px solid var(--border);
  padding: 8px 12px; border-radius: var(--radius-sm); flex: 1; min-width: 200px;
}
.search-input svg { color: var(--text-muted); flex-shrink: 0; }
.search-input input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; width: 100%; }
.filter-select {
  background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);
  padding: 8px 10px; border-radius: var(--radius-sm); font-size: 13px; outline: none;
}
.filter-select:focus { border-color: var(--border-accent); }
.filter-select.compact { width: auto; }

/* Table */
.table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); white-space: nowrap; }
.data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-primary); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg-hover); }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--text-primary); }
.sort-icon { font-size: 10px; margin-left: 4px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
.muted { color: var(--text-secondary); }

/* Cellule utilisateur */
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar-sm {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(59,130,246,0.15); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}

/* Badges rôle */
.role-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.role-badge.agent       { background: rgba(59,130,246,0.12);  color: #3b82f6; }
.role-badge.superviseur { background: rgba(139,92,246,0.12);  color: #8b5cf6; }
.role-badge.manager     { background: rgba(6,182,212,0.12);   color: #06b6d4; }
.role-badge.inspecteur  { background: rgba(245,158,11,0.12);  color: #f59e0b; }
.role-badge.admin       { background: rgba(239,68,68,0.12);   color: #ef4444; }
.role-badge.super_admin { background: rgba(16,185,129,0.12);  color: #10b981; }

/* Badge actif/inactif */
.actif-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.actif-badge.actif   { background: rgba(16,185,129,0.12); color: #10b981; }
.actif-badge.inactif { background: rgba(148,163,184,0.1); color: #94a3b8; }

/* Actions */
.action-btns { display: flex; gap: 4px; }
/* .action-btn {
  width: 30px; height: 30px; border: 1px solid var(--border); border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  background: none; cursor: pointer; transition: all 0.15s;
}
.action-btn.detail { color: var(--accent); }
.action-btn.detail:hover { background: rgba(59,130,246,0.12); border-color: var(--border-accent); }
.action-btn.edit   { color: var(--warning); }
.action-btn.edit:hover { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); }
.action-btn.delete { color: var(--danger); }
.action-btn.delete:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); } */
.action-btn {
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; color: var(--text-muted);
}
.action-btn.detail:hover  { background: rgba(59,130,246,0.1);  color: #3b82f6; border-color: rgba(59,130,246,0.3); }
.action-btn.edit:hover   { background: rgba(245,158,11,0.1);  color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.action-btn.delete:hover { background: rgba(239,68,68,0.1);   color: #ef4444; border-color: rgba(239,68,68,0.3); }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
.pagination-info { font-size: 12px; color: var(--text-muted); }
.pagination-controls { display: flex; gap: 4px; }
.page-btn {
  min-width: 30px; height: 30px; padding: 0 8px; border: 1px solid var(--border);
  background: none; color: var(--text-secondary); border-radius: 6px;
  font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: var(--border-accent); color: var(--accent); }
.page-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border); }
.modal-header h2 { font-size: 16px; font-weight: 700; }
.modal-header.danger { border-bottom-color: rgba(239,68,68,0.3); }
.modal-header.danger h2 { color: var(--danger); }
.modal-close { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; line-height: 1; }
.modal-body  { padding: 20px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid var(--border); }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.form-group input, .form-group select {
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); padding: 9px 12px; border-radius: var(--radius-sm);
  font-size: 13px; outline: none; transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus { border-color: var(--border-accent); }
.error-border { border-color: var(--danger) !important; }
.error-msg { font-size: 11px; color: var(--danger); }
.required { color: var(--danger); margin-left: 2px; }
.optional { color: var(--text-muted); font-weight: 400; font-size: 11px; margin-left: 4px; }

.password-wrap { position: relative; }
.password-wrap input { width: 100%; padding-right: 38px; box-sizing: border-box; }
.toggle-password {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;
}
.toggle-password:hover { color: var(--text-primary); }

/* Détail profil */
.user-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-sm); }
.user-avatar-lg {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(59,130,246,0.15); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; flex-shrink: 0;
}
.user-profile-info h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
.detail-value { font-size: 13px; color: var(--text-primary); }

/* Suppression */
.delete-confirm { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: 10px 0; }
.delete-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(239,68,68,0.1); color: var(--danger); display: flex; align-items: center; justify-content: center; }
.delete-warning { font-size: 12px; color: var(--danger); }

/* Spinner */
.spinner-sm { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <div class="requetes-page">
    <div class="page-header">
      <div>
        <h1>liste des types de requetes</h1>
        <p>{{ filteredRequetes.length }} types trouvés</p>
      </div>
      <button class="btn-primary" @click="openModal('create')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nouveau type de requete
      </button>
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="search-input">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher par code ou libellé..." />
      </div>
      <!-- <button class="btn-outline" @click="search=''">
        Réinitialiser
      </button> -->
    </div>

    <!-- Table -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <!-- <th>
              <input type="checkbox" @change="toggleAll" :checked="allSelected" class="checkbox" />
            </th> -->
            <th @click="sortBy('code')" class="sortable">
              Code <span class="sort-icon">{{ sortKey === 'code' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('libelle')" class="sortable">
              Libellé <span class="sort-icon">{{ sortKey === 'libelle' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedRequetes.length === 0">
            <td colspan="4" class="empty-state">Aucun type d'appel trouvé.</td>
          </tr>
          <tr v-for="type in paginatedRequetes" :key="type.code" :class="{ selected: selectedIds.includes(type.code) }">
            <!-- <td>
              <input type="checkbox" v-model="selectedIds" :value="type.code" class="checkbox" />
            </td> -->
            <td class="id-cell">#{{ type.code }}</td>
            <td class="typeappel-cell">{{ type.libelle }}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" title="Éditer" @click="openModal('edit', type)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
                <button class="action-btn delete" title="Supprimer" @click="confirmDelete(type)">
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

      <!-- Pagination -->
      <div class="pagination">
        <span class="pagination-info">
          {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredRequetes.length) }} sur {{ filteredRequetes.length }}
        </span>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
          <button
            v-for="p in totalPages" :key="p"
            class="page-btn"
            :class="{ active: p === currentPage }"
            @click="currentPage = p"
          >{{ p }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
        </div>
        <select v-model="perPage" class="filter-select compact">
          <option :value="5">5 / page</option>
          <option :value="10">10 / page</option>
          <option :value="25">25 / page</option>
        </select>
      </div>
    </div>

    <!-- Bulk actions bar -->
    <transition name="fade">
      <div class="bulk-bar" v-if="selectedIds.length > 0">
        <span>{{ selectedIds.length }} sélectionné(s)</span>
        <button class="bulk-btn danger" @click="deleteSelected">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Supprimer
        </button>
        <button class="bulk-btn" @click="selectedIds = []">Annuler</button>
      </div>
    </transition>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="modal.show" @click.self="closeModal">
          <div class="modal" :class="modal.type">
            <!-- Edit / Create Modal -->
            <template v-if="modal.type === 'edit' || modal.type === 'create'">
              <div class="modal-header">
                <h2>{{ modal.type === 'edit' ? 'Éditer le type' : 'Nouveau type d\'appel' }}</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group full">
                    <label>Code *</label>
                    <input v-model="form.code" type="text" placeholder="ex: REQ01" :disabled="modal.type === 'edit'" />
                  </div>
                  <div class="form-group full">
                    <label>Libellé *</label>
                    <input v-model="form.libelle" type="text" placeholder="ex: Démande d'information" />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-primary" @click="saveForm" :disabled="loading">
                  {{ loading ? 'Chargement...' : (modal.type === 'edit' ? 'Enregistrer' : 'Créer') }}
                </button>
              </div>
            </template>

            <!-- Delete Modal -->
            <template v-else-if="modal.type === 'delete'">
              <div class="modal-header danger">
                <h2>Supprimer le type</h2>
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
                  <p>Êtes-vous sûr de vouloir supprimer le type <strong>#{{ modal.data?.code }}</strong> <strong>{{ modal.data?.libelle }}</strong> ?</p>
                  <p class="delete-warning">Cette action est irréversible.</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete" :disabled="loading">{{ loading ? 'Chargement...' : 'Supprimer définitivement' }}</button>
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
const apiTypeAppel = API_BASE + '/api/typeRequete'

const requetes = ref([])
const search = ref('')
const sortKey = ref('code')
const sortDir = ref('asc')
const currentPage = ref(1)
const perPage = ref(10)
const selectedIds = ref([])
const loading = ref(false)
const error = ref(null)

// Load types from API
const loadTypeRequetes = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Token manquant'
      return
    }
    
    const response = await fetch(apiTypeAppel, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      requetes.value = result.data || []
    } else {
      error.value = 'Erreur lors du chargement'
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTypeRequetes()
})

const filteredRequetes = computed(() => {
  let list = requetes.value
  if (search.value) {
    const s = search.value.toLowerCase().trim()
    list = list.filter(a => {
      // S'assurer que code et libelle sont des chaînes
      const code = String(a.code || '').toLowerCase()
      const libelle = String(a.libelle || '').toLowerCase()
      return code.includes(s) || libelle.includes(s)
    })
  }
  return [...list].sort((a, b) => {
    let va = a[sortKey.value], vb = b[sortKey.value]
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
})

const totalPages = computed(() => Math.ceil(filteredRequetes.value.length / perPage.value))
const paginatedRequetes = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredRequetes.value.slice(start, start + perPage.value)
})

watch([search, perPage], () => { currentPage.value = 1 })

function sortBy(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const allSelected = computed(() => paginatedRequetes.value.length > 0 && paginatedRequetes.value.every(a => selectedIds.value.includes(a.code)))
function toggleAll(e) {
  if (e.target.checked) selectedIds.value = [...new Set([...selectedIds.value, ...paginatedRequetes.value.map(a => a.code)])]
  else selectedIds.value = selectedIds.value.filter(id => !paginatedRequetes.value.map(a => a.code).includes(id))
}

async function deleteSelected() {
  for (const code of selectedIds.value) {
    await deleteTypeAppel(code)
  }
  selectedIds.value = []
  await loadTypeRequetes()
}

// Modal
const modal = ref({ show: false, type: '', data: null })
const form = ref({})

function openModal(type, data = null) {
  modal.value = { show: true, type, data }
  if (type === 'edit' && data) form.value = { ...data }
  else if (type === 'create') form.value = { code: '', libelle: '' }
}
function closeModal() { modal.value.show = false }

function confirmDelete(type) { openModal('delete', type) }

async function doDelete() {
  if (!modal.value.data?.code) return
  await deleteTypeAppel(modal.value.data.code)
  closeModal()
  await loadTypeRequetes()
}

async function deleteTypeAppel(code) {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${apiTypeAppel}/${code}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression')
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function saveForm() {
  if (!form.value.code || !form.value.libelle) {
    alert('Le code et le libellé sont requis')
    return
  }

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const isEdit = modal.value.type === 'edit'
    const method = isEdit ? 'PUT' : 'POST'
    const url = isEdit ? `${apiTypeAppel}/${form.value.code}` : apiTypeAppel

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: form.value.code,
        libelle: form.value.libelle
      }),
      credentials: 'include'
    })

    if (response.ok) {
      closeModal()
      await loadTypeRequetes()
    } else {
      const result = await response.json()
      error.value = result.message || 'Erreur lors de l\'enregistrement'
      alert(error.value)
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = err.message
    alert(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.requetes-page { display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
.page-header p { color: var(--text-muted); font-size: 13px; margin-top: 2px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; transition: all 0.2s;
}
.btn-primary:hover { background: #2563eb; }

.btn-outline {
  background: none; border: 1px solid var(--border);
  color: var(--text-secondary); padding: 9px 16px;
  border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: var(--border-accent); color: var(--text-primary); }

.btn-danger {
  background: var(--danger); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; transition: all 0.2s;
}
.btn-danger:hover { background: #dc2626; }

.filters-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 9px 14px;
  color: var(--text-muted); flex: 1; min-width: 220px;
  transition: border-color 0.2s;
}
.search-input:focus-within { border-color: var(--border-accent); }
.search-input input { background: none; border: none; outline: none; color: var(--text-secondary); font-size: 13px; flex: 1; }

.filter-select {
  background: var(--bg-card); border: 1px solid var(--border);
  color: var(--text-secondary); padding: 9px 14px;
  border-radius: var(--radius-sm); font-size: 13px; outline: none;
}
.filter-select.compact { padding: 7px 10px; font-size: 12px; }

/* Table */
.table-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 16px; text-align: left;
  font-size: 11px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.data-table th.sortable { cursor: pointer; user-select: none; }
.data-table th.sortable:hover { color: var(--text-primary); }
.sort-icon { opacity: 0.4; margin-left: 4px; font-size: 10px; }

.data-table td {
  padding: 13px 16px; border-bottom: 1px solid var(--border);
  font-size: 13px; color: var(--text-secondary); white-space: nowrap;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.data-table tr.selected td { background: rgba(59,130,246,0.06); }

.checkbox { width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; }
.id-cell { font-weight: 700; color: var(--text-primary); font-family: monospace; font-size: 12px; }
.mono { font-family: monospace; font-size: 12px; }
.muted { color: var(--text-muted); font-size: 12px; }

/* .typeappel-cell { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 500; }  */
.typeappel-cell{ font-weight: 700; color: var(--text-primary); font-family: monospace; font-size: 12px; }
.typeappel-avatar {
  width: 28px; height: 28px; border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}

.type-badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.type-badge.entrant { background: rgba(16,185,129,0.1); color: #10b981; }
.type-badge.sortant { background: rgba(59,130,246,0.1); color: #3b82f6; }

.status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.status-badge.resolu { background: rgba(16,185,129,0.12); color: #10b981; }
.status-badge.encours { background: rgba(59,130,246,0.12); color: #3b82f6; }
.status-badge.attente { background: rgba(245,158,11,0.12); color: #f59e0b; }
.status-badge.annule { background: rgba(239,68,68,0.12); color: #ef4444; }

.action-btns { display: flex; gap: 4px; }
.action-btn {
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; color: var(--text-muted);
}
.action-btn.roles:hover  { background: rgba(59,130,246,0.1);  color: #3b82f6; border-color: rgba(59,130,246,0.3); }
.action-btn.edit:hover   { background: rgba(245,158,11,0.1);  color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.action-btn.delete:hover { background: rgba(239,68,68,0.1);   color: #ef4444; border-color: rgba(239,68,68,0.3); }

/* Pagination */
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-top: 1px solid var(--border);
  flex-wrap: wrap; gap: 10px;
}
.pagination-info { font-size: 12px; color: var(--text-muted); }
.pagination-controls { display: flex; gap: 4px; }
.page-btn {
  width: 32px; height: 32px; border: 1px solid var(--border);
  background: none; color: var(--text-secondary); border-radius: var(--radius-sm);
  font-size: 13px; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; cursor: pointer;
}
.page-btn:hover:not(:disabled) { border-color: var(--border-accent); color: var(--text-primary); }
.page-btn.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 600; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Bulk bar */
.bulk-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--bg-card); border: 1px solid var(--border-accent);
  border-radius: var(--radius); padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow), var(--shadow-accent);
  font-size: 13px; font-weight: 600; z-index: 300;
}
.bulk-btn {
  padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
  display: flex; align-items: center; gap: 5px; transition: all 0.2s; border: none;
  cursor: pointer;
}
.bulk-btn.danger { background: rgba(239,68,68,0.15); color: var(--danger); }
.bulk-btn.danger:hover { background: rgba(239,68,68,0.25); }
.bulk-btn:not(.danger) { background: var(--bg-hover); color: var(--text-secondary); }

/* Empty */
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); width: 100%; max-width: 580px;
  box-shadow: var(--shadow); max-height: 90vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
.modal-header.danger h2 { color: var(--danger); }
.modal-id { color: var(--text-muted); font-weight: 500; }
.modal-close {
  background: none; border: none; color: var(--text-muted);
  font-size: 18px; cursor: pointer; width: 30px; height: 30px;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }

.modal-body { padding: 24px; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.detail-notes { border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 6px; }
.detail-notes p { font-size: 13px; color: var(--text-secondary); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.form-group input, .form-group select, .form-group textarea {
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); padding: 9px 12px;
  border-radius: var(--radius-sm); font-size: 13px; outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--border-accent);
}
.form-group textarea { resize: vertical; }

.delete-confirm {
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: 8px 0;
}
.delete-icon {
  width: 60px; height: 60px; background: rgba(239,68,68,0.12); color: var(--danger);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.delete-confirm p { color: var(--text-secondary); font-size: 14px; }
.delete-confirm strong { color: var(--text-primary); }
.delete-warning { font-size: 12px; color: var(--danger); font-weight: 500; }

.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 16px 24px; border-top: 1px solid var(--border);
}
</style>

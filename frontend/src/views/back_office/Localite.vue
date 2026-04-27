<template>
  <div class="appels-page">
    <div class="page-header">
      <div>
        <h1>Gestion des Appels</h1>
        <p>{{ filteredAppels.length }} appels trouvés</p>
      </div>
      <button class="btn-primary" @click="openModal('create')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nouvel appel
      </button>
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="search-input">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher par nom, numéro..." />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Tous les statuts</option>
        <option value="resolu">Résolu</option>
        <option value="encours">En cours</option>
        <option value="attente">En attente</option>
        <option value="annule">Annulé</option>
      </select>
      <select v-model="filterType" class="filter-select">
        <option value="">Tous les types</option>
        <option value="entrant">Entrant</option>
        <option value="sortant">Sortant</option>
      </select>
      <button class="btn-outline" @click="search=''; filterStatus=''; filterType=''">
        Réinitialiser
      </button>
    </div>

    <!-- Table -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" @change="toggleAll" :checked="allSelected" class="checkbox" />
            </th>
            <th @click="sortBy('id')" class="sortable">
              ID <span class="sort-icon">{{ sortKey === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('caller')" class="sortable">
              Appelant <span class="sort-icon">{{ sortKey === 'caller' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Numéro</th>
            <th>Type</th>
            <th @click="sortBy('duration')" class="sortable">
              Durée <span class="sort-icon">{{ sortKey === 'duration' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Statut</th>
            <th @click="sortBy('date')" class="sortable">
              Date <span class="sort-icon">{{ sortKey === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Agent</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedAppels.length === 0">
            <td colspan="10" class="empty-state">Aucun appel trouvé.</td>
          </tr>
          <tr v-for="appel in paginatedAppels" :key="appel.id" :class="{ selected: selectedIds.includes(appel.id) }">
            <td>
              <input type="checkbox" v-model="selectedIds" :value="appel.id" class="checkbox" />
            </td>
            <td class="id-cell">#{{ appel.id }}</td>
            <td class="caller-cell">
              <div class="caller-avatar">{{ appel.caller.charAt(0) }}</div>
              {{ appel.caller }}
            </td>
            <td class="mono">{{ appel.phone }}</td>
            <td>
              <span class="type-badge" :class="appel.type">
                {{ appel.type === 'entrant' ? '↙ Entrant' : '↗ Sortant' }}
              </span>
            </td>
            <td>{{ appel.duration }}</td>
            <td><span class="status-badge" :class="appel.status">{{ statusLabels[appel.status] }}</span></td>
            <td class="muted">{{ appel.date }}</td>
            <td class="muted">{{ appel.agent }}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn detail" title="Détail" @click="openModal('detail', appel)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="action-btn edit" title="Éditer" @click="openModal('edit', appel)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
                <button class="action-btn delete" title="Supprimer" @click="confirmDelete(appel)">
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
          {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredAppels.length) }} sur {{ filteredAppels.length }}
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
            <!-- Detail Modal -->
            <template v-if="modal.type === 'detail'">
              <div class="modal-header">
                <h2>Détail de l'appel <span class="modal-id">#{{ modal.data?.id }}</span></h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="detail-grid">
                  <div class="detail-item" v-for="field in detailFields" :key="field.key">
                    <span class="detail-label">{{ field.label }}</span>
                    <span class="detail-value">
                      <span v-if="field.key === 'status'" class="status-badge" :class="modal.data?.[field.key]">
                        {{ statusLabels[modal.data?.[field.key]] }}
                      </span>
                      <span v-else>{{ modal.data?.[field.key] }}</span>
                    </span>
                  </div>
                </div>
                <div class="detail-notes" v-if="modal.data?.notes">
                  <span class="detail-label">Notes</span>
                  <p>{{ modal.data.notes }}</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Fermer</button>
                <button class="btn-primary" @click="openModal('edit', modal.data); ">Éditer</button>
              </div>
            </template>

            <!-- Edit / Create Modal -->
            <template v-else-if="modal.type === 'edit' || modal.type === 'create'">
              <div class="modal-header">
                <h2>{{ modal.type === 'edit' ? 'Éditer l\'appel' : 'Nouvel appel' }}</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Appelant *</label>
                    <input v-model="form.caller" type="text" placeholder="Nom complet" />
                  </div>
                  <div class="form-group">
                    <label>Numéro</label>
                    <input v-model="form.phone" type="text" placeholder="+33 6 XX XX XX XX" />
                  </div>
                  <div class="form-group">
                    <label>Type</label>
                    <select v-model="form.type">
                      <option value="entrant">Entrant</option>
                      <option value="sortant">Sortant</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select v-model="form.status">
                      <option value="resolu">Résolu</option>
                      <option value="encours">En cours</option>
                      <option value="attente">En attente</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Durée</label>
                    <input v-model="form.duration" type="text" placeholder="ex: 4m 30s" />
                  </div>
                  <div class="form-group">
                    <label>Agent</label>
                    <input v-model="form.agent" type="text" placeholder="Nom de l'agent" />
                  </div>
                  <div class="form-group full">
                    <label>Notes</label>
                    <textarea v-model="form.notes" rows="3" placeholder="Observations, résumé..."></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-primary" @click="saveForm">
                  {{ modal.type === 'edit' ? 'Enregistrer' : 'Créer' }}
                </button>
              </div>
            </template>

            <!-- Delete Modal -->
            <template v-else-if="modal.type === 'delete'">
              <div class="modal-header danger">
                <h2>Supprimer l'appel</h2>
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
                  <p>Êtes-vous sûr de vouloir supprimer l'appel <strong>#{{ modal.data?.id }}</strong> de <strong>{{ modal.data?.caller }}</strong> ?</p>
                  <p class="delete-warning">Cette action est irréversible.</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete">Supprimer définitivement</button>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const statusLabels = { resolu: 'Résolu', encours: 'En cours', attente: 'En attente', annule: 'Annulé' }
const detailFields = [
  { key: 'id', label: 'ID' }, { key: 'caller', label: 'Appelant' },
  { key: 'phone', label: 'Numéro' }, { key: 'type', label: 'Type' },
  { key: 'duration', label: 'Durée' }, { key: 'status', label: 'Statut' },
  { key: 'date', label: 'Date' }, { key: 'agent', label: 'Agent' },
]

const appels = ref([
  { id: 4521, caller: 'Marie Dupont', phone: '+33 6 12 34 56 78', type: 'entrant', duration: '5m 12s', status: 'resolu', date: '28/02/2025 14:32', agent: 'Sophie L.', notes: 'Client satisfait, problème résolu.' },
  { id: 4520, caller: 'Jean Martin', phone: '+33 7 23 45 67 89', type: 'sortant', duration: '2m 45s', status: 'encours', date: '28/02/2025 14:10', agent: 'Marc D.', notes: '' },
  { id: 4519, caller: 'Sophie Leroy', phone: '+33 6 34 56 78 90', type: 'entrant', duration: '8m 03s', status: 'attente', date: '28/02/2025 13:55', agent: 'Paul B.', notes: 'Rappel nécessaire demain matin.' },
  { id: 4518, caller: 'Paul Bernard', phone: '+33 6 45 67 89 01', type: 'entrant', duration: '1m 20s', status: 'annule', date: '28/02/2025 13:30', agent: 'Sophie L.', notes: '' },
  { id: 4517, caller: 'Lucie Moreau', phone: '+33 7 56 78 90 12', type: 'sortant', duration: '6m 50s', status: 'resolu', date: '28/02/2025 12:00', agent: 'Marc D.', notes: 'Commande confirmée.' },
  { id: 4516, caller: 'Thomas Petit', phone: '+33 6 67 89 01 23', type: 'entrant', duration: '3m 22s', status: 'attente', date: '28/02/2025 11:45', agent: 'Paul B.', notes: '' },
  { id: 4515, caller: 'Clara Simon', phone: '+33 6 78 90 12 34', type: 'sortant', duration: '9m 01s', status: 'resolu', date: '28/02/2025 10:30', agent: 'Sophie L.', notes: '' },
  { id: 4514, caller: 'Antoine Roux', phone: '+33 7 89 01 23 45', type: 'entrant', duration: '4m 15s', status: 'encours', date: '28/02/2025 09:15', agent: 'Marc D.', notes: '' },
  { id: 4513, caller: 'Emma Laurent', phone: '+33 6 90 12 34 56', type: 'entrant', duration: '7m 33s', status: 'resolu', date: '27/02/2025 17:00', agent: 'Paul B.', notes: '' },
  { id: 4512, caller: 'Hugo Michel', phone: '+33 6 01 23 45 67', type: 'sortant', duration: '2m 10s', status: 'annule', date: '27/02/2025 16:40', agent: 'Sophie L.', notes: 'Pas de réponse.' },
  { id: 4511, caller: 'Camille Robert', phone: '+33 7 12 34 56 78', type: 'entrant', duration: '5m 55s', status: 'resolu', date: '27/02/2025 15:20', agent: 'Marc D.', notes: '' },
  { id: 4510, caller: 'Léa Fournier', phone: '+33 6 23 45 67 89', type: 'sortant', duration: '11m 00s', status: 'attente', date: '27/02/2025 14:00', agent: 'Paul B.', notes: 'Dossier complexe.' },
])

const search = ref('')
const filterStatus = ref('')
const filterType = ref('')
const sortKey = ref('id')
const sortDir = ref('desc')
const currentPage = ref(1)
const perPage = ref(10)
const selectedIds = ref([])

const filteredAppels = computed(() => {
  let list = appels.value
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(a => a.caller.toLowerCase().includes(s) || a.phone.includes(s) || String(a.id).includes(s))
  }
  if (filterStatus.value) list = list.filter(a => a.status === filterStatus.value)
  if (filterType.value) list = list.filter(a => a.type === filterType.value)
  return [...list].sort((a, b) => {
    let va = a[sortKey.value], vb = b[sortKey.value]
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
})

const totalPages = computed(() => Math.ceil(filteredAppels.value.length / perPage.value))
const paginatedAppels = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAppels.value.slice(start, start + perPage.value)
})

watch([search, filterStatus, filterType, perPage], () => { currentPage.value = 1 })

function sortBy(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const allSelected = computed(() => paginatedAppels.value.length > 0 && paginatedAppels.value.every(a => selectedIds.value.includes(a.id)))
function toggleAll(e) {
  if (e.target.checked) selectedIds.value = [...new Set([...selectedIds.value, ...paginatedAppels.value.map(a => a.id)])]
  else selectedIds.value = selectedIds.value.filter(id => !paginatedAppels.value.map(a => a.id).includes(id))
}
function deleteSelected() {
  appels.value = appels.value.filter(a => !selectedIds.value.includes(a.id))
  selectedIds.value = []
}

// Modal
const modal = ref({ show: false, type: '', data: null })
const form = ref({})

function openModal(type, data = null) {
  modal.value = { show: true, type, data }
  if (type === 'edit' && data) form.value = { ...data }
  else if (type === 'create') form.value = { caller: '', phone: '', type: 'entrant', status: 'encours', duration: '', agent: '', notes: '' }
}
function closeModal() { modal.value.show = false }

function confirmDelete(appel) { openModal('delete', appel) }
function doDelete() {
  appels.value = appels.value.filter(a => a.id !== modal.value.data.id)
  closeModal()
}

function saveForm() {
  if (modal.value.type === 'edit') {
    const idx = appels.value.findIndex(a => a.id === form.value.id)
    if (idx !== -1) appels.value[idx] = { ...form.value }
  } else {
    const newId = Math.max(...appels.value.map(a => a.id)) + 1
    appels.value.unshift({ ...form.value, id: newId, date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) })
  }
  closeModal()
}
</script>

<style scoped>
.appels-page { display: flex; flex-direction: column; gap: 20px; }

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

.caller-cell { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 500; }
.caller-avatar {
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
  width: 30px; height: 30px; border: 1px solid var(--border);
  border-radius: 7px; display: flex; align-items: center; justify-content: center;
  background: none; transition: all 0.15s;
}
.action-btn.detail { color: var(--accent); }
.action-btn.detail:hover { background: rgba(59,130,246,0.12); border-color: var(--border-accent); }
.action-btn.edit { color: var(--warning); }
.action-btn.edit:hover { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); }
.action-btn.delete { color: var(--danger); }
.action-btn.delete:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); }

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

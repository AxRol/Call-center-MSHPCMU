<template>
  <div class="tickets-page">
    <div class="page-header">
      <div>
        <h1>liste des Tickets</h1>
        <p>{{ filteredTickets.length }} tickets trouvés</p>
      </div>
      <!-- <button class="btn-primary" @click="openModal('create')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nouvel appel
      </button> -->
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="search-input">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher par code, telephone et requete" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" @change="toggleAll" :checked="allSelected" class="checkbox" />
              </th>
              <!-- <th @click="sortBy('id')" class="sortable"> ID <span class="sort-icon">{{ sortKey === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span> </th> -->
              <th>Code</th>
              <th>Numero d'appel</th>
              <!-- <th>Requete</th> -->
              <th @click="sortBy('requete')" class="sortable">Requete<span class="sort-icon">{{ sortKey === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span></th>
              <th>Motif de creation</th>
              <th @click="sortBy('date')" class="sortable">Crée par <span class="sort-icon">{{ sortKey === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span></th>
               <th>Date de création</th>
              <th @click="sortBy('Statut')" class="sortable"> Statut <span class="sort-icon">{{ sortKey === 'Statut' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span> </th>
              <th @click="sortBy('Priorite')" class="sortable"> Priorité <span class="sort-icon">{{ sortKey === 'Priorite' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span> </th>
              <th>Assigné à</th>
              <th>Note</th>
              <th>Traité le</th>
              <th>Traité par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedTickets.length === 0">
              <td colspan="10" class="empty-state">Aucun ticket trouvé.</td>
            </tr>
            <tr v-for="tickets in paginatedTickets" :key="tickets.id" :class="{ selected: selectedIds.includes(tickets.id) }">
              <td> <input type="checkbox" v-model="selectedIds" :value="tickets.id" class="checkbox" /> </td>
              <!-- <td class="id-cell">#{{ tickets.id }}</td> -->
              <td class="id-cell">{{ tickets.code }}</td>
              <td class="id-cell">{{ tickets.telephone }}</td>
              <td class="id-cell">{{ tickets.requete }}</td>
              <td class="id-cell">{{ tickets.raison }}</td>
              <td class="id-cell">{{ tickets.créé_par }}</td>
              <td class="id-cell">{{ tickets.date_crea }}</td>
              <td class="id-cell">{{ tickets.statut }}</td>
              <td class="id-cell">{{ tickets.priorite }}</td>
              <td class="id-cell">{{ tickets.assigne_a }}</td>
              <td class="id-cell">{{ tickets.resolution }}</td>
              <td class="id-cell">{{ tickets.date_traitement }}</td>
              <td class="id-cell">{{ tickets.traite_par }}</td>
              
              <td>
                <div class="action-btns">
                  <button class="action-btn detail" title="Détail" @click="openModal('detail', tickets)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button class="action-btn edit" title="Éditer" @click="openModal('edit', tickets)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button> 
                  <!-- Ajouter ce bouton dans .action-btns après le bouton edit -->
                  <button class="action-btn assign" title="Attribuer" @click="openModal('assign', tickets)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button class="action-btn delete" title="Supprimer" @click="confirmDelete(tickets)">
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
          {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredTickets.length) }} sur {{ filteredTickets.length }}
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
                <h2>Détail du ticket <span class="modal-id">#{{ modal.data?.id }}</span></h2>
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
<!--                 <div class="detail-notes" v-if="modal.data?.notes">
                  <span class="detail-label">Notes</span>
                  <p>{{ modal.data.notes }}</p>
                </div> -->
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Fermer</button>
                <button class="btn-primary" @click="openModal('edit', modal.data); ">Éditer</button>
              </div>
            </template>

            <!-- Edit Modal -->
            <template v-else-if="modal.type === 'edit'">
              <div class="modal-header">
                <h2>Éditer le ticket</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Code</label>
                    <input v-model="form.code" type="text" placeholder="Code ticket" :disabled="modal.type === 'edit'" />
                  </div>
                  <div class="form-group">
                    <label>Numéro appellant</label>
                    <input v-model="form.telephone" type="text" placeholder="Numéro de téléphone" :disabled="modal.type === 'edit'" />
                  </div>
                  <div class="form-group">
                    <label>Requête</label>
                    <input v-model="form.requete" type="text" placeholder="Type de requête" :disabled="modal.type === 'edit'"/>
                  </div>
                  <div class="form-group full">
                    <label>Motif de création</label>
                    <textarea v-model="form.raison" rows="3" placeholder="Motif de création du ticket..." :disabled="modal.type === 'edit'"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Créé par</label>
                    <input v-model="form.créé_par" type="text" placeholder="Nom de l'agent" :disabled="modal.type === 'edit'" />
                  </div>
                  <div class="form-group">
                    <label>Date de création</label>
                    <input v-model="form.date_crea" type="text" placeholder="Date de création" :disabled="modal.type === 'edit'" />
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select v-model="form.statut">
                      <option value="">-- Sélectionner --</option>
                      <option value="ouvert">Ouvert</option>
                      <option value="en attente">En attente</option>
                      <option value="clos">Clos</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Priorité</label>
                    <select v-model="form.priorite">
                      <option value="">-- Sélectionner --</option>
                      <option value="basse">Basse</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="haute">Haute</option>
                      <option value="critique">Critique</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Assigné à</label>
                    <input v-model="form.assigne_a" type="text" placeholder="Agent assigné" :disabled="modal.type === 'edit'"/>
                  </div>
                  <div class="form-group full">
                    <label>Note sur le ticket</label>
                    <textarea v-model="form.resolution" rows="4" placeholder="Note sur le ticket..."></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-primary" @click="saveForm">Enregistrer </button>
              </div>
            </template> 

            <!-- Delete Modal -->
            <template v-else-if="modal.type === 'delete'">
              <div class="modal-header danger">
                <h2>Supprimer l'ticket</h2>
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
                  <p>Êtes-vous sûr de vouloir supprimer l'ticket <strong>#{{ modal.data?.code }}</strong> ?</p>
                  <p class="delete-warning">Cette action est irréversible.</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete">Supprimer définitivement</button>
              </div>
            </template>

            <!-- Assign Modal -->
            <template v-else-if="modal.type === 'assign'">
              <div class="modal-header">
                <h2>Attribuer le ticket <span class="modal-id">{{ modal.data?.code }}</span></h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">

                <!-- Infos du ticket (lecture seule) -->
                <div class="assign-ticket-info">
                  <div class="assign-info-row">
                    <span class="detail-label">Code</span>
                    <span class="detail-value">{{ modal.data?.code }}</span>
                  </div>
                  <div class="assign-info-row">
                    <span class="detail-label">Requête</span>
                    <span class="detail-value">{{ modal.data?.requete }}</span>
                  </div>
                  <div class="assign-info-row">
                    <span class="detail-label">Statut actuel</span>
                    <span class="detail-value">
                      <span class="statut-pill" :class="modal.data?.statut">{{ modal.data?.statut || 'N/A' }}</span>
                    </span>
                  </div>
                  <div class="assign-info-row">
                    <span class="detail-label">Priorité</span>
                    <span class="detail-value">
                      <span class="priorite-pill" :class="modal.data?.priorite">{{ modal.data?.priorite || 'N/A' }}</span>
                    </span>
                  </div>
                </div>

                <div class="assign-divider">
                  <span>Attribution</span>
                </div>

                <div class="form-grid">
                  <div class="form-group full">
                    <label>Sélectionner un agent <span style="color:var(--danger)">*</span></label>
                    <select v-model="assignForm.user_assigne_id">
                      <option value="">-- Sélectionner un agent --</option>
                      <option v-for="agent in agentsList" :key="agent.id" :value="agent.id">
                        {{ agent.username }} — {{ agent.role }}
                      </option>
                    </select>
                  </div>
                </div>
                <!-- Assignation actuelle -->
                <div class="assign-current" v-if="modal.data?.assigne_a">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Actuellement assigné à : <strong>{{ modal.data?.assigne_a }}</strong>
                </div>

              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-assign" @click="saveAssign" :disabled="!assignForm.user_assigne_id || assignForm.statut === 'clos' || assignForm.statut === 'ouvert'" >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Attribuer le ticket
                </button>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const apiBase = 'http://localhost:5170/api/ticket'

const statusLabels = { resolu: 'Clos', encours: 'Ouvert', attente: 'en attente', annule: 'Annulé' }
const detailFields = [
  { key: 'code',               label: 'Code' },
  { key: 'telephone',          label: 'Numéro appellant' },
  { key: 'requete',            label: 'Requête' },
  { key: 'raison',             label: 'Motif de création' },
  { key: 'créé_par',           label: 'Créé par' },
  { key: 'date_crea',          label: 'Date de création' },
  { key: 'assigne_a',          label: 'Assigné à' },
  { key: 'statut',             label: 'Statut' },
  { key: 'priorite',           label: 'Priorité' },
  { key: 'resolution',         label: 'Note sur le ticket' },
  { key: 'date_traitement',    label: 'Date traitement' },
  { key: 'traite_par',         label: 'Traité par' },
]
const agentsList = ref([])
const assignForm = ref({
//  user_assigne_id: ''
})

const tickets = ref([])
const user = ref({})
const router = useRouter()
const route = useRoute()

// Si l'URL contient ?mine=1, on affiche uniquement les tickets assignés à l'utilisateur connecté.
// Exemple: /back_office/tickets?mine=1
const mineOnly = computed(() => {
  const v = route.query.mine
  return v === '1' || v === 'true' || v === true
})

// Liste de base: tous les tickets OU seulement "mes tickets"
const baseTicketsList = computed(() => {
  if (!mineOnly.value) return tickets.value
  const myId = String(user.value?.id ?? '')
  if (!myId) return []
  return tickets.value.filter(t => String(t.user_assigne_id || '') === myId)
})

const search = ref('')
const filterStatus = ref('')
const filterType = ref('')
const sortKey = ref('id')
const sortDir = ref('desc')
const currentPage = ref(1)
const perPage = ref(10)
const selectedIds = ref([])

const filteredTickets = computed(() => {
  // IMPORTANT: on part de baseTicketsList pour respecter le mode "mineOnly"
  let list = baseTicketsList.value
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(a =>
      (a.code        || '').toLowerCase().includes(s) ||
      (a.telephone   || '').toLowerCase().includes(s) ||
      (a.requete     || '').toLowerCase().includes(s) ||
      String(a.id    || '').includes(s)
    )
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

const totalPages = computed(() => Math.ceil(filteredTickets.value.length / perPage.value))
const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTickets.value.slice(start, start + perPage.value)
})

watch([search, filterStatus, filterType, perPage], () => { currentPage.value = 1 })

// Ouvre automatiquement le détail d'un ticket si l'URL contient ?open=<id>
// Exemple: /back_office/tickets?mine=1&open=123
function openFromQueryIfNeeded() {
  const openId = route.query.open
  if (!openId) return
  const idStr = String(openId)
  const found = tickets.value.find(t => String(t.id) === idStr)
  if (found) openModal('detail', found)
}

// Si le token est invalide (ou expiré), on redirige vers le login.
function handleInvalidToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

function isUnauthorizedResponse(resp) {
  return resp && (resp.status === 401 || resp.status === 403)
}

function sortBy(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const allSelected = computed(() => paginatedTickets.value.length > 0 && paginatedTickets.value.every(a => selectedIds.value.includes(a.id)))
function toggleAll(e) {
  if (e.target.checked) selectedIds.value = [...new Set([...selectedIds.value, ...paginatedTickets.value.map(a => a.id)])]
  else selectedIds.value = selectedIds.value.filter(id => !paginatedTickets.value.map(a => a.id).includes(id))
}

async function deleteSelected() {
  const token = localStorage.getItem('token')
  if (!token) return alert('Vous devez être connecté')
  try {
    await Promise.all(selectedIds.value.map(id =>
      fetch(`${apiBase}/${id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` },
         credentials: 'include'
      })
    ))
    tickets.value = tickets.value.filter(a => !selectedIds.value.includes(a.id))
    selectedIds.value = []
    alert('✅ Tickets supprimés')
  } catch(err){
    console.error('Erreur suppression multi:', err)
    alert('Impossible de supprimer certains tickets')
  }
}

// Modal
const modal = ref({ show: false, type: '', data: null })
const form = ref({})

function openModal(type, data = null) {
  modal.value = { show: true, type, data }
  if (type === 'edit' && data) {
    form.value = { ...data }
 } else if (type === 'assign' && data) {
    // Pré-remplir avec les valeurs actuelles du ticket
    assignForm.value = {
      user_assigne_id: data.user_assigne_id || ''
    }
  }
}
function closeModal() { modal.value.show = false }

function confirmDelete(ticket) { openModal('delete', ticket) }
async function doDelete() {
  const token = localStorage.getItem('token')
  if (!token) return alert('Vous devez être connecté')
  try {
    const resp = await fetch(`${apiBase}/${modal.value.data.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (!resp.ok) throw new Error('Erreur serveur')
    tickets.value = tickets.value.filter(a => a.id !== modal.value.data.id)
    closeModal()
    alert('✅ Ticket supprimé')
  } catch(err) {
    console.error(err)
    alert('Impossible de supprimer l\'ticket')
  }
}

async function saveForm() {
  const token = localStorage.getItem('token')
  if (!token) return alert('Vous devez être connecté')

  const payload = {
    statut:              form.value.statut,
    priorite:            form.value.priorite || 'N/A',
    resolution:          form.value.resolution || null,
    date_traitement:     new Date().toISOString(),
    traite_par_id:      user.value.id,
    user_assigne_id:    null,
    action: 'creation/modification'  
  }

  try {
       let ticket = await fetch(`${apiBase}/${form.value.id}`, {
        method: 'PUT',  
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

    const data = await ticket.json()
    if (!ticket.ok) throw new Error(data.message || 'Erreur serveur')
    await loadTickets()
    closeModal()
    alert('✅ Ticket enregistré avec succès')
  } catch(err) {
    console.error(err)
    alert('Erreur lors de la sauvegarde')
  }
}
const formatDateJJMMAAAA = (dateISO) => {
    if (!dateISO) return '';
    
    const date = new Date(dateISO);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const annee = date.getFullYear();
    
    return `${jour}-${mois}-${annee}`;
}

async function saveAssign() {
  if (!assignForm.value.user_assigne_id) {
    return alert('Veuillez sélectionner un agent')
  }

  const token = localStorage.getItem('token')
  if (!token) return alert('Vous devez être connecté')

  if (modal.value.data.statut === 'clos') {
    return alert('Impossible d\'attribuer un ticket déjà clos ou résolu')
  } else if (modal.value.data.statut === 'annule') {
    return alert('Impossible d\'attribuer un ticket annulé')
  } else if (modal.value.data.statut === 'en attente') {

     const payload = {
      statut: modal.value.data.statut || '',
      priorite: modal.value.data.priorite || null,
      resolution: modal.value.data.resolution || null,
      date_traitement: null,
      user_assigne_id: assignForm.value.user_assigne_id,
      traite_par_id: null,
      action: 'assignation'      
    }

    //console.log('📦 payload attribution:', payload)

    try {
      const resp = await fetch(`${apiBase}/${modal.value.data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.message || 'Erreur serveur')

      await loadTickets()
      closeModal()
      alert(`✅ Ticket ${modal.value.data?.code} attribué avec succès`)
    } catch(err) {
      console.error('Erreur attribution:', err)
      alert('Erreur lors de l\'attribution du ticket')
    }
    }

 
}

async function loadTickets() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      handleInvalidToken()
      return
    }
    const resp = await fetch(apiBase, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (isUnauthorizedResponse(resp)) {
      handleInvalidToken()
      return
    }

    if (resp.ok) {
      const result = await resp.json()
      console.debug('loadTickets result:', result)
      let items = []
      if (Array.isArray(result)) items = result
      else if (result && Array.isArray(result.data)) items = result.data
      else if (result && Array.isArray(result.rows)) items = result.rows
      else items = []

      tickets.value = items.map(item => ({
        id:                  item.uid || item.id || '',
        code:                item.code || '',
        appel_id:            item.appel_id || '',
        telephone:           item.numero_appellant || '',
        requete:             item.requete || '',              // ← sécurisé
        raison:              item.raison || '',
        statut:              item.statut || '',
        priorite:            item.priorite || 'N/A',
        créé_par:            item.créé_par || '',
        date_crea:   formatDateJJMMAAAA(item.date_creation || ''),
        assigne_a:          item.assigne_a || null,
        // Pour les tickets non clos, on affiche N/A
      //  user_assigne_id:     item.user_assigne_id || null,
        resolution:          item.resolution || null,
        date_traitement:     (item.statut === 'clos') ? formatDateJJMMAAAA(item.date_traitement || '') : '',
        traite_par:          item.traite_par || null 


      }))
    } else {
      console.error('Erreur chargement tickets', await resp.text())
    }
  } catch(error) {
    console.error('Erreur fetch tickets', error)
  }
}

async function loadAgents() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      handleInvalidToken()
      return
    }
    const resp = await fetch('http://localhost:5170/api/user', {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (isUnauthorizedResponse(resp)) {
      handleInvalidToken()
      return
    }

    if (resp.ok) {
      const result = await resp.json()
      let items = []
      if (Array.isArray(result))            items = result
      else if (Array.isArray(result.data))  items = result.data
      else if (Array.isArray(result.rows))  items = result.rows
      // On filtre pour n'afficher que les agents/superviseurs
      agentsList.value = items.map(u => ({
        id:       u.uid || u.id,
        username: u.username || u.login,
        role:     u.role || ''
      }))
    }
  } catch(err) {
    console.error('Erreur chargement agents:', err)
  }
}

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) user.value = JSON.parse(stored)
  else router.push('/login')
  // On charge d'abord les tickets puis on ouvre (éventuellement) celui demandé dans l'URL.
  loadTickets().then(() => openFromQueryIfNeeded())
  loadAgents()
})

// Si on change l'URL (ex: open=...) sans recharger la page, on garde le comportement.
watch(() => route.query.open, () => {
  openFromQueryIfNeeded()
})
</script>

<style scoped>
.tickets-page { display: flex; flex-direction: column; gap: 20px; }

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
.table-card .table-scroll {
  overflow-x: auto;
  overflow-y: visible;
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
  min-width: 120px; /* garantit que chaque colonne reste lisible */
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.data-table tr.selected td { background: rgba(59,130,246,0.06); }

.checkbox { width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; }
.id-cell { font-weight: 700; color: var(--text-primary); font-family: monospace; font-size: 12px; }
.mono { font-family: monospace; font-size: 12px; }
.muted { color: var(--text-muted); font-size: 12px; }

.Appelant-cell { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 500; }
.Appelant-avatar {
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

/* Bouton Attribuer */
.action-btn.assign { color: #10b981; }
.action-btn.assign:hover { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); }

/* Bouton principal attribution */
.btn-assign {
  display: flex; align-items: center; gap: 6px;
  background: #10b981; color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; transition: all 0.2s; cursor: pointer;
}
.btn-assign:hover:not(:disabled) { background: #059669; }
.btn-assign:disabled { opacity: 0.4; cursor: not-allowed; }

/* Infos ticket dans le modal assign */
.assign-ticket-info {
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 20px;
}
.assign-info-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13px;
}

/* Divider */
.assign-divider {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; color: var(--text-muted); font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.assign-divider::before, .assign-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}

/* Pills statut/priorité */
.statut-pill, .priorite-pill {
  padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
}
.statut-pill.ouvert      { background: rgba(59,130,246,0.12); color: #3b82f6; }
.statut-pill.en-attente  { background: rgba(245,158,11,0.12); color: #f59e0b; }
.statut-pill.clos        { background: rgba(16,185,129,0.12); color: #10b981; }
.priorite-pill.basse     { background: rgba(16,185,129,0.12); color: #10b981; }
.priorite-pill.moyenne   { background: rgba(59,130,246,0.12); color: #3b82f6; }
.priorite-pill.haute     { background: rgba(245,158,11,0.12); color: #f59e0b; }
.priorite-pill.critique  { background: rgba(239,68,68,0.12);  color: #ef4444; }

/* Info assignation actuelle */
.assign-current {
  display: flex; align-items: center; gap: 8px;
  margin-top: 16px; padding: 10px 14px;
  background: rgba(59,130,246,0.06); border: 1px solid var(--border-accent);
  border-radius: var(--radius-sm); font-size: 12px; color: var(--text-secondary);
}
.assign-current strong { color: var(--text-primary); }
</style>

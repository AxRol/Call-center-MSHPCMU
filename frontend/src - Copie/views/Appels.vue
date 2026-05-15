<template>
  <div class="appels-page">
    <div class="page-header">
      <div>
        <h1>liste des Appels</h1>
        <p>{{ filteredAppels.length }} appels trouvés pour {{ new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</p>
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
        <input v-model="search" type="text" placeholder="Rechercher par nom, numéro..." />
      </div>
      <div class="date-filter-group">
        <label>Du</label>
        <input type="date" v-model="dateDebut" class="filter-select" />
      </div>
      <div class="date-filter-group">
        <label>Au</label>
        <input type="date" v-model="dateFin" class="filter-select" />
      </div>
      <button class="btn-primary" @click="loadAppels" :disabled="loading">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Filtrer
      </button>
      <button class="btn-outline" @click="resetFilters">Réinitialiser</button>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
             <!--  <th>
                <input type="checkbox" @change="toggleAll" :checked="allSelected" class="checkbox" />
              </th> -->
              <!-- <th @click="sortBy('id')" class="sortable"> ID <span class="sort-icon">{{ sortKey === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span> </th> -->
              <th>Numéro</th>
              <th @click="sortBy('Appelant')" class="sortable"> Appelant <span class="sort-icon">{{ sortKey === 'Appelant' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span> </th>
              <th>Localité</th>
              <th>Type appel</th>
              <th>Requete</th>
              <th>Objet</th>
              <th>Description</th>
              <th>Satisfaction</th>
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
            <tr v-for="appels in paginatedAppels" :key="appels.id" :class="{ selected: selectedIds.includes(appels.id) }">
              <!-- <td> <input type="checkbox" v-model="selectedIds" :value="appels.id" class="checkbox" /> </td> -->
              <!-- <td class="id-cell">#{{ appels.id }}</td> -->
              <td class="id-cell">{{ appels.telephone }}</td>
              <td class="id-cell"> {{ appels.appelant }}  </td>
              <td class="id-cell">{{ appels.localite }}</td>
              <td class="id-cell">{{ appels.type }}</td>
              <td class="id-cell">{{ appels.requete }}</td>
              <td class="id-cell">{{ appels.objet }}</td>
              <td class="id-cell">{{ appels.description }}</td>
              <td class="id-cell">{{ appels.satisfaction }}</td>
              <td class="id-cell">{{ appels.date }}</td>
              <td class="id-cell">{{ appels.agent }}</td>
              <td>

                <div class="action-btns">
                  <button class="action-btn detail" title="Détail" @click="openModal('detail', appels)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
  <!--                 <button class="action-btn edit" title="Éditer" @click="openModal('edit', appel)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button> -->
                  <button class="action-btn delete" title="Supprimer" @click="confirmDelete(appels)" :disabled="modal.user?.role !== 'admin'">
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
                <h2>Détail de l'appel <span class="modal-id">#{{ modal.data?.uid }}</span></h2>
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
                <!-- <div class="detail-notes" v-if="modal.data?.notes">
                  <span class="detail-label">Notes</span>
                  <p>{{ modal.data.notes }}</p>
                </div> -->
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Fermer</button>
                <!-- <button class="btn-primary" @click="openModal('edit', modal.data);">Éditer</button> -->
              </div>
            </template>

            <!-- Edit / Create Modal -->
<!--             <template v-else-if="modal.type === 'edit' || modal.type === 'create'">
              <div class="modal-header">
                <h2>{{ modal.type === 'edit' ? 'Éditer l\'appel' : 'Nouvel appel' }}</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Appelant *</label>
                    <input v-model="form.Appelant" type="text" placeholder="Nom complet" />
                  </div>
                  <div class="form-group">
                    <label>Numéro</label>
                    <input v-model="form.telephone" type="text" placeholder="+33 6 XX XX XX XX" />
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
            </template> -->

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
                  <p>Êtes-vous sûr de vouloir supprimer l'appel <strong>#{{ modal.data?.id }}</strong> de <strong>{{ modal.data?.Appelant }}</strong> ?</p>
                  <p class="delete-warning">Cette action est irréversible.</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete" :disabled="modal.user?.role !== 'agent' && modal.user?.role !== 'superviseur' && modal.user?.role !== 'admin'">Supprimer définitivement</button>
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


const apiBase      = API_BASE + '/api/appel'
// NOUVEAU 2026-04-27: endpoint agents de l'équipe du superviseur
const apiMesAgents = API_BASE + '/api/equipe/mes-agents'

const statusLabels = { resolu: 'Clos', encours: 'Ouvert', attente: 'En attente' }
const detailFields = [
  { key: 'uid',         label: 'ID' },
  { key: 'appelant',    label: 'Appelant' },
  { key: 'telephone',   label: 'Numéro' },
  { key: 'type',        label: 'Type appel' },
  { key: 'requete',     label: 'Requête' },
  { key: 'objet',       label: 'Objet' },
  { key: 'description', label: 'Description' },
  { key: 'satisfaction',      label: 'Satisfaction' },
  { key: 'date',        label: 'Date' },
  { key: 'agent',       label: 'Agent' },
]
const appels = ref([])
const user   = ref({})
const router = useRouter()

// NOUVEAU 2026-04-27: usernames des agents des équipes du superviseur connecté
const teamAgentUsernames = ref([])

const search = ref('')
const filterStatus = ref('')
const filterType = ref('')
const sortKey = ref('id')
const sortDir = ref('desc')
const currentPage = ref(1)
const perPage = ref(10)
const selectedIds = ref([])
const dateDebut = ref('')
const dateFin = ref('')
const loading = ref(false)

function handleInvalidToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU 2026-04-27 — Chargement des agents de l'équipe (vue superviseur)
//
// ANCIEN: aucun filtre sur les appels pour le superviseur.
// NOUVEAU: si l'utilisateur est superviseur, on récupère les usernames des agents
//          de ses équipes afin que filteredAppels les utilise comme filtre.
// ═══════════════════════════════════════════════════════════════════════════════
async function loadTeamAgents() {
  if (user.value?.role !== 'superviseur') return
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const resp = await fetch(apiMesAgents, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) {
      const result = await resp.json()
      teamAgentUsernames.value = (result.data || []).map(a => a.username)
    }
  } catch (err) {
    console.error('Erreur loadTeamAgents (Appels):', err)
  }
}

const filteredAppels = computed(() => {
  let list = appels.value
  // Pour l'agent: uniquement ses propres appels
  if (user.value?.role === 'agent') {
    const myUsername = user.value?.username || ''
    list = myUsername ? list.filter(a => a.agent === myUsername) : []
  }
  // NOUVEAU 2026-04-27: le superviseur voit uniquement les appels des agents de son équipe
  // ANCIEN: le superviseur voyait tous les appels sans restriction
  else if (user.value?.role === 'superviseur') {
    list = teamAgentUsernames.value.length > 0
      ? list.filter(a => teamAgentUsernames.value.includes(a.agent))
      : []
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(a => (a.appelant || '').toLowerCase().includes(s) || (a.telephone || '').includes(s) || String(a.id).includes(s))
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
    appels.value = appels.value.filter(a => !selectedIds.value.includes(a.id))
    selectedIds.value = []
    alert('✅ Appels supprimés')
  } catch(err){
    console.error('Erreur suppression multi:', err)
    alert('Impossible de supprimer certains appels')
  }
}

// Modal
const modal = ref({ show: false, type: '', data: null })
const form = ref({})

function openModal(type, data = null) {
  modal.value = { show: true, type, data }
  if (type === 'edit' && data) form.value = { ...data }
  else if (type === 'create') form.value = { Appelant: '', telephone: '', type: 'entrant', status: 'encours', duration: '', agent: '', notes: '' }
}
function closeModal() { modal.value.show = false }

function confirmDelete(appel) { openModal('delete', appel) }
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
    appels.value = appels.value.filter(a => a.id !== modal.value.data.id)
    closeModal()
    alert('✅ Appel supprimé')
  } catch(err) {
    console.error(err)
    alert('Impossible de supprimer l\'appel')
  }
}

async function saveForm() {
  const token = localStorage.getItem('token')
  if (!token) return alert('Vous devez être connecté')
  const parts = (form.value.Appelant || '').split(' ')
  const nom = parts[0] || ''
  const prenom = parts.slice(1).join(' ') || ''
  const payload = {
    telephone: form.value.telephone || '',
    civilite: '',
    nom,
    prenom,
    telephone_perso: '',
    ville: '',
    typeAppel: form.value.type,
    typeRequete: '',
    objetRequete: '',
    detailRequete: form.value.notes,
    userId: user.value.id || null,
    satisfaction: form.value.status,
    ticket: false,
    raison_ticket: ''
  }

  try {
    let resp
    if (modal.value.type === 'edit') {
      resp = await fetch(`${apiBase}/${form.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
    } else {
      resp = await fetch(apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
    }
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.message || 'Erreur serveur')
    await loadAppels()
    closeModal()
    alert('✅ Appel enregistré avec succès')
  } catch(err) {
    console.error(err)
    alert('Erreur lors de la sauvegarde')
  }
}

const formatDate  = (dateISO) => {
    if (!dateISO) return '';
    
    const date = new Date(dateISO);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const annee = date.getFullYear();
    
    return `${jour}-${mois}-${annee}`;
}
function resetFilters() {
  dateDebut.value = ''
  dateFin.value = ''
  search.value = ''
  currentPage.value = 1
  loadAppels()
}

async function loadAppels() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      handleInvalidToken()
      return
    }

    // Construire l'URL : /date avec query params si au moins une date est renseignée,
    // sinon GET / (retourne tous les appels)
    let url = apiBase
    if (dateDebut.value || dateFin.value) {
      const q = new URLSearchParams()
      if (dateDebut.value) q.append('dateDebut', dateDebut.value)
      if (dateFin.value)   q.append('dateFin',   dateFin.value)
      url = `${apiBase}/date?${q.toString()}`
    }

    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) {
      const result = await resp.json()
      console.debug('loadAppels result:', result)
      let items = []
      if (Array.isArray(result)) items = result
      else if (result && Array.isArray(result.data)) items = result.data
      else if (result && Array.isArray(result.rows)) items = result.rows
      else items = []

      appels.value = items.map(item => ({
        id: item.uid || item.id,
        uid: item.uid || item.id,
        appelant: `${item.nom_appelant || ''} ${item.prenoms_appelant || ''}`.trim() || item.caller || '',
        telephone: item.telephone|| 'xxxxxxxxxx',
        localite: item.ville  || 'N/A',
        type: item.libelle_type_appel ,
       // ville: item.ville  || '',
        requete: item.type_requete || '',
        objet: item.objet_requetes || '',
        description: item.descriptions_requetes || 'N/A',
        satisfaction: item.satisfaction ||  'N/A',
      //  date: item.created_at ||  '',
        date: formatDate(item.created_at) ||  '',
        agent: item.agent || 'N/A',
        notes: item.descriptions_requetes || ''
      }))
    } else {
      console.error('Erreur chargement appels', await resp.text())
    }
  } catch(error) {
    console.error('Erreur fetch appels', error)
  } finally {
    loading.value = false
  }
}
//function handleInvalidToken() {
//  localStorage.removeItem('token')
//  localStorage.removeItem('user')
//  router.push('/login')
//}

onMounted(async () => {
  const stored = localStorage.getItem('user')
  if (stored) user.value = JSON.parse(stored)
  else { router.push('/login'); return }
  // NOUVEAU 2026-04-27: charger les agents de l'équipe avant les appels (si superviseur)
  await loadTeamAgents()
  loadAppels()
})
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

.date-filter-group {
  display: flex; align-items: center; gap: 6px;
}
.date-filter-group label {
  font-size: 12px; color: var(--text-muted); font-weight: 500; white-space: nowrap;
}

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
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
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; color: var(--text-muted);
}
.action-btn.detail:hover  { background: rgba(59,130,246,0.1);  color: #3b82f6; border-color: rgba(59,130,246,0.3); }
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

.action-btn:disabled {
  opacity: 0.4;
  pointer-events: none;
  filter: grayscale(100%);
}
</style>

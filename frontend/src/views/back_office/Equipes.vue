<template>
  <div class="equipes-page">

    <!-- En-tete de page -->
    <div class="page-header">
      <div>
        <h1>Equipes</h1>
        <p>{{ filteredEquipes.length }} equipe(s) trouvee(s)</p>
      </div>
      <!-- NOUVEAU: bouton visible uniquement pour admin et superviseur -->
      <button class="btn-primary" @click="openModal('create')" v-if="canWrite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nouvelle equipe
      </button>
    </div>

    <!-- Barre de recherche -->
    <div class="filters-bar">
      <div class="search-input">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher par nom..." />
      </div>
    </div>

    <!-- Tableau des equipes -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Equipe</th>
              <!-- NOUVEAU: colonnes Superviseurs et Agents remplacent l'ancienne colonne Responsable -->
              <th>Superviseurs</th>
              <th>Agents</th>
              <th>Statut</th>
              <th>Cree le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredEquipes.length === 0">
              <td colspan="6" class="empty-state">Aucune equipe trouvee.</td>
            </tr>

            <!-- NOUVEAU: ligne par equipe avec badges superviseurs et agents -->
            <tr v-for="equipe in filteredEquipes" :key="equipe.uid">
              <td class="fw-600">{{ equipe.nom }}</td>

              <!-- NOUVEAU: badge nombre de superviseurs -->
              <td>
                <span class="badge badge-superviseur">
                  {{ equipe.nb_superviseurs ?? 0 }} superviseur(s)
                </span>
              </td>

              <!-- NOUVEAU: badge nombre d'agents -->
              <td>
                <span class="badge badge-agent">
                  {{ equipe.nb_agents ?? 0 }} agent(s)
                </span>
              </td>

              <td>
                <span class="statut-badge" :class="equipe.is_active ? 'actif' : 'inactif'">
                  {{ equipe.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="muted">{{ formatDate(equipe.created_at) }}</td>

              <td>
                <div class="action-btns">
                  <!-- NOUVEAU: bouton pour ouvrir le panneau de gestion des roles -->
                  <button
                    class="action-btn roles"
                    title="Gerer superviseurs et agents"
                    @click="openRoles(equipe)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </button>
                  <button class="action-btn edit" title="Editer" @click="openModal('edit', equipe)" v-if="canWrite">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn delete" title="Supprimer" @click="confirmDelete(equipe)" v-if="canWrite">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals teleportes dans le body -->
    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="modal.show" @click.self="closeModal">
          <div class="modal" :class="modal.type">

            <!-- Modal Creer / Editer -->
            <template v-if="modal.type === 'create' || modal.type === 'edit'">
              <div class="modal-header">
                <h2>{{ modal.type === 'edit' ? "Editer l'equipe" : "Nouvelle equipe" }}</h2>
                <button class="modal-close" @click="closeModal">&#x2715;</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>Nom <span class="required">*</span></label>
                  <input v-model="form.nom" type="text" placeholder="Nom de l'equipe" />
                </div>
                <div class="form-group checkbox-inline">
                  <input id="is_active" v-model="form.is_active" type="checkbox" />
                  <label for="is_active">Equipe active</label>
                </div>
                <!-- NOUVEAU: note informant que les roles se gerent separement -->
                <p class="info-note">
                  Les superviseurs et agents s'assignent via le bouton
                  <strong>Gerer les roles</strong> apres creation.
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-primary" @click="saveForm" :disabled="loading">
                  {{ loading ? 'Chargement...' : (modal.type === 'edit' ? 'Enregistrer' : 'Creer') }}
                </button>
              </div>
            </template>

            <!-- Modal Supprimer -->
            <template v-else-if="modal.type === 'delete'">
              <div class="modal-header danger">
                <h2>Supprimer l'equipe</h2>
                <button class="modal-close" @click="closeModal">&#x2715;</button>
              </div>
              <div class="modal-body">
                <p>Confirmer la suppression de l'equipe <strong>{{ modal.data?.nom }}</strong> ?</p>
                <!-- NOUVEAU: avertissement sur le sort des superviseurs/agents lies -->
                <p class="delete-warning">
                  Les superviseurs et agents de cette equipe seront detaches automatiquement
                  mais leurs comptes ne seront pas supprimes.
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete" :disabled="loading">
                  {{ loading ? 'Chargement...' : 'Supprimer' }}
                </button>
              </div>
            </template>

            <!-- NOUVEAU: Modal Gestion des roles (superviseurs + agents) -->
            <!-- ANCIEN: il n'existait pas de modal de ce type, on modifiait juste le champ responsable -->
            <template v-else-if="modal.type === 'roles'">
              <div class="modal-header">
                <h2>
                  Roles &mdash;
                  <span class="modal-equipe-nom">{{ modal.data?.nom }}</span>
                </h2>
                <button class="modal-close" @click="closeModal">&#x2715;</button>
              </div>

              <div class="modal-body roles-body">

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- NOUVEAU: Section superviseurs                               -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                <div class="roles-section">
                  <div class="section-header">
                    <h3>
                      <span class="section-icon supervisor-icon">S</span>
                      Superviseurs
                    </h3>
                    <span class="section-count">{{ currentSuperviseurs.length }} assigne(s)</span>
                  </div>
                  <p class="section-desc">Gerent cette equipe et coordonnent les agents.</p>

                  <!-- NOUVEAU: Selecteur pour ajouter un superviseur -->
                  <div class="add-role-row" v-if="canWrite">
                    <select v-model="selectedSuperviseurToAdd">
                      <option value="">Selectionner un superviseur...</option>
                      <option
                        v-for="u in supervisorsNotInEquipe"
                        :key="u.uid"
                        :value="u.uid"
                      >
                        {{ u.username }} ({{ u.role }})
                      </option>
                    </select>
                    <button
                      class="btn-primary"
                      @click="addSuperviseur"
                      :disabled="!selectedSuperviseurToAdd || loading"
                    >
                      Ajouter
                    </button>
                  </div>

                  <!-- NOUVEAU: Liste des superviseurs actuellement assignes -->
                  <div class="roles-list">
                    <div v-if="currentSuperviseurs.length === 0" class="empty-roles">
                      Aucun superviseur assigne.
                    </div>
                    <div v-for="s in currentSuperviseurs" :key="s.uid" class="role-row">
                      <div class="role-info">
                        <span class="role-avatar supervisor-avatar">S</span>
                        <div>
                          <span class="role-name">{{ s.username }}</span>
                          <span class="role-type">{{ s.role }}</span>
                        </div>
                      </div>
                      <!-- NOUVEAU: bouton retirer superviseur -->
                      <button
                        class="btn-remove"
                        @click="removeSuperviseur(s.uid)"
                        :disabled="loading"
                        v-if="canWrite"
                        title="Retirer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- NOUVEAU: Section agents                                     -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                <div class="roles-section">
                  <div class="section-header">
                    <h3>
                      <span class="section-icon agent-icon">A</span>
                      Agents
                    </h3>
                    <span class="section-count">{{ currentAgents.length }} assigne(s)</span>
                  </div>
                  <p class="section-desc">Traitent les appels pour cette equipe.</p>

                  <!-- NOUVEAU: Selecteur pour ajouter un agent -->
                  <div class="add-role-row" v-if="canWrite">
                    <select v-model="selectedAgentToAdd">
                      <option value="">Selectionner un agent...</option>
                      <option
                        v-for="u in agentsNotInEquipe"
                        :key="u.uid"
                        :value="u.uid"
                      >
                        {{ u.username }}
                      </option>
                    </select>
                    <button
                      class="btn-primary"
                      @click="addAgent"
                      :disabled="!selectedAgentToAdd || loading"
                    >
                      Ajouter
                    </button>
                  </div>

                  <!-- NOUVEAU: Liste des agents actuellement assignes -->
                  <div class="roles-list">
                    <div v-if="currentAgents.length === 0" class="empty-roles">
                      Aucun agent assigne.
                    </div>
                    <div v-for="a in currentAgents" :key="a.uid" class="role-row">
                      <div class="role-info">
                        <span class="role-avatar agent-avatar">A</span>
                        <div>
                          <span class="role-name">{{ a.username }}</span>
                          <span class="role-type">agent</span>
                        </div>
                      </div>
                      <!-- NOUVEAU: bouton retirer agent -->
                      <button
                        class="btn-remove"
                        @click="removeAgent(a.uid)"
                        :disabled="loading"
                        v-if="canWrite"
                        title="Retirer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Fermer</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_EQUIPE = API_BASE + '/api/equipe'
const API_USER   = API_BASE + '/api/user'
const router     = useRouter()

// ─────────────────────────────────────────────────────────────────────────────
// Etat reactif
// ─────────────────────────────────────────────────────────────────────────────
const equipes     = ref([])
const allUsers    = ref([])
const search      = ref('')
const loading     = ref(false)
const currentUser = ref({})

const modal = ref({ show: false, type: '', data: null })
const form  = ref({ uid: '', nom: '', is_active: true })

// NOUVEAU: selections en cours dans le modal de gestion des roles
const selectedSuperviseurToAdd = ref('')
const selectedAgentToAdd       = ref('')

// ─────────────────────────────────────────────────────────────────────────────
// Droits d'ecriture
// ─────────────────────────────────────────────────────────────────────────────
const canWrite = computed(() =>
  ['admin', 'superviseur'].includes(currentUser.value?.role)
)

// ─────────────────────────────────────────────────────────────────────────────
// Filtrage de la liste
// ─────────────────────────────────────────────────────────────────────────────
const filteredEquipes = computed(() => {
  if (!search.value.trim()) return equipes.value
  const q = search.value.toLowerCase()
  return equipes.value.filter(e => (e.nom || '').toLowerCase().includes(q))
})

// ─────────────────────────────────────────────────────────────────────────────
// NOUVEAU: Proprietes calculees pour le modal de gestion des roles
// ─────────────────────────────────────────────────────────────────────────────

// NOUVEAU: superviseurs de l'equipe actuellement ouverte dans le modal
const currentSuperviseurs = computed(() =>
  modal.value.data?.superviseurs ?? []
)

// NOUVEAU: agents de l'equipe actuellement ouverte dans le modal
const currentAgents = computed(() =>
  modal.value.data?.agents ?? []
)

// NOUVEAU: utilisateurs avec role superviseur/admin non encore assignes a cette equipe
const supervisorsNotInEquipe = computed(() => {
  if (!modal.value.data?.uid) return []
  const assigned = new Set(currentSuperviseurs.value.map(s => s.uid))
  return allUsers.value.filter(u =>
    ['superviseur', 'admin'].includes(u.role) &&
    !assigned.has(u.uid) &&
    u.is_active !== false
  )
})

// NOUVEAU: utilisateurs avec role agent non encore assignes a cette equipe
const agentsNotInEquipe = computed(() => {
  if (!modal.value.data?.uid) return []
  const assigned = new Set(currentAgents.value.map(a => a.uid))
  return allUsers.value.filter(u =>
    u.role === 'agent' &&
    !assigned.has(u.uid) &&
    u.is_active !== false
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

function getToken() {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return null }
  return token
}

// ─────────────────────────────────────────────────────────────────────────────
// Chargement des donnees
// ─────────────────────────────────────────────────────────────────────────────

// NOUVEAU: apres le rechargement des equipes, met a jour modal.data si le modal roles est ouvert
// Correctif: evite que le modal affiche des donnees perimees apres un ajout/retrait
async function loadEquipes() {
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const resp = await fetch(API_EQUIPE, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) {
      const result = await resp.json()
      equipes.value = result.data || []

      // NOUVEAU: synchronise les donnees du modal roles avec la version fraiche
      if (modal.value.type === 'roles' && modal.value.data?.uid) {
        const fraiche = equipes.value.find(e => e.uid === modal.value.data.uid)
        if (fraiche) modal.value.data = fraiche
      }
    }
  } catch (err) {
    console.error('Erreur loadEquipes:', err)
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  const token = getToken(); if (!token) return
  try {
    const resp = await fetch(API_USER, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) {
      const result = await resp.json()
      allUsers.value = Array.isArray(result) ? result : (result.data || result.rows || [])
    }
  } catch (err) {
    console.error('Erreur loadUsers:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gestion des modals
// ─────────────────────────────────────────────────────────────────────────────
function openModal(type, data = null) {
  modal.value = { show: true, type, data }
  if (type === 'edit' && data) {
    form.value = { uid: data.uid, nom: data.nom, is_active: !!data.is_active }
  } else if (type === 'create') {
    form.value = { uid: '', nom: '', is_active: true }
  }
}

// NOUVEAU: ouvre le modal de gestion des roles pour une equipe donnee
function openRoles(equipe) {
  selectedSuperviseurToAdd.value = ''
  selectedAgentToAdd.value = ''
  modal.value = { show: true, type: 'roles', data: equipe }
}

function confirmDelete(equipe) {
  openModal('delete', equipe)
}

function closeModal() {
  modal.value = { show: false, type: '', data: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD equipes
// ─────────────────────────────────────────────────────────────────────────────
async function saveForm() {
  if (!form.value.nom.trim()) { alert('Le nom est requis'); return }
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const isEdit = modal.value.type === 'edit'
    const url    = isEdit ? `${API_EQUIPE}/${form.value.uid}` : API_EQUIPE
    const resp = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ nom: form.value.nom.trim(), is_active: !!form.value.is_active })
    })
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}))
      throw new Error(d.message || 'Erreur serveur')
    }
    closeModal()
    await loadEquipes()
  } catch (err) {
    alert(err.message || "Erreur lors de l'enregistrement")
  } finally {
    loading.value = false
  }
}

async function doDelete() {
  if (!modal.value.data?.uid) return
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const resp = await fetch(`${API_EQUIPE}/${modal.value.data.uid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (!resp.ok) throw new Error('Erreur serveur')
    closeModal()
    await loadEquipes()
  } catch (err) {
    alert(err.message || 'Erreur lors de la suppression')
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOUVEAU: Gestion des superviseurs
// ─────────────────────────────────────────────────────────────────────────────

// NOUVEAU: assigner un superviseur a l'equipe ouverte dans le modal
async function addSuperviseur() {
  if (!selectedSuperviseurToAdd.value || !modal.value.data?.uid) return
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const resp = await fetch(`${API_EQUIPE}/${modal.value.data.uid}/superviseurs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ superviseurId: selectedSuperviseurToAdd.value })
    })
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}))
      throw new Error(d.message || 'Erreur serveur')
    }
    selectedSuperviseurToAdd.value = ''
    // NOUVEAU: rechargement qui met aussi a jour modal.data automatiquement
    await loadEquipes()
  } catch (err) {
    alert(err.message || "Erreur lors de l'ajout du superviseur")
  } finally {
    loading.value = false
  }
}

// NOUVEAU: retirer un superviseur de l'equipe ouverte dans le modal
async function removeSuperviseur(superviseurId) {
  if (!modal.value.data?.uid) return
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const resp = await fetch(
      `${API_EQUIPE}/${modal.value.data.uid}/superviseurs/${superviseurId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      }
    )
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}))
      throw new Error(d.message || 'Erreur serveur')
    }
    // NOUVEAU: rechargement qui met aussi a jour modal.data automatiquement
    await loadEquipes()
  } catch (err) {
    alert(err.message || 'Erreur lors du retrait du superviseur')
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOUVEAU: Gestion des agents
// ─────────────────────────────────────────────────────────────────────────────

// NOUVEAU: assigner un agent a l'equipe ouverte dans le modal
async function addAgent() {
  if (!selectedAgentToAdd.value || !modal.value.data?.uid) return
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const resp = await fetch(`${API_EQUIPE}/${modal.value.data.uid}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ agentId: selectedAgentToAdd.value })
    })
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}))
      throw new Error(d.message || 'Erreur serveur')
    }
    selectedAgentToAdd.value = ''
    // NOUVEAU: rechargement qui met aussi a jour modal.data automatiquement
    await loadEquipes()
  } catch (err) {
    alert(err.message || "Erreur lors de l'ajout de l'agent")
  } finally {
    loading.value = false
  }
}

// NOUVEAU: retirer un agent de l'equipe ouverte dans le modal
async function removeAgent(agentId) {
  if (!modal.value.data?.uid) return
  const token = getToken(); if (!token) return
  loading.value = true
  try {
    const resp = await fetch(
      `${API_EQUIPE}/${modal.value.data.uid}/agents/${agentId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      }
    )
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}))
      throw new Error(d.message || 'Erreur serveur')
    }
    // NOUVEAU: rechargement qui met aussi a jour modal.data automatiquement
    await loadEquipes()
  } catch (err) {
    alert(err.message || "Erreur lors du retrait de l'agent")
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialisation
// ─────────────────────────────────────────────────────────────────────────────
onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) currentUser.value = JSON.parse(stored)
  else router.push('/login')
  loadEquipes()
  loadUsers()
})
</script>

<style scoped>
.equipes-page { display: flex; flex-direction: column; gap: 20px; }

/* En-tete */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
.page-header p  { color: var(--text-muted); font-size: 13px; margin-top: 2px; }

/* Boutons */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: #fff; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline {
  background: none; border: 1px solid var(--border); color: var(--text-secondary);
  padding: 9px 16px; border-radius: var(--radius-sm); font-size: 13px; cursor: pointer;
}
.btn-danger {
  background: #ef4444; color: #fff; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm); font-size: 13px; cursor: pointer;
}
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-remove {
  background: rgba(239,68,68,0.1); color: #ef4444;
  border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm);
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.2s; flex-shrink: 0;
}
.btn-remove:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
.btn-remove:disabled { opacity: 0.5; cursor: not-allowed; }

/* Barre de recherche */
.filters-bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.search-input {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 9px 14px;
  color: var(--text-muted); flex: 1; min-width: 220px;
}
.search-input:focus-within { border-color: var(--border-accent); }
.search-input input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; width: 100%; }

/* Tableau */
.table-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th {
  background: var(--bg-secondary); color: var(--text-muted);
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border);
}
.data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-primary); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg-secondary); }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
.fw-600 { font-weight: 600; }
.muted { color: var(--text-muted); font-size: 12px; }

/* NOUVEAU: badges superviseurs et agents */
.badge {
  display: inline-block; padding: 3px 10px;
  border-radius: 20px; font-size: 11px; font-weight: 600;
}
.badge-superviseur { background: rgba(99,102,241,0.1); color: #6366f1; }
.badge-agent       { background: rgba(16,185,129,0.1);  color: #10b981; }

.statut-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.statut-badge.actif   { background: rgba(16,185,129,0.12); color: #10b981; }
.statut-badge.inactif { background: rgba(100,116,139,0.12); color: #64748b; }

/* Boutons d'action */
.action-btns { display: flex; gap: 6px; }
.action-btn {
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; color: var(--text-muted);
}
.action-btn.roles:hover  { background: rgba(59,130,246,0.1);  color: #3b82f6; border-color: rgba(59,130,246,0.3); }
.action-btn.edit:hover   { background: rgba(245,158,11,0.1);  color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.action-btn.delete:hover { background: rgba(239,68,68,0.1);   color: #ef4444; border-color: rgba(239,68,68,0.3); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); width: 460px; max-width: 95vw; max-height: 85vh;
  display: flex; flex-direction: column; overflow: hidden;
}
/* NOUVEAU: modal roles plus large pour accueillir les deux sections */
.modal.roles { width: 560px; max-height: 90vh; }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.modal-header.danger h2 { color: #ef4444; }
.modal-equipe-nom { color: var(--accent); }
.modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; padding: 0; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

/* Formulaire */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 500; color: var(--text-muted); }
.form-group input[type="text"] {
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); padding: 9px 12px; border-radius: var(--radius-sm);
  font-size: 13px; outline: none; width: 100%;
}
.form-group input[type="text"]:focus { border-color: var(--border-accent); }
.checkbox-inline { flex-direction: row !important; align-items: center; gap: 8px !important; }
.required { color: #ef4444; }

/* Note informative */
.info-note {
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: var(--radius-sm);
  padding: 10px 12px; font-size: 12px; color: #3b82f6; margin: 0;
}

/* Avertissement suppression */
.delete-warning { color: var(--text-muted); font-size: 12px; margin-top: 6px; }

/* NOUVEAU: Modal de gestion des roles */
.roles-body { gap: 20px !important; }

.roles-section {
  display: flex; flex-direction: column; gap: 10px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-header h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px; }

/* NOUVEAU: icones textuelles pour superviseur et agent */
.section-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.supervisor-icon { background: #6366f1; }
.agent-icon      { background: #10b981; }

.section-count {
  font-size: 12px; font-weight: 500; color: var(--text-muted);
  background: var(--bg-card); padding: 2px 8px; border-radius: 12px;
}

.section-desc { font-size: 12px; color: var(--text-muted); margin: 0; }

/* NOUVEAU: ligne d'ajout d'un role */
.add-role-row {
  display: flex; gap: 8px; align-items: center;
  padding: 10px; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.add-role-row select {
  flex: 1; background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); padding: 8px 10px;
  border-radius: var(--radius-sm); font-size: 13px; outline: none;
}
.add-role-row select:focus { border-color: var(--border-accent); }

/* NOUVEAU: liste des roles assignes */
.roles-list { display: flex; flex-direction: column; gap: 6px; }
.empty-roles { text-align: center; padding: 14px; color: var(--text-muted); font-size: 12px; }

.role-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.role-info { display: flex; align-items: center; gap: 10px; }

/* NOUVEAU: avatars colores selon le role */
.role-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.supervisor-avatar { background: #6366f1; }
.agent-avatar      { background: #10b981; }

.role-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; }
.role-type { font-size: 11px; color: var(--text-muted); display: block; margin-top: 1px; }

/* Transition modal */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

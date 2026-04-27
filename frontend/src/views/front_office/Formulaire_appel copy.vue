<template>
  <div class="fullscreen-content">
    <!-- Onglets -->
    <div class="tabs-container">
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'client' }" @click="activeTab = 'client'">👤 Informations de l'appelant</button>
        <button class="tab" :class="{ active: activeTab === 'requete' }" @click="activeTab = 'requete'">📋 Détail de la Requête</button>
        <button class="tab" :class="{ active: activeTab === 'historique' }" @click="activeTab = 'historique'">📜 Historique</button>
      </div>
    </div>

    <div class="fullscreen-tab-content">

      <!-- ═══════════════════════════════════════════
           ONGLET CLIENT
      ═══════════════════════════════════════════ -->
      <div v-if="activeTab === 'client'" class="tab-pane active">
        <div class="content-header">
          <div class="info-message">
            <i>📞 Veuillez renseigner les informations concernant l'appel</i>
          </div>
        </div>

        <!-- ── BLOC RECHERCHE ── -->
        <div class="search-block">
          <label class="search-label">🔍 Rechercher un appelant par numéro de téléphone</label>
          <div class="search-row">
            <div class="search-input-wrap">
              <input
                type="tel"
                v-model="searchPhone"
                placeholder="Saisissez un numéro pour rechercher..."
                maxlength="10"
                inputmode="numeric"
                @input="searchPhone = $event.target.value.replace(/[^0-9]/g, ''); onSearchInput()"
                @keyup.enter="searchCaller"
                :class="{ 'search-not-found': searchStatus === 'not_found' }"
                class="search-input"
              />
              <!-- Indicateur de statut -->
              <span v-if="searchStatus === 'loading'"  class="search-status loading">⏳</span>
              <span v-if="searchStatus === 'found'"    class="search-status found">✅</span>
              <span v-if="searchStatus === 'not_found'" class="search-status not-found">❌</span>
            </div>
            <button
              class="btn-search"
              @click="searchCaller"
              :disabled="searchPhone.length < 8 || searchStatus === 'loading'"
            >
              <span v-if="searchStatus !== 'loading'">Rechercher</span>
              <span v-else>Recherche...</span>
            </button>
            <button
              v-if="searchStatus !== 'idle'"
              class="btn-reset-search"
              @click="resetSearch"
              title="Effacer la recherche"
            >✕</button>
          </div>

          <!-- Message de retour -->
          <p v-if="searchStatus === 'found'"     class="search-feedback found">Appelant trouvé — formulaire pré-rempli.</p>
          <p v-if="searchStatus === 'not_found'" class="search-feedback not-found">Aucun appelant trouvé pour ce numéro.</p>

          <!-- Liste déroulante si plusieurs résultats -->
          <div v-if="searchResults.length > 1" class="search-dropdown">
            <p class="dropdown-title">{{ searchResults.length }} résultats trouvés — sélectionnez un appelant :</p>
            <div
              v-for="(r, i) in searchResults"
              :key="i"
              class="dropdown-item"
              @click="fillFromResult(r)"
            >
              <span class="dropdown-phone">{{ r.telephone }}</span>
              <span class="dropdown-name">{{ r.nom }} {{ r.prenom }}</span>
              <span class="dropdown-ville">{{ r.ville || '—' }}</span>
            </div>
          </div>
        </div>
        <!-- ── FIN BLOC RECHERCHE ── -->

        <div class="form-grid">
          <div class="form-row">
            <div class="form-group">
              <label>Numéro de téléphone <span class="required">*</span></label>
              <input
                type="tel"
                v-model="formData.client.telephone"
                placeholder="0000000000"
                maxlength="10"
                pattern="[0-9]{10}"
                inputmode="numeric"
                @input="formData.client.telephone = $event.target.value.replace(/[^0-9]/g, '')"
                :class="{ 'error-border': errors.telephone }"
              >
            </div>
            <div class="form-group">
              <label>Civilité</label>
              <select v-model="formData.client.civilite">
                <option value="">--Sélectionnez la civilité--</option>
                <option value="mr">Monsieur</option>
                <option value="mme">Madame</option>
                <option value="mlle">Mademoiselle</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nom <span class="required">*</span></label>
              <input type="text" id="nom" v-model="formData.client.nom" placeholder="Nom de l'appelant" :class="{ 'error-border': errors.nom }">
            </div>
            <div class="form-group">
              <label>Prénom <span class="required">*</span></label>
              <input type="text" id="prenom" v-model="formData.client.prenom" placeholder="Prénoms de l'appelant" :class="{ 'error-border': errors.prenom }">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Numéro de téléphone personnel</label>
              <input
                type="tel"
                id="telephone_perso"
                v-model="formData.client.telephone_perso"
                placeholder="0000000000"
                maxlength="10"
                pattern="[0-9]{10}"
                inputmode="numeric"
                @input="formData.client.telephone_perso = $event.target.value.replace(/[^0-9]/g, '')"
              >
            </div>
            <div class="form-group">
              <label>Localité</label>
              <input type="text" v-model="formData.client.ville" placeholder="La localité de l'appelant">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Type d'appel <span class="required">*</span></label>
              <select v-model="formData.client.typeAppel" :class="{ 'error-border': errors.typeAppel }">
                <option value="">--Sélectionnez le type d'appel--</option>
                <option v-for="item in typeAppelOptions" :key="item.code" :value="item.code">{{ item.libelle }}</option>
              </select>
            </div>
            <div class="form-group checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="anonymat" v-model="formData.client.anonymat" @change="handleAnonymatChange">
                <label for="anonymat">Anonymat</label>
              </div>
            </div>
          </div>

          <!-- Bouton Suivant -->
          <div class="action-bar">
            <div class="button-group">
              <button class="btn btn-primary" @click="goToRequete">
                Suivant
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           ONGLET REQUÊTE
      ═══════════════════════════════════════════ -->
      <div v-if="activeTab === 'requete'" class="tab-pane active">
        <div class="content-header">
          <div class="info-message">
            <i>📋 Détaillez la requête et les informations associées</i>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-row full-width">
            <div class="form-group">
              <label>Type de la requête <span class="required">*</span></label>
              <select v-model="formData.requete.typeRequete" :class="{ 'error-border': errors.typeRequete }">
                <option value="">--Sélectionnez un type de la requête--</option>
                <option v-for="item in typeRequeteOptions" :key="item.code" :value="item.code">{{ item.libelle }}</option>
              </select>
            </div>
          </div>

          <div class="form-row full-width">
            <div class="form-group">
              <label>Objet de la requête <span class="required">*</span></label>
              <input type="text" v-model="formData.requete.objetRequete" placeholder="Objet de la requête" :class="{ 'error-border': errors.objetRequete }">
            </div>
          </div>

          <div class="form-row full-width">
            <div class="form-group">
              <label>Description détaillée de la requête <span class="required">*</span></label>
              <textarea v-model="formData.requete.detailRequete" placeholder="Faire ici la description détaillée de la requête..." rows="5" :class="{ 'error-border': errors.detailRequete }"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Satisfaction</label>
              <select v-model="formData.requete.satisfaction">
                <option value="">--Sélectionnez la satisfaction--</option>
                <option value="non_satisfait">Non satisfait</option>
                <option value="satisfait">Satisfait</option>
              </select>
            </div>
            <div class="form-group">
              <div class="checkbox-item">
                <input type="checkbox" id="ticket" v-model="formData.requete.ticket" @change="handleTicketChange">
                <label for="ticket">Créer un ticket</label>
              </div>
            </div>
          </div>

          <div class="form-row full-width" v-if="formData.requete.ticket">
            <div class="form-group">
              <label for="raisonticket">Raison création du ticket</label>
              <textarea id="raisonticket" v-model="formData.requete.raisonticket" placeholder="Pourquoi vous créez ce ticket?" rows="4"></textarea>
            </div>
          </div>
          
        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           ONGLET HISTORIQUE
      ═══════════════════════════════════════════ -->
      <div v-if="activeTab === 'historique'" class="tab-pane active">
        <div class="content-header">
          <div class="info-message">
            <i>📜 Historique et informations complémentaires</i>
          </div>
        </div>

        <div class="history-grid">
          <div v-for="(item, index) in historique" :key="index" class="history-card">
            <div class="history-card-header">
              <h3>{{ item.titre }}</h3>
              <span :class="['priority-badge', getPriorityClass(item.satisfaction)]">
                {{ item.satisfaction }}
              </span>
            </div>
            <div class="history-card-body">
              <p><strong>Client:</strong> {{ item.client }}</p>
              <p><strong>Statut:</strong> <span class="status-badge">{{ item.statut }}</span></p>
              <p class="history-date">Créé le {{ item.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div v-if="activeTab === 'requete'" class="action-bar">
        <div class="button-group">
          <button class="btn btn-primary" @click="submitForm">Enregistrer</button>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal déconnexion -->
  <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
    <div class="modal-content" @click.stop>
      <h3>Confirmation de déconnexion</h3>
      <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="showLogoutModal = false">Annuler</button>
        <button class="btn btn-danger" @click="confirmLogout">Se déconnecter</button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="form_appel-footer">
    <p>© DISD | Gestionnaire des requêtes d'appels. Tous droits réservés.</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router   = useRouter()
const apiBase       = 'http://localhost:5170/api/appel'
const apiTypeAppel  = 'http://localhost:5170/api/typeAppel'
const apiTypeRequete = 'http://localhost:5170/api/typeRequete'
const apiLogout     = 'http://localhost:5170/api/auth/logout'
const apiTicket     = 'http://localhost:5170/api/ticket'

// ── ONGLET ACTIF ──
const activeTab      = ref('client')
const showLogoutModal = ref(false)

// ─────────────────────────────────────────────────
// ── RECHERCHE PAR TÉLÉPHONE (100 % frontend) ──
//
// Principe :
//   1. L'agent saisit un numéro dans le champ de recherche.
//   2. On interroge l'API des appels déjà chargée en mémoire
//      (appelsCache). Si le cache est vide on le remplit une
//      seule fois au montage du composant.
//   3. On filtre localement les enregistrements dont le champ
//      `telephone` correspond au numéro saisi.
//   4. Si un seul résultat → auto-remplissage immédiat.
//      Si plusieurs → liste déroulante de sélection.
//   5. Aucun appel supplémentaire au backend n'est nécessaire
//      après le chargement initial du cache.
// ─────────────────────────────────────────────────

const searchPhone   = ref('')           // valeur saisie dans le champ de recherche
const searchStatus  = ref('idle')       // idle | loading | found | not_found
const searchResults = ref([])           // liste des correspondances
const appelsCache   = ref([])           // cache local de tous les appels
let   debounceTimer = null              // timer pour la saisie en direct

/*
  Charge TOUS les appels depuis l'API une seule fois et les
  stocke dans appelsCache. Cette fonction est appelée dans
  onMounted() — aucun appel réseau supplémentaire n'est fait
  lors des recherches.
*/
const loadAppelsCache = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const resp = await fetch(apiBase, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })

    if (!resp.ok) return

    const result = await resp.json()
    const items  = Array.isArray(result)       ? result
                 : Array.isArray(result.data)  ? result.data
                 : Array.isArray(result.rows)  ? result.rows : []

    /*
      On normalise chaque enregistrement pour n'extraire que
      les champs utiles à la recherche et au pré-remplissage.
    */
    appelsCache.value = items.map(item => ({
      telephone:       item.telephone         || '',
      civilite:        item.civilite          || '',
      nom:             item.nom_appelant      || item.nom    || '',
      prenom:          item.prenoms_appelant  || item.prenom || '',
      telephone_perso: item.telephone_perso   || '',
      ville:           item.localite          || item.ville  || '',
    }))
  } catch (err) {
    console.error('Erreur chargement cache appels:', err)
  }
}

/*
  Appelé à chaque frappe : déclenche la recherche avec un
  délai (debounce) de 400 ms pour ne pas filtrer à chaque
  caractère saisi.
*/
const onSearchInput = () => {
  clearTimeout(debounceTimer)
  // Réinitialise si le champ est vidé
  if (searchPhone.value.length === 0) { resetSearch(); return }
  // Lance la recherche uniquement à partir de 8 chiffres
  if (searchPhone.value.length >= 8) {
    debounceTimer = setTimeout(() => searchCaller(), 400)
  }
}

/*
  Recherche principale — 100 % frontend :
  filtre appelsCache sur le numéro de téléphone saisi.
*/
const searchCaller = () => {
  if (searchPhone.value.length < 8) return

  searchStatus.value  = 'loading'
  searchResults.value = []

  // Filtrage local (aucun appel réseau)
  const needle  = searchPhone.value.trim()
  const matches = appelsCache.value.filter(a => a.telephone === needle)

  if (matches.length === 0) {
    searchStatus.value = 'not_found'
    return
  }

  searchResults.value = matches
  searchStatus.value  = 'found'

  // Auto-remplissage direct si un seul résultat
  if (matches.length === 1) {
    fillFromResult(matches[0])
  }
  // Sinon la liste déroulante s'affiche dans le template
}

/*
  Remplit les champs du formulaire à partir d'un enregistrement
  trouvé dans le cache.
*/
const fillFromResult = (result) => {
  formData.client.telephone       = result.telephone
  formData.client.civilite        = result.civilite
  formData.client.nom             = result.nom
  formData.client.prenom          = result.prenom
  formData.client.telephone_perso = result.telephone_perso
  formData.client.ville           = result.ville

  // Masque la liste déroulante après sélection
  searchResults.value = searchResults.value.length > 1 ? [] : searchResults.value
  searchStatus.value  = 'found'
}

/*
  Réinitialise l'état de la recherche (sans toucher au formulaire).
*/
const resetSearch = () => {
  searchPhone.value   = ''
  searchStatus.value  = 'idle'
  searchResults.value = []
}

// ─────────────────────────────────────────────────
// ── FORMULAIRE ──
// ─────────────────────────────────────────────────

const formData = reactive({
  client: {
    telephone: '', civilite: '', nom: '', prenom: '',
    telephone_perso: '', ville: '', typeAppel: '', anonymat: false
  },
  requete: {
    typeRequete: '', objetRequete: '', detailRequete: '',
    satisfaction: '', ticket: false, raisonticket: ''
  }
})

const errors = reactive({
  nom: false, prenom: false, telephone: false, typeAppel: false,
  typeRequete: false, objetRequete: false, detailRequete: false
})

const typeAppelOptions  = ref([])
const typeRequeteOptions = ref([])

// ── UTILISATEUR ──
const user = ref({})
const userRole = computed(() => user.value.role || 'inconnu')
const userRoleLabel = computed(() => {
  const labels = { admin: 'Administrateur', superviseur: 'Superviseur', agent: 'Agent' }
  return labels[user.value.role] || user.value.role || 'inconnu'
})
const username = computed(() => user.value.username || user.value.login || 'Utilisateur')
const userInitials = computed(() => {
  if (user.value.username) return user.value.username.charAt(0).toUpperCase()
  return user.value.login ? user.value.login.substring(0, 2).toUpperCase() : '??'
})

// ── CHARGEMENTS API ──
const loadTypeAppel = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const resp = await fetch(apiTypeAppel, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) { const r = await resp.json(); typeAppelOptions.value = r.data || [] }
  } catch (e) { console.error('Erreur types appel:', e) }
}

const loadTypeRequete = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const resp = await fetch(apiTypeRequete, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) { const r = await resp.json(); typeRequeteOptions.value = r.data || [] }
  } catch (e) { console.error('Erreur types requête:', e) }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) { alert('Vous devez être connecté.'); router.push('/login'); return }

  const storedUser = localStorage.getItem('user')
  if (storedUser) user.value = JSON.parse(storedUser)

  loadTypeAppel()
  loadTypeRequete()
  loadAppelsCache()   // ← charge le cache pour la recherche
})

// ── HISTORIQUE (données statiques) ──
const historique = ref([
  { titre: 'Problème de connexion',     satisfaction: 'Haute priorité',   client: 'Jean Dupont',     statut: 'En cours',    date: '15/02/2024 à 14:30' },
  { titre: 'Demande de devis',          satisfaction: 'Priorité moyenne',  client: 'Marie Martin',    statut: 'Terminé',     date: '14/02/2024 à 09:15' },
  { titre: 'Question sur la facturation', satisfaction: 'Basse priorité', client: 'Pierre Durand',   statut: 'En attente',  date: '13/02/2024 à 11:45' },
  { titre: 'Réclamation facture',       satisfaction: 'Haute priorité',   client: 'Sophie Lambert',  statut: 'En cours',    date: '12/02/2024 à 16:20' },
  { titre: 'Changement forfait',        satisfaction: 'Basse priorité',   client: 'Thomas Bernard',  statut: 'Terminé',     date: '11/02/2024 à 10:10' }
])

const getPriorityClass = (p) => {
  if (p.includes('Haute'))   return 'priority-high'
  if (p.includes('moyenne')) return 'priority-medium'
  return 'priority-low'
}

// ── NAVIGATION ONGLET CLIENT → REQUÊTE ──
/*
  Valide uniquement les champs de l'onglet "client" avant de basculer.
  Si un champ obligatoire est manquant, on reste sur l'onglet et on
  affiche les bordures d'erreur — même comportement que submitForm().
*/
const goToRequete = () => {
  errors.telephone = !formData.client.telephone
  errors.nom       = !formData.client.nom
  errors.prenom    = !formData.client.prenom
  errors.typeAppel = !formData.client.typeAppel

  const clientValid = !errors.telephone && !errors.nom && !errors.prenom && !errors.typeAppel
  if (!clientValid) {
    alert('Veuillez remplir tous les champs obligatoires avant de continuer.')
    return
  }
  activeTab.value = 'requete'
}

// ── VALIDATION ──
const validate = () => {
  errors.telephone    = !formData.client.telephone
  errors.nom          = !formData.client.nom
  errors.prenom       = !formData.client.prenom
  errors.typeAppel    = !formData.client.typeAppel
  errors.typeRequete  = !formData.requete.typeRequete
  errors.objetRequete = !formData.requete.objetRequete
  errors.detailRequete = !formData.requete.detailRequete
  return !Object.values(errors).some(e => e === true)
}

// ── SOUMISSION ──
const submitForm = async () => {
  if (!validate()) {
    alert('Veuillez remplir tous les champs obligatoires.')
    activeTab.value = (errors.nom || errors.prenom || errors.telephone || errors.typeAppel)
      ? 'client' : 'requete'
    return
  }

  const data_appel = {
    telephone:      formData.client.telephone,
    civilite:       formData.client.civilite,
    nom:            formData.client.nom,
    prenom:         formData.client.prenom,
    telephone_perso: formData.client.telephone_perso,
    ville:          formData.client.ville,
    typeAppel:      formData.client.typeAppel,
    typeRequete:    formData.requete.typeRequete,
    objetRequete:   formData.requete.objetRequete,
    detailRequete:  formData.requete.detailRequete,
    userId:         user.value.id,
    satisfaction:   formData.requete.satisfaction || 'non_satisfait',
    ticket:         formData.requete.ticket,
    raison_ticket:  formData.requete.raisonticket
  }

  try {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    const response = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify(data_appel)
    })

    let data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement')

    let appelUid = data.appel_id

    if (formData.requete.ticket === 'true' && appelUid) {
      try {
        const ticketData = {
          appel_uid:          appelUid,
          numero_appellant:   formData.client.telephone,
          type_requetes_code: formData.requete.typeRequete,
          user_uid:           user.value.id,
          username:           user.value.username,
          raison:             formData.requete.raisonticket || formData.requete.objetRequete
        }
        const ticketResponse = await fetch(apiTicket, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify(ticketData)
        })
        const ticketResult = await ticketResponse.json()
        if (ticketResponse.ok) {
          const ticketCode = ticketResult.data?.code || ticketResult.code
          alert(`✅ ${data.message || 'Appel enregistré'}\n📋 Ticket créé avec le code : ${ticketCode}`)
        } else {
          alert(`⚠️ ${data.message || 'Appel enregistré'}\n❌ Ticket non créé : ${ticketResult.message || 'Erreur inconnue'}`)
        }
      } catch (ticketError) {
        alert(`⚠️ ${data.message || 'Appel enregistré'}\n❌ Erreur ticket: ${ticketError.message}`)
      }
    } else {
      alert(`✅ ${data.message || 'Appel enregistré avec succès'}`)
    }

    resetForm()

    // Met à jour le cache avec le nouvel appelant pour les prochaines recherches
    appelsCache.value.push({
      telephone:       formData.client.telephone,
      civilite:        formData.client.civilite,
      nom:             formData.client.nom,
      prenom:          formData.client.prenom,
      telephone_perso: formData.client.telephone_perso,
      ville:           formData.client.ville,
    })

  } catch (error) {
    console.error('Erreur réseau:', error)
    alert(`❌ Impossible de se connecter au serveur: ${error.message}`)
  }
}

// ── RESET FORMULAIRE ──
const resetForm = () => {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser ?')) {
    Object.assign(formData.client,  { civilite: '', nom: '', prenom: '', typeAppel: '', telephone: '', telephone_perso: '', ville: '', anonymat: false })
    Object.assign(formData.requete, { objetRequete: '', typeRequete: '', detailRequete: '', satisfaction: '', ticket: false, raisonticket: '' })
    resetSearch()
  }
}

const handleTicketChange = () => {
  formData.requete.ticket = formData.requete.ticket ? 'true' : 'false'
  if (formData.requete.ticket === 'false') formData.requete.raisonticket = ''
}

const handleAnonymatChange = () => {
  if (!formData.client.anonymat) {
    formData.client.nom = ''; formData.client.prenom = ''; formData.client.telephone_perso = ''
  } else {
    formData.client.nom = 'ANONYMAT'; formData.client.prenom = 'ANONYMAT'; formData.client.telephone_perso = 'XXXXXXXXXX'
    document.getElementById('nom').readOnly = true
    document.getElementById('prenom').readOnly = true
    document.getElementById('telephone_perso').readOnly = true
  }
}

const confirmLogout = async () => {
  try {
    const token = localStorage.getItem('token')
    if (token) await fetch(apiLogout, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, credentials: 'include' })
  } catch (e) { console.error('Erreur déconnexion:', e) } finally {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    showLogoutModal.value = false; router.push('/login')
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

:global(html), :global(body) {
  margin: 0; padding: 0;
  min-height: 100vh; width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.fullscreen-content {
  min-height: 100vh; width: 100%;
  display: flex; flex-direction: column;
  padding: 20px 40px;
  max-width: 1400px; margin: 0 auto;
  font-family: 'Segoe UI', sans-serif;
}

/* ── TABS ── */
.tabs-container {
  background: white;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
}
.tabs { display: flex; background: #f8f9fa; border-bottom: 2px solid #dee2e6; }
.tab {
  flex: 1; padding: 18px 20px; text-align: center;
  cursor: pointer; border: none; background: none;
  font-size: 16px; font-weight: 600; color: #6c757d;
  transition: all 0.3s ease; position: relative;
}
.tab.active { color: #667eea; background-color: white; }
.tab.active::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 100%; height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* ── CONTENU ONGLETS ── */
.fullscreen-tab-content {
  background: white;
  border-radius: 0 0 15px 15px;
  padding: 30px; flex: 1;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.content-header { margin-bottom: 25px; }

/* ══════════════════════════════════════════
   BLOC RECHERCHE
══════════════════════════════════════════ */
.search-block {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf0ff 100%);
  border: 1.5px solid #c7d2fe;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.search-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #4338ca;
  margin-bottom: 12px;
  letter-spacing: 0.3px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
}

.search-input {
  width: 100%;
  padding: 12px 42px 12px 16px;
  border: 2px solid #c7d2fe;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}
.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.15);
}
.search-input.search-not-found {
  border-color: #dc3545;
  background: #fff5f5;
}

/* Icône de statut dans le champ */
.search-status {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  pointer-events: none;
}

.btn-search {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-search:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102,126,234,0.4);
}
.btn-search:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-reset-search {
  padding: 12px 14px;
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}
.btn-reset-search:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

/* Messages de feedback */
.search-feedback {
  margin-top: 10px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  display: inline-block;
}
.search-feedback.found     { background: #d1fae5; color: #065f46; }
.search-feedback.not-found { background: #fee2e2; color: #991b1b; }

/* Liste déroulante multi-résultats */
.search-dropdown {
  margin-top: 12px;
  border: 1.5px solid #c7d2fe;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.dropdown-title {
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  border-bottom: 1px solid #c7d2fe;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover { background: #f5f3ff; }
.dropdown-phone { font-family: monospace; font-weight: 700; color: #4338ca; font-size: 14px; min-width: 110px; }
.dropdown-name  { flex: 1; font-weight: 600; color: #374151; font-size: 14px; }
.dropdown-ville { font-size: 12px; color: #9ca3af; }

/* ── FORMULAIRE ── */
.form-grid    { max-width: 1200px; margin: 0 auto; }
.form-row     { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px; }
.form-row.full-width { grid-template-columns: 1fr; }
.form-group   { margin-bottom: 0; }

label {
  display: block; margin-bottom: 8px;
  font-weight: 600; color: #495057; font-size: 14px;
}
label .required { color: #dc3545; margin-left: 3px; }

input, select, textarea {
  width: 100%; padding: 14px 18px;
  border: 2px solid #e1e5e9; border-radius: 10px;
  font-size: 15px; transition: all 0.3s ease; font-family: inherit;
}
input:focus, select:focus, textarea:focus {
  outline: none; border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}
.error-border { border-color: #dc3545 !important; }
textarea { resize: vertical; min-height: 120px; }

.checkbox-item { display: flex; align-items: center; gap: 10px; margin-top: 32px; }
.checkbox-item input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; }
.checkbox-item label { margin-bottom: 0; cursor: pointer; font-size: 15px; }

/* ── HISTORIQUE ── */
.history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px,1fr)); gap: 25px; padding: 10px; }
.history-card { background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.history-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(102,126,234,0.2); }
.history-card-header { padding: 18px; background: white; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
.history-card-header h3 { color: #495057; font-size: 16px; font-weight: 600; margin: 0; }
.history-card-body { padding: 18px; }
.history-card-body p { margin-bottom: 10px; color: #6c757d; }
.history-card-body strong { color: #495057; }
.status-badge { background: #e7f5ff; color: #0c5460; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.priority-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.priority-high   { background-color: #fee; color: #c00; }
.priority-medium { background-color: #fff3cd; color: #856404; }
.priority-low    { background-color: #d4edda; color: #155724; }
.history-date { color: #adb5bd; font-size: 12px; margin-top: 15px; font-style: italic; }

/* ── ACTIONS ── */
.action-bar { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; }
.button-group { display: flex; gap: 15px; justify-content: flex-end; }
.btn { padding: 14px 35px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,0.4); }
.btn-secondary { background-color: #e9ecef; color: #495057; }
.btn-secondary:hover { background-color: #dee2e6; transform: translateY(-2px); }
.btn-danger { background: #dc3545; color: white; }
.btn-danger:hover { background: #c82333; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(220,53,69,0.3); }

.info-message { background: #e7f5ff; color: #0c5460; padding: 18px 25px; border-radius: 12px; font-size: 15px; border-left: 5px solid #17a2b8; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }

/* ── MODAL ── */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.3s ease; }
.modal-content { background: white; border-radius: 15px; padding: 35px; width: 90%; max-width: 450px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease; }
.modal-content h3 { color: #495057; margin-bottom: 15px; font-size: 1.5rem; }
.modal-content p  { color: #6c757d; margin-bottom: 30px; line-height: 1.6; }
.modal-actions { display: flex; gap: 15px; justify-content: flex-end; }

/* ── FOOTER ── */
.form_appel-footer { text-align: center; padding: 16px; color: rgba(255,255,255,0.7); font-size: 13px; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .fullscreen-content { padding: 20px; }
  .history-grid { grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); }
}
@media (max-width: 768px) {
  .fullscreen-content { padding: 15px; }
  .tabs { flex-direction: column; }
  .tab { width: 100%; }
  .tab.active::after { bottom: auto; top: 0; height: 100%; width: 3px; }
  .form-row { grid-template-columns: 1fr; gap: 15px; }
  .search-row { flex-wrap: wrap; }
  .search-input-wrap { max-width: 100%; flex: 1 1 200px; }
  .checkbox-item { margin-top: 0; }
  .button-group { flex-direction: column; }
  .btn { width: 100%; justify-content: center; }
  .history-grid { grid-template-columns: 1fr; }
  .modal-content { width: 95%; padding: 25px; }
  .modal-actions { flex-direction: column; }
}
</style>
<template>
  <div class="call-center-container">
    <header class="cc-header">
      <div class="cc-logo">
        <span class="pulse-icon"></span>
        <h1>FORMULAIRE APPEL</h1>
      </div>
      <!-- <div class="cc-user-info">
        <span class="user-badge">{{ userInitials }}</span>
        <div class="user-details">
          <p class="user-name">{{ username }}</p>
          <p class="user-role">{{ userRoleLabel }}</p>
        </div>
        <button class="btn-logout-mini" @click="showLogoutModal = true" title="Déconnexion">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div> -->
    </header>

    <main class="cc-main-content">
      <div class="stepper-wrapper">
        <div class="step" :class="{ active: activeTab === 'client', completed: activeTab === 'requete' || activeTab === 'historique' }">
          <div class="step-number">1</div>
          <div class="step-label">Informations Appelant</div>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ active: activeTab === 'requete', completed: activeTab === 'historique' }">
          <div class="step-number">2</div>
          <div class="step-label">Détails de l'Appel</div>
        </div>
      </div>

      <div class="form-card">
        
        <div v-if="activeTab === 'client'" class="step-content">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Identification de l'appelant
          </div>

          <div class="quick-search-box">
            <div class="search-input-container">
              <input 
                type="tel" 
                v-model="searchPhone"
                placeholder="Rechercher par numéro (ex: 010203...)" 
                maxlength="10"
                @input="searchPhone = $event.target.value.replace(/[^0-9]/g, ''); onSearchInput()"
                @keyup.enter="searchCaller"
                :class="{ 'input-error': searchStatus === 'not_found' }"
              />
              <div class="search-actions">
                <span v-if="searchStatus === 'loading'" class="loader-small"></span>
                <button @click="searchCaller" class="btn-search-action" :disabled="searchPhone.length < 8">Rechercher</button>
              </div>
            </div>
            
            <div v-if="searchStatus === 'found'" class="alert-success-mini">✅ Appelant identifié dans la base.</div>
            <div v-if="searchStatus === 'not_found'" class="alert-error-mini">❌ Nouveau appelant (non répertorié).</div>

            <div v-if="searchResults.length > 1" class="search-results-dropdown">
              <div v-for="(r, i) in searchResults" :key="i" class="result-item" @click="fillFromResult(r)">
                <strong>{{ r.telephone }}</strong> - {{ r.nom }} {{ r.prenom }} ({{ r.ville }})
              </div>
            </div>
          </div>

          <div class="grid-form">
            <div class="field">
              <label>Téléphone Appelant <span class="req">*</span></label>
              <input v-model="formData.client.telephone" type="tel" :class="{ 'error-border': errors.telephone }" placeholder="0000000000" id="telephone">
            </div>
            <div class="field">
              <label>Civilité</label>
              <select v-model="formData.client.civilite">
                <option value="">Non spécifié</option>
                <option value="mr">Monsieur</option>
                <option value="mme">Madame</option>
                <option value="mlle">Mademoiselle</option>
              </select>
            </div>
            <div class="field">
              <label>Nom <span class="req">*</span></label>
              <input v-model="formData.client.nom" id="nom" :class="{ 'error-border': errors.nom }" placeholder="NOM">
            </div>
            <div class="field">
              <label>Prénom <span class="req">*</span></label>
              <input v-model="formData.client.prenom" id="prenom" :class="{ 'error-border': errors.prenom }" placeholder="Prénom">
            </div>
            <div class="field">
              <label>Ville / Localité <span class="req">*</span></label>
              <select v-model="formData.client.ville" :class="{ 'error-border': errors.ville }">
                <option value="">Choisir une localité...</option>
                <option v-for="item in localiteOptions" :key="item.uid" :value="item.libelle">{{ item.libelle }}</option>
                <option value="autre">-- Autre --</option>
              </select>
            </div>
            <div class="field" v-if="formData.client.ville === 'autre'">
              <label>Préciser la ville</label>
              <input v-model="formData.client.ville_autre" placeholder="Saisissez la ville">
            </div>
            <div class="field">
              <label>Type d'Appel <span class="req">*</span></label>
              <select v-model="formData.client.typeAppel" :class="{ 'error-border': errors.typeAppel }">
                <option value="">Sélectionner...</option>
                <option v-for="item in typeAppelOptions" :key="item.code" :value="item.code">{{ item.libelle }}</option>
              </select>
            </div>
          </div>

          <div class="options-row">
            <label class="toggle">
              <input type="checkbox" v-model="formData.client.masquage" @change="handleMasquageChange">
              <span class="slider"></span>
              <span class="toggle-label">Masquer le numéro</span>
            </label>
            <label class="toggle">
              <input type="checkbox" v-model="formData.client.anonymat" @change="handleAnonymatChange">
              <span class="slider"></span>
              <span class="toggle-label">Appel Anonyme</span>
            </label>
          </div>

          <div class="footer-actions">
            <button class="btn-next" @click="goToRequete">
              Suivant : Détails de l'appel
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'requete'" class="step-content">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Qualification de la demande
          </div>

          <div class="full-form">
            <div class="field">
              <label>Type de requête <span class="req">*</span></label>
              <select v-model="formData.requete.typeRequete" :class="{ 'error-border': errors.typeRequete }">
                <option value="">Nature de la demande...</option>
                <option v-for="item in typeRequeteOptions" :key="item.code" :value="item.code">{{ item.libelle }}</option>
              </select>
            </div>
            <div class="field">
              <label>Objet <span class="req">*</span></label>
              <input v-model="formData.requete.objetRequete" :class="{ 'error-border': errors.objetRequete }" placeholder="Résumé court de la demande">
            </div>
            <div class="field">
              <label>Description détaillée <span class="req">*</span></label>
              <textarea v-model="formData.requete.detailRequete" rows="6" :class="{ 'error-border': errors.detailRequete }" placeholder="Saisissez ici les notes de l'entretien..."></textarea>
            </div>

            <div class="grid-form">
              <div class="field">
                <label>Niveau de Satisfaction</label>
                <div class="satisfaction-picker">
                  <button type="button" @click="formData.requete.satisfaction = 'satisfait'" :class="{ active: formData.requete.satisfaction === 'satisfait' }" class="sat-btn green">Satisfait</button>
                  <button type="button" @click="formData.requete.satisfaction = 'non_satisfait'" :class="{ active: formData.requete.satisfaction === 'non_satisfait' }" class="sat-btn red">Insatisfait</button>
                </div>
              </div>
              <div class="field">
                <label>Action</label>
                <label class="toggle mt-10">
                  <input type="checkbox" v-model="formData.requete.ticket" @change="handleTicketChange">
                  <span class="slider"></span>
                  <span class="toggle-label">Ouvrir un ticket d'incident</span>
                </label>
              </div>
            </div>

            <div class="field animate-fade" v-if="formData.requete.ticket === 'true' || formData.requete.ticket === true">
              <label>Motif de création du ticket</label>
              <textarea v-model="formData.requete.raisonticket" placeholder="Pourquoi ce ticket est-il nécessaire ?"></textarea>
            </div>
          </div>

          <div class="footer-actions space-between">
            <button class="btn-back" @click="activeTab = 'client'">Retour</button>
            <div class="group">
              <button class="btn-submit" @click="submitForm">Enregistrer l'Appel</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showLogoutModal" class="cc-modal-overlay">
      <div class="cc-modal">
        <h3>Fin de session</h3>
        <p>Voulez-vous vraiment vous déconnecter du CRM ?</p>
        <div class="modal-btns">
          <button class="btn-cancel" @click="showLogoutModal = false">Annuler</button>
          <button class="btn-danger-confirm" @click="confirmLogout">Quitter</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// [Garder TOUT le script original ici, aucune modification n'est requise sur la logique]
// Copie/colle exactement ton bloc <script setup> précédent.
import { API_BASE } from '@/config/api.js'
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router   = useRouter()
const apiBase       = API_BASE + '/api/appel'
const apiTypeAppel  = API_BASE + '/api/typeAppel'
const apiTypeRequete = API_BASE + '/api/typeRequete'
const apiLogout     = API_BASE + '/api/auth/logout'
const apiTicket     = API_BASE + '/api/ticket'
const apiLocalite   = API_BASE + '/api/localite'

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


// FORMULAIRE DATA
const formData = reactive({
  client: { telephone: '', civilite: '', nom: '', prenom: '', telephone_perso: '', ville: '', typeAppel: '', anonymat: false, masquage: false, ville_autre: '' },
  requete: { typeRequete: '', objetRequete: '', detailRequete: '', satisfaction: '', ticket: false, raisonticket: '' }
})

const errors = reactive({ nom: false, prenom: false, telephone: false, ville: false, typeAppel: false, typeRequete: false, objetRequete: false, detailRequete: false })
const typeAppelOptions  = ref([]); const typeRequeteOptions = ref([]); const localiteOptions = ref([])
const user = ref({})
const userRoleLabel = computed(() => { 
    const labels = { admin: 'Administrateur', superviseur: 'Superviseur', agent: 'Agent' }
    return labels[user.value.role] || user.value.role || 'Agent'
})
const username = computed(() => user.value.username || 'Utilisateur')
const userInitials = computed(() => user.value.username ? user.value.username.charAt(0).toUpperCase() : 'AG')

const loadTypeAppel = async () => {
  const token = localStorage.getItem('token')
  const resp = await fetch(apiTypeAppel, { headers: { 'Authorization': `Bearer ${token}` } })
  if (resp.ok) { const r = await resp.json(); typeAppelOptions.value = r.data || [] }
}
const loadTypeRequete = async () => {
  const token = localStorage.getItem('token')
  const resp = await fetch(apiTypeRequete, { headers: { 'Authorization': `Bearer ${token}` } })
  if (resp.ok) { const r = await resp.json(); typeRequeteOptions.value = r.data || [] }
}
const loadLocalite = async () => {
  const token = localStorage.getItem('token')
  const resp = await fetch(apiLocalite, { headers: { 'Authorization': `Bearer ${token}` } })
  if (resp.ok) { const r = await resp.json(); localiteOptions.value = r.data || [] }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  const storedUser = localStorage.getItem('user')
  if (storedUser) user.value = JSON.parse(storedUser)
  loadTypeAppel(); loadTypeRequete(); loadLocalite(); loadAppelsCache()
})

const goToRequete = () => {
  errors.telephone = !formData.client.telephone; errors.nom = !formData.client.nom; errors.prenom = !formData.client.prenom
  errors.ville = !String(formData.client.ville || '').trim(); errors.typeAppel = !formData.client.typeAppel
  if (Object.values(errors).slice(0, 5).some(e => e)) { alert('Veuillez remplir les champs obligatoires.'); return }
  activeTab.value = 'requete'
}

const validate = () => {
  errors.typeRequete = !formData.requete.typeRequete; errors.objetRequete = !formData.requete.objetRequete; errors.detailRequete = !formData.requete.detailRequete
  return !Object.values(errors).some(e => e === true)
}

/* const submitForm = async () => {
  if (!validate()) return alert('Formulaire incomplet.')
  const data_appel = {
    ...formData.client, ...formData.requete,
    ville: formData.client.ville === 'autre' ? formData.client.ville_autre : formData.client.ville,
    userId: user.value.id
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')
    const response = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data_appel)
    })
    if (response.ok) {
        alert('Appel enregistré avec succès !')
        resetForm()
        activeTab.value = 'client'
    }
  } catch (e) { alert('Erreur lors de la sauvegarde.') }
} */

const submitForm = async () => {
  // 1. Validation avec redirection automatique vers l'étape contenant l'erreur
  if (!validate()) {
    alert('Veuillez remplir tous les champs obligatoires.')
    // Si l'une des erreurs concerne le client, on retourne au Step 1, sinon on reste au Step 2
    activeTab.value = (errors.nom || errors.prenom || errors.telephone || errors.ville || errors.typeAppel)
      ? 'client' : 'requete'
    return
  }

  // 2. Préparation de l'objet de données pour l'appel
  const data_appel = {
    telephone:       formData.client.telephone,
    civilite:        formData.client.civilite,
    nom:             formData.client.nom,
    prenom:          formData.client.prenom,
    telephone_perso: formData.client.telephone_perso,
    ville:           formData.client.ville === 'autre' ? formData.client.ville_autre : formData.client.ville,
    typeAppel:       formData.client.typeAppel,
    typeRequete:     formData.requete.typeRequete,
    objetRequete:    formData.requete.objetRequete,
    detailRequete:   formData.requete.detailRequete,
    userId:          user.value.id,
    satisfaction:    formData.requete.satisfaction || 'non_satisfait',
    ticket:          formData.requete.ticket,
    raison_ticket:   formData.requete.raisonticket
  }

  try {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    // 3. Enregistrement de l'appel
    const response = await fetch(apiBase, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      credentials: 'include',
      body: JSON.stringify(data_appel)
    })

    let data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement')

    let appelUid = data.appel_id

    // 4. Gestion conditionnelle de la création du ticket
    // Note: on vérifie 'true' (string) ou true (boolean) selon ton composant
    if ((formData.requete.ticket === 'true' || formData.requete.ticket === true) && appelUid) {
      try {
        const ticketData = {
          appel_id:          appelUid,
          numero_appellant:   formData.client.telephone,
          type_requetes_code: formData.requete.typeRequete,
          user_id:           user.value.id,
        //  username:           user.value.username,
          raison:             formData.requete.raisonticket || formData.requete.objetRequete
        }

        const ticketResponse = await fetch(apiTicket, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
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

    // 5. Mise à jour du cache local pour les futures recherches (évite un appel API)
    appelsCache.value.push({
      telephone:       formData.client.telephone,
      civilite:        formData.client.civilite,
      nom:             formData.client.nom,
      prenom:          formData.client.prenom,
      telephone_perso: formData.client.telephone_perso,
      ville:           data_appel.ville, // Utilise la ville traitée (autre ou select)
    })

    // 6. Réinitialisation et retour au premier onglet
    resetForm()
    activeTab.value = 'client'

  } catch (error) {
    console.error('Erreur réseau:', error)
    alert(`❌ Impossible de se connecter au serveur: ${error.message}`)
  }
} 

const resetForm = () => {
  if (confirm('Réinitialiser le formulaire ?')) {
    Object.assign(formData.client, { telephone: '', nom: '', prenom: '', ville: '', typeAppel: '', anonymat: false, masquage: false })
    Object.assign(formData.requete, { objetRequete: '', typeRequete: '', detailRequete: '', satisfaction: '', ticket: false })
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
    formData.client.nom = 'ANONYMAT'; formData.client.prenom = 'ANONYMAT'; formData.client.telephone_perso = '0000000000'
    document.getElementById('nom').readOnly = true
    document.getElementById('prenom').readOnly = true
    document.getElementById('telephone_perso').readOnly = true
  }
}

const handleMasquageChange = () => {
  const telEl = document.getElementById('telephone')
  if (!formData.client.masquage) {
    if (telEl) telEl.readOnly = false
    formData.client.telephone = ''
  } else {
    formData.client.telephone = '0000000000'
    if (telEl) telEl.readOnly = true
  }
}
const confirmLogout = () => { localStorage.clear(); router.push('/login') }
</script>

<style scoped>
/* BASICS */
.call-center-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1f36;
}

/* HEADER */
.cc-header {
  background: #ffffff;
  padding: 12px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e3e8ee;
  position: sticky;
  top: 0;
  z-index: 100;
}
.cc-logo { display: flex; align-items: center; gap: 12px; }
.cc-logo h1 { font-size: 18px; font-weight: 800; color: #5469d4; letter-spacing: -0.5px; }
.pulse-icon { width: 10px; height: 10px; background: #24b47e; border-radius: 50%; box-shadow: 0 0 0 4px rgba(36,180,126,0.2); }

.cc-user-info { display: flex; align-items: center; gap: 12px; }
.user-badge { width: 36px; height: 36px; background: #5469d4; color: white; display: grid; place-items: center; border-radius: 8px; font-weight: bold; }
.user-name { font-size: 14px; font-weight: 600; margin: 0; }
.user-role { font-size: 12px; color: #697386; margin: 0; }
.btn-logout-mini { background: none; border: none; color: #697386; cursor: pointer; padding: 5px; border-radius: 5px; }
.btn-logout-mini:hover { background: #fee2e2; color: #dc2626; }

/* STEPPER */
.cc-main-content { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
.stepper-wrapper { display: flex; align-items: center; justify-content: center; margin-bottom: 30px; gap: 20px; }
.step { display: flex; align-items: center; gap: 10px; opacity: 0.5; transition: 0.3s; }
.step.active { opacity: 1; font-weight: bold; }
.step.completed { opacity: 1; color: #24b47e; }
.step-number { width: 28px; height: 28px; border-radius: 50%; background: #697386; color: white; display: grid; place-items: center; font-size: 14px; }
.step.active .step-number { background: #5469d4; }
.step.completed .step-number { background: #24b47e; }
.step-line { flex: 0 1 100px; height: 2px; background: #e3e8ee; }

/* FORM CARD */
.form-card { background: white; border-radius: 12px; box-shadow: 0 7px 14px rgba(50,50,93,0.1), 0 3px 6px rgba(0,0,0,0.08); padding: 40px; }
.section-title { font-size: 20px; font-weight: 700; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; color: #1a1f36; }

/* SEARCH BOX */
.quick-search-box { background: #f7fafc; padding: 20px; border-radius: 10px; border: 1px solid #e3e8ee; margin-bottom: 30px; }
.search-input-container { display: flex; gap: 10px; }
.search-input-container input { flex: 1; padding: 12px 16px; border: 2px solid #e3e8ee; border-radius: 8px; font-size: 15px; }
.btn-search-action { background: #5469d4; color: white; border: none; padding: 0 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.alert-success-mini { color: #24b47e; font-size: 13px; font-weight: 600; margin-top: 8px; }
.alert-error-mini { color: #dc2626; font-size: 13px; font-weight: 600; margin-top: 8px; }

/* GRID */
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.field label { font-size: 14px; font-weight: 600; color: #4f566b; }
.req { color: #ff5f5f; }
input, select, textarea { padding: 12px; border: 1px solid #dcdfe6; border-radius: 8px; font-size: 15px; background: #fff; transition: 0.2s; }
input:focus, select:focus, textarea:focus { border-color: #5469d4; outline: none; box-shadow: 0 0 0 3px rgba(84,105,212,0.1); }
.error-border { border-color: #ff5f5f !important; }

/* TOGGLE SWITCH */
.options-row { display: flex; gap: 40px; margin: 10px 0 30px 0; }
.toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.slider { width: 40px; height: 20px; background: #e3e8ee; border-radius: 20px; position: relative; transition: 0.3s; }
.slider:before { content:''; position: absolute; width: 16px; height: 16px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: 0.3s; }
input[type="checkbox"] { display: none; }
input:checked + .slider { background: #5469d4; }
input:checked + .slider:before { transform: translateX(20px); }
.toggle-label { font-size: 14px; font-weight: 500; }

/* SATISFACTION */
.satisfaction-picker { display: flex; gap: 10px; }
.sat-btn { flex: 1; padding: 10px; border: 1px solid #e3e8ee; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.sat-btn.green.active { background: #eafcf1; border-color: #24b47e; color: #24b47e; }
.sat-btn.red.active { background: #fff5f5; border-color: #ff5f5f; color: #ff5f5f; }

/* FOOTER ACTIONS */
.footer-actions { margin-top: 40px; display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #f0f2f5; padding-top: 30px; }
.space-between { justify-content: space-between; }
.btn-next, .btn-submit { background: #5469d4; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
.btn-next:hover, .btn-submit:hover { background: #4355b9; transform: translateY(-1px); }
.btn-back { background: white; border: 1px solid #dcdfe6; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-reset { background: transparent; color: #697386; border: none; cursor: pointer; font-weight: 500; }

/* MODAL */
.cc-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: grid; place-items: center; z-index: 1000; }
.cc-modal { background: white; padding: 30px; border-radius: 12px; width: 400px; text-align: center; }
.modal-btns { display: flex; gap: 10px; margin-top: 25px; }
.modal-btns button { flex: 1; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; border: none; }
.btn-danger-confirm { background: #dc2626; color: white; }

@media (max-width: 768px) {
  .grid-form { grid-template-columns: 1fr; }
  .form-card { padding: 20px; }
  .options-row { flex-direction: column; gap: 15px; }
}
</style>
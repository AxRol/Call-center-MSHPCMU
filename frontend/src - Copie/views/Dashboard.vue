<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Données du mois de {{ currentMonthLabel }}</p>
      </div>
      <div class="header-actions">
        <a href="/formulaire_appel" target="_blank" rel="noopener" class="btn-form-appel" v-if="isAgent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.08-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
          </svg>
          Ouvrir un formulaire appel
        </a>
        <button class="btn-primary" @click="loadData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loading-bar">
      <span>Chargement des données...</span>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="kpi in kpiCards" :key="kpi.id">
        <div class="kpi-icon" :style="{ background: kpi.bg, color: kpi.color }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <!-- Appels totaux -->
            <g v-if="kpi.icon === 'calls'">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </g>
            <!-- Taux de satisfaction -->
            <g v-else-if="kpi.icon === 'percent'">
              <line x1="19" y1="5" x2="5" y2="19" />
              <circle cx="6.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </g>
            <!-- Tickets en attente -->
            <g v-else-if="kpi.icon === 'clock'">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </g>
            <!-- Tickets ouverts -->
            <g v-else-if="kpi.icon === 'inbox'">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </g>
            <!-- Tickets clos -->
            <g v-else-if="kpi.icon === 'check'">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </g>
            <!-- Tickets terminés -->
            <g v-else-if="kpi.icon === 'award'">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.09 13a5.5 5.5 0 0 1-6.18 0L7 23l5-3 5 3-1.09-10z" />
            </g>
            <circle v-else cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">{{ kpi.label }}</span>
          <span class="kpi-value">{{ kpi.value }}</span>
          <!--
            Pour certaines KPIs, on affiche aussi un petit détail (Top N).
            Exemple: "Appels par type" => liste des 3 types les plus fréquents.
          -->
          <div v-if="kpi.details && kpi.details.length" class="kpi-details">
            <div v-for="d in kpi.details" :key="d.label" class="kpi-detail">
              <span class="kpi-detail-label">{{ d.label }}</span>
              <span class="kpi-detail-val">{{ d.val }}</span>
            </div>
          </div>
          <!-- <span class="kpi-trend" :class="kpi.trend > 0 ? 'up' : 'down'">
            {{ kpi.trend > 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}% ce mois
          </span> -->
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <div class="chart-card large">
        <div class="chart-header">
          <div>
            <h3>Activité par mois</h3>
            <span class="chart-sub">Appels et tickets sur les 12 derniers mois</span>
          </div>
          <div class="chart-legend">
            <span class="legend-dot" style="background:var(--accent)"></span> Appels
            <span class="legend-dot" style="background:var(--accent-secondary)"></span> Tickets
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas ref="lineChartRef" height="100"></canvas>
        </div>
      </div>

<!--       <div class="chart-card small">
        <div class="chart-header">
          <div>
            <h3>Satisfaction</h3>
            <span class="chart-sub">Répartition des appels</span>
          </div>
        </div>
        <div class="chart-wrapper doughnut-wrap">
          <canvas ref="doughnutChartRef" width="180" height="180"></canvas>
          <div class="doughnut-center">
            <span class="doughnut-total">{{ appels.length }}</span>
            <span class="doughnut-label">Appels</span>
          </div>
        </div>
        <div class="doughnut-legend">
          <div v-for="item in doughnutLegend" :key="item.label" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.label }}</span>
            <span class="legend-val">{{ item.val }}</span>
          </div>
        </div>
      </div> -->

      <!-- Doughnut: Appels par requête -->
      <div class="chart-card small">
        <div class="chart-header">
          <div>
            <h3>Appels par requête</h3>
            <span class="chart-sub">Répartition des appels</span>
          </div>
        </div>
        <div class="chart-wrapper doughnut-wrap">
          <canvas ref="callRequeteDoughnutChartRef" width="180" height="180"></canvas>
          <div class="doughnut-center">
            <span class="doughnut-total">{{ appelsThisMonth.length }}</span>
            <span class="doughnut-label">Appels</span>
          </div>
        </div>
        <div class="doughnut-legend">
          <div v-for="item in callRequeteDoughnutLegend" :key="item.label" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.label }}</span>
            <span class="legend-val">{{ item.val }}</span>
          </div>
        </div>
      </div>
      <!-- Doughnut: Tickets par statut -->
      <div class="chart-card small">
        <div class="chart-header">
          <div>
            <h3>Tickets par statut</h3>
            <span class="chart-sub">Répartition des tickets</span>
          </div>
        </div>
        <div class="chart-wrapper doughnut-wrap">
          <canvas ref="ticketsStatusDoughnutChartRef" width="180" height="180"></canvas>
          <div class="doughnut-center">
            <span class="doughnut-total">{{ ticketsThisMonth.length }}</span>
            <span class="doughnut-label">Tickets</span>
          </div>
        </div>
        <div class="doughnut-legend">
          <div v-for="item in ticketsStatusDoughnutLegend" :key="item.label" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span>{{ item.label }}</span>
            <span class="legend-val">{{ item.val }}</span>
          </div>
        </div>
      </div>
      
      
    </div>

    <!-- Recent table -->
    <div class="table-card" v-if="!isInspecteur">
      <div class="table-header">
        <h3>Appels récents</h3>
        <router-link to="/appels" class="btn-text">Voir tout →</router-link>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Appelant</th>
            <th>Téléphone</th>
            <th>Requête</th>
            <th>Satisfaction</th>
            <th>Agent</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="recentCalls.length === 0">
            <td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">
              Aucun appel récent
            </td>
          </tr>
          <tr v-for="call in recentCalls" :key="call.id">
            <td class="id-cell">{{ call.appelant || '—' }}</td>
            <td class="mono">{{ call.telephone }}</td>
            <td>{{ call.requete || '—' }}</td>
            <td>
              <span class="status-badge" :class="call.satisfaction">
                {{ statusLabels[call.satisfaction] || call.satisfaction || 'N/A' }}
              </span>
            </td>
            <td class="muted">{{ call.agent || '—' }}</td>
            <td class="muted">{{ call.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tickets récents -->
    <div class="table-card">
      <div class="table-header">
        <h3>Tickets récents</h3>
        <!--
          Pour l'inspecteur, "Voir tout" signifie "Voir mes tickets"
          (c'est géré par un paramètre d'URL: ?mine=1).
        -->
        <router-link
          :to="isInspecteur ? { path: '/tickets', query: { mine: '1' } } : '/tickets'"
          class="btn-text"
        >
          Voir tout →
        </router-link>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Statut</th>
            <th>Priorité</th>
            <th>Date création</th>
            <th>Date resolution</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="ticketsThisMonth.length === 0">
            <td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted)">
              {{ isInspecteur ? 'Aucun ticket assigné ce mois-ci' : 'Aucun ticket ce mois-ci' }}
            </td>
          </tr>
          <!--
            Chaque ligne est cliquable:
            - on ouvre la page Tickets
            - on ouvre automatiquement le détail du ticket
          -->
          <tr
            v-for="t in ticketsThisMonth.slice(0,5)"
            :key="t.id"
            class="clickable-row"
            @click="openTicketFromDashboard(t)"
          >
            <td class="id-cell">{{ t.code }}</td>
            <td>
              <span class="status-badge" :class="{
                ouvert:    t.statut === 'ouvert',
                attente:   t.statut && t.statut.includes('attente'),
                resolu:    t.statut === 'clos'
              }">{{ t.statut || 'N/A' }}</span>
            </td>
            <td>
              <span class="priorite-badge" :class="t.priorite">
                {{ t.priorite || 'N/A' }}
              </span>
            </td>
            <td class="muted">{{ formatDate(t.date_raw) }}</td>
            <td class="muted">{{ formatDate(t.date_raw) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { API_BASE } from '@/config/api.js'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Chart,
  LineElement, PointElement, LinearScale, CategoryScale,
  ArcElement, DoughnutController, LineController,
  Filler, Tooltip, Legend
} from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, DoughnutController, LineController, Filler, Tooltip, Legend)

// Le routeur nous permet de naviguer vers une autre page (ex: page Tickets)
const router = useRouter()

const apiAppel    = API_BASE + '/api/appel'
const apiTicket   = API_BASE + '/api/ticket'
// NOUVEAU 2026-04-27: endpoint pour récupérer les agents des équipes du superviseur
const apiMesAgents = API_BASE + '/api/equipe/mes-agents'

const lineChartRef     = ref(null)
const doughnutChartRef = ref(null)
const ticketsStatusDoughnutChartRef = ref(null)
const callRequeteDoughnutChartRef  = ref(null)
let   lineChartInstance     = null
let   doughnutChartInstance = null
let   ticketsStatusDoughnutChartInstance = null
let   callRequeteDoughnutChartInstance   = null

// ── DONNÉES BRUTES ──
const appels  = ref([])
const tickets = ref([])
const loading = ref(true)

// Utilisateur connecté (récupéré depuis le localStorage)
// Note: on ne fait pas d'appel API ici, on utilise ce que le login a stocké.
const currentUser = ref(null)

// Helpers pour vérifier le rôle
const isInspecteur   = computed(() => (currentUser.value?.role || '').toLowerCase() === 'inspecteur')
const isAgent        = computed(() => (currentUser.value?.role || '').toLowerCase() === 'agent')
// NOUVEAU 2026-04-27: détection du rôle superviseur
const isSuperviseur  = computed(() => (currentUser.value?.role || '').toLowerCase() === 'superviseur')

// NOUVEAU 2026-04-27: usernames des agents appartenant aux équipes du superviseur connecté
// Alimenté par loadTeamAgents() au montage du composant si le rôle est superviseur.
const teamAgentUsernames = ref([])

// Appels à afficher: pour l'agent, uniquement les siens (créés par lui)
// ANCIEN: le superviseur recevait tous les appels sans restriction
const appelsForStats = computed(() => {
  if (isAgent.value) {
    const myUsername = currentUser.value?.username || ''
    if (!myUsername) return []
    return appels.value.filter(a => a.agent === myUsername)
  }
  // NOUVEAU 2026-04-27: le superviseur voit uniquement les appels des agents de son équipe
  if (isSuperviseur.value) {
    if (teamAgentUsernames.value.length === 0) return []
    return appels.value.filter(a => teamAgentUsernames.value.includes(a.agent))
  }
  return appels.value
})

// Tickets à afficher:
// - agent       → uniquement les tickets qu'il a créés (cree_par)
// - inspecteur  → uniquement les tickets qui lui sont assignés (assigne_a)
// ANCIEN: superviseur → tous les tickets
// NOUVEAU 2026-04-27: superviseur → uniquement les tickets créés par les agents de son équipe
const dashboardTickets = computed(() => {
  const myUsername = currentUser.value?.username || ''
  if (isAgent.value) {
    if (!myUsername) return []
    return tickets.value.filter(t => (t.cree_par || '') === myUsername)
  }
  if (isInspecteur.value) {
    if (!myUsername) return []
    return tickets.value.filter(t => (t.assigne_a || '') === myUsername)
  }
  // NOUVEAU 2026-04-27: filtre par agents de l'équipe du superviseur
  if (isSuperviseur.value) {
    if (teamAgentUsernames.value.length === 0) return []
    return tickets.value.filter(t => teamAgentUsernames.value.includes(t.cree_par || ''))
  }
  return tickets.value
})

// Source unique pour les stats (KPI + courbe "Tickets")
const ticketsForStats = computed(() => dashboardTickets.value)

// ── FILTRE MOIS EN COURS ──────────────────────────────────────────────────────
const currentMonthKey = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})

const currentMonthLabel = computed(() => {
  return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const appelsThisMonth = computed(() =>
  appelsForStats.value.filter(a => {
    if (!a.date_raw) return false
    const d = new Date(a.date_raw)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return key === currentMonthKey.value
  })
)

const ticketsThisMonth = computed(() =>
  ticketsForStats.value.filter(t => {
    if (!t.date_raw) return false
    const d = new Date(t.date_raw)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return key === currentMonthKey.value
  })
)

// Ouvre la page "Tickets" et affiche directement le ticket choisi.
// On passe des paramètres dans l'URL (query) pour:
// - filtrer sur "mes tickets" (mine=1)
// - ouvrir le ticket (open=<id>)
function openTicketFromDashboard(ticket) {
  const query = { open: String(ticket?.id || '') }
  if (isInspecteur.value || isAgent.value) query.mine = '1'
  router.push({ path: '/tickets', query })
}

// Si le token est invalide (ou expiré), on redirige vers la page de login.
function handleInvalidToken() {
  // On supprime les données locales pour éviter de rester bloqué.
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

function isUnauthorizedResponse(resp) {
  return resp && (resp.status === 401 || resp.status === 403)
}

// ── KPIs: répartitions (par type / par statut) ──
// Note: on affiche seulement le Top N pour rester simple.
const callTypeCounts = computed(() => {
  const map = {}
  appelsThisMonth.value.forEach(a => {
    const key = String(a.type_appel || 'N/A').trim()
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(([label, val]) => ({ label, val }))
})

const callTypeTopDetails = computed(() => {
  const sorted = [...callTypeCounts.value].sort((a, b) => b.val - a.val)
  const top = sorted.slice(0, 3)
  const others = sorted.slice(3)
  if (others.length > 0) {
    const otherVal = others.reduce((sum, x) => sum + x.val, 0)
    top.push({ label: 'Autres', val: otherVal })
  }
  return top
})

const ticketStatusCounts = computed(() => {
  const map = {}
  ticketsThisMonth.value.forEach(t => {
    const key = String(t.statut || 'N/A').trim()
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(([label, val]) => ({ label, val }))
})

const ticketStatusTopDetails = computed(() => {
  const sorted = [...ticketStatusCounts.value].sort((a, b) => b.val - a.val)
  const top = sorted.slice(0, 4)
  const others = sorted.slice(4)
  if (others.length > 0) {
    const otherVal = others.reduce((sum, x) => sum + x.val, 0)
    top.push({ label: 'Autres', val: otherVal })
  }
  return top
})

// ── KPI CALCULÉS ──
const satisfactionRate = computed(() => {
  const { satisfait, nonSatisfait } = doughnutData.value
  const total = satisfait + nonSatisfait
  if (total === 0) return '–'
  return Math.round((satisfait / total) * 100) + ' %'
})

const kpiCards = computed(() => {
  const all = [
    {
      id: 1,
      icon: 'calls',
      onlyNonInspecteur: true,
      label: 'Appels totaux',
      value: appelsThisMonth.value.length,
      bg: 'rgba(59,130,246,0.12)', color: '#3b82f6'
    },
    {
      id: 5,
      icon: 'percent',
      onlyNonInspecteur: true,
      label: 'Taux de satisfaction',
      value: satisfactionRate.value,
      bg: 'rgba(16,185,129,0.12)', color: '#10b981'
    },
    {
      id: 4,
      icon: 'clock',
      label: 'Tickets en attente',
      value: ticketsThisMonth.value.filter(t => (t.statut || '').toLowerCase().includes('attente')).length,
      bg: 'rgba(245,158,11,0.12)', color: '#f59e0b'
    },
    {
      id: 2,
      icon: 'inbox',
      label: 'Tickets ouverts',
      value: ticketsThisMonth.value.filter(t => (t.statut || '').toLowerCase() === 'ouvert').length,
      bg: 'rgba(6,182,212,0.12)', color: '#06b6d4'
    },
    {
      id: 3,
      icon: 'check',
      label: 'Tickets clos',
      value: ticketsThisMonth.value.filter(t => (t.statut || '').toLowerCase() === 'clos').length,
      bg: 'rgba(16,185,129,0.12)', color: '#10b981'
    },
    {
      id: 6,
      icon: 'award',
      label: 'Tickets terminés',
      value: ticketsThisMonth.value.filter(t => (t.statut || '').toLowerCase() === 'termine').length,
      bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6'
    }
  ]
  return isInspecteur.value ? all.filter(k => !k.onlyNonInspecteur) : all
})

// ── DOUGHNUT : répartition satisfaction des appels ──
const doughnutData = computed(() => {
  const satisfait    = appelsThisMonth.value.filter(a => a.satisfaction === 'satisfait').length
  const nonSatisfait = appelsThisMonth.value.filter(a => a.satisfaction === 'non_satisfait').length
  const vide         = appelsThisMonth.value.filter(a => !a.satisfaction).length
  return { satisfait, nonSatisfait, vide }
})

const doughnutLegend = computed(() => [
  { label: 'Satisfait',     val: String(doughnutData.value.satisfait),    color: '#10b981' },
  { label: 'Non satisfait', val: String(doughnutData.value.nonSatisfait), color: '#ef4444' },
  { label: 'Non renseigné', val: String(doughnutData.value.vide),         color: '#94a3b8' },
])

// ── DOUGHNUT: tickets par statut ──
const ticketsStatusDoughnutLegend = computed(() => {
  const palette = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b']
  const map = {}

  ticketsThisMonth.value.forEach(t => {
    const key = String(t.statut || 'N/A').trim() || 'N/A'
    map[key] = (map[key] || 0) + 1
  })

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
  const topN = 5
  const top = sorted.slice(0, topN)
  const others = sorted.slice(topN)

  if (others.length > 0) {
    const otherVal = others.reduce((sum, x) => sum + x[1], 0)
    top.push(['Autres', otherVal])
  }

  return top.map(([label, val], idx) => ({
    label,
    val: String(val),
    color: palette[idx % palette.length]
  }))
})

// ── DOUGHNUT: appels par requête ──
const callRequeteDoughnutLegend = computed(() => {
  const palette = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#64748b']
  const map = {}

  appelsThisMonth.value.forEach(a => {
    const key = String(a.requete || 'N/A').trim() || 'N/A'
    map[key] = (map[key] || 0) + 1
  })

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
  const topN = 5
  const top = sorted.slice(0, topN)
  const others = sorted.slice(topN)

  if (others.length > 0) {
    const otherVal = others.reduce((sum, x) => sum + x[1], 0)
    top.push(['Autres', otherVal])
  }

  return top.map(([label, val], idx) => ({
    label,
    val: String(val),
    color: palette[idx % palette.length]
  }))
})

// ── APPELS RÉCENTS : les 5 derniers ──
const recentCalls = computed(() =>
  [...appelsThisMonth.value]
    .sort((a, b) => new Date(b.date_raw) - new Date(a.date_raw))
    .slice(0, 5)
)

const statusLabels = {
  satisfait:     'Satisfait',
  non_satisfait: 'Non satisfait',
  '':            'N/A'
}

// ── FORMATAGE DATE ──
const formatDate = (dateISO) => {
  if (!dateISO) return ''
  const d = new Date(dateISO)
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`
}

// ── LINE CHART : appels par jour sur 7 jours ──
/* const last30DaysLabels = computed(() => {
  const labels = []
  for (let i = 30; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push(d.toLocaleDateString('fr-FR', { weekday: 'short' }))
  }
  return labels
}) */
const monthsToShow = 12

const monthKeys = computed(() => {
  const keys = []
  const now = new Date()
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
})

/* const last30DaysData = computed(() => {
  const counts = Array(7).fill(0)
  const now = new Date()
  appels.value.forEach(a => {
    if (!a.date_raw) return
    const d = new Date(a.date_raw)
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays < 7) counts[6 - diffDays]++
  })
  return counts
}) */
const last30DaysLabels = computed(() => {
  const now = new Date()
  const labels = []
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }))
  }
  return labels
})


const last30DaysData = computed(() => {
  const counts = Array(monthsToShow).fill(0)
  const idx = {}
  monthKeys.value.forEach((k, i) => { idx[k] = i })
  appelsForStats.value.forEach(a => {
    if (!a.date_raw) return
    const d = new Date(a.date_raw)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (idx[key] !== undefined) counts[idx[key]]++
  })
  return counts
})

const last30DaysTickets = computed(() => {
  const counts = Array(monthsToShow).fill(0)
  const idx = {}
  monthKeys.value.forEach((k, i) => { idx[k] = i })
  ticketsForStats.value.forEach(t => {
    if (!t.date_raw) return
    const d = new Date(t.date_raw)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (idx[key] !== undefined) counts[idx[key]]++
  })
  return counts
})


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU 2026-04-27 — Chargement des agents de l'équipe du superviseur
//
// ANCIEN: aucun chargement spécifique au superviseur; il voyait tout.
// NOUVEAU: si l'utilisateur est superviseur, on appelle /api/equipe/mes-agents
//          pour obtenir les usernames des agents de ses équipes, puis les filtres
//          appelsForStats et dashboardTickets les utilisent automatiquement.
// ═══════════════════════════════════════════════════════════════════════════════
async function loadTeamAgents() {
  if (!isSuperviseur.value) return
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const resp = await fetch(apiMesAgents, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
    if (resp.ok) {
      const result = await resp.json()
      // Stocker les usernames pour le filtrage côté client
      teamAgentUsernames.value = (result.data || []).map(a => a.username)
    }
  } catch (err) {
    console.error('Erreur loadTeamAgents:', err)
  }
}

// ── CHARGEMENT DES DONNÉES ──
async function loadData() {
  loading.value = true
  const token = localStorage.getItem('token')
  if (!token) {
      handleInvalidToken()
      return
    }

  try {
    // Appels
    const respA = await fetch(apiAppel, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (respA.ok) {
      const result = await respA.json()
      let items = Array.isArray(result) ? result
                : Array.isArray(result.data) ? result.data
                : Array.isArray(result.rows) ? result.rows : []

      appels.value = items.map(item => ({
        id:           item.uid || item.id || '',
        appelant:     `${item.nom_appelant || ''} ${item.prenoms_appelant || ''}`.trim(),
        telephone:    item.telephone || '',
        requete:      item.type_requete || '',
        satisfaction: item.satisfaction || '',
        date_raw:     item.created_at || '',
        date:         formatDate(item.created_at),
        agent:        item.agent || '',
      }))
    }

    // Tickets
    const respT = await fetch(apiTicket, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
    if (respT.ok) {
      const result = await respT.json()
      let items = Array.isArray(result) ? result
                : Array.isArray(result.data) ? result.data
                : Array.isArray(result.rows) ? result.rows : []

      tickets.value = items.map(item => ({
        id:       item.uid || item.id || '',
        code:     item.code || '',
        statut:   item.statut || '',
        priorite: item.priorite || '',
        // IMPORTANT:
        // Le backend ticket renvoie souvent "date_creation" (pas "created_at").
        // On garde plusieurs fallbacks pour éviter de casser l'affichage.
        date_raw: item.date_creation || item.created_at || item.date_traitement || '',
        cree_par: item['créé_par'] || item.cree_par || '',
        assigne_a: item.assigne_a || '',
      }))
    }

  } catch(err) {
    console.error('Erreur chargement dashboard:', err)
  } finally {
    loading.value = false
    buildCharts()
  }
}

// ── CONSTRUCTION DES CHARTS ──
/* function buildCharts() {
  // Détruire les instances précédentes pour éviter les doublons
  if (lineChartInstance)     { lineChartInstance.destroy();     lineChartInstance = null }
  if (doughnutChartInstance) { doughnutChartInstance.destroy(); doughnutChartInstance = null }

  // Line chart — appels et tickets sur 7 jours
  if (lineChartRef.value) {
    lineChartInstance = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: last30DaysLabels.value,
        datasets: [
          {
            label: 'Appels',
            data: last30DaysData.value,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            tension: 0.4, fill: true, pointRadius: 4,
            pointBackgroundColor: '#3b82f6', borderWidth: 2,
          },
          {
            label: 'Tickets',
            data: last30DaysTickets.value,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6,182,212,0.08)',
            tension: 0.4, fill: true, pointRadius: 4,
            pointBackgroundColor: '#06b6d4', borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 }, stepSize: 1 } }
        }
      }
    })
  }

  // Doughnut — satisfaction
  if (doughnutChartRef.value) {
    doughnutChartInstance = new Chart(doughnutChartRef.value, {
      type: 'doughnut',
      data: {
        labels: doughnutLegend.value.map(d => d.label),
        datasets: [{
          data: [
            doughnutData.value.satisfait,
            doughnutData.value.nonSatisfait,
            doughnutData.value.vide
          ],
          backgroundColor: ['#10b981', '#ef4444', '#94a3b8'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: false,
        cutout: '72%',
        plugins: { legend: { display: false } }
      }
    })
  }
} */

function buildCharts() {
  if (lineChartInstance)                   { lineChartInstance.destroy();                   lineChartInstance = null }
  if (doughnutChartInstance)               { doughnutChartInstance.destroy();               doughnutChartInstance = null }
  // AJOUTER — destruction des instances doughnut
  if (ticketsStatusDoughnutChartInstance)  { ticketsStatusDoughnutChartInstance.destroy();  ticketsStatusDoughnutChartInstance = null }
  if (callRequeteDoughnutChartInstance)    { callRequeteDoughnutChartInstance.destroy();    callRequeteDoughnutChartInstance = null }

  // Line chart — inchangé sauf les données qui viennent des nouveaux computed
  if (lineChartRef.value) {
    lineChartInstance = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: last30DaysLabels.value,
        datasets: [
          {
            label: 'Appels',
            data: last30DaysData.value,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            tension: 0.4, fill: true, pointRadius: 4,
            pointBackgroundColor: '#3b82f6', borderWidth: 2,
          },
          {
            label: 'Tickets',
            data: last30DaysTickets.value,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6,182,212,0.08)',
            tension: 0.4, fill: true, pointRadius: 4,
            pointBackgroundColor: '#06b6d4', borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, stepSize: 1, precision: 0 }, beginAtZero: true }
        }
      }
    })
  }

  // AJOUTER — Doughnut appels par requête
  if (callRequeteDoughnutChartRef.value) {
    const legend = callRequeteDoughnutLegend.value
    if (legend.length) {
      callRequeteDoughnutChartInstance = new Chart(callRequeteDoughnutChartRef.value, {
        type: 'doughnut',
        data: {
          labels: legend.map(d => d.label),
          datasets: [{
            data: legend.map(d => Number(d.val)),
            backgroundColor: legend.map(d => d.color),
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: false,
          cutout: '72%',
          plugins: { legend: { display: false } }
        }
      })
    }
  }

  // AJOUTER — Doughnut tickets par statut
  if (ticketsStatusDoughnutChartRef.value) {
    const legend = ticketsStatusDoughnutLegend.value
    if (legend.length) {
      ticketsStatusDoughnutChartInstance = new Chart(ticketsStatusDoughnutChartRef.value, {
        type: 'doughnut',
        data: {
          labels: legend.map(d => d.label),
          datasets: [{
            data: legend.map(d => Number(d.val)),
            backgroundColor: legend.map(d => d.color),
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: false,
          cutout: '72%',
          plugins: { legend: { display: false } }
        }
      })
    }
  }
}

onMounted(async () => {
  const stored = localStorage.getItem('user')
  if (stored) {
    currentUser.value = JSON.parse(stored)
  } else {
    router.push('/login')
    return
  }
  // NOUVEAU 2026-04-27: charger les agents de l'équipe en premier (si superviseur)
  // afin que les computed filters soient prêts avant le rendu des KPIs et graphiques
  await loadTeamAgents()
  loadData()
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.page-header h1 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.page-header p { color: var(--text-muted); font-size: 13px; margin-top: 2px; }

.header-actions { display: flex; gap: 10px; align-items: center; }

.period-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.btn-form-appel {
  display: flex; align-items: center; gap: 6px;
  background: rgba(16,185,129,0.12);
  color: #10b981;
  border: 1px solid rgba(16,185,129,0.3);
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-form-appel:hover { background: rgba(16,185,129,0.22); border-color: #10b981; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent);
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-primary:hover { background: #2563eb; box-shadow: var(--shadow-accent); }

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s, transform 0.2s;
}
.kpi-card:hover { border-color: var(--border-accent); transform: translateY(-2px); }

.kpi-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.kpi-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.kpi-label { font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-value { font-size: 22px; font-weight: 700; font-family: var(--font-display); letter-spacing: -0.5px; }
.kpi-trend { font-size: 11px; font-weight: 500; }
.kpi-trend.up { color: var(--success); }
.kpi-trend.down { color: var(--danger); }

.kpi-sparkline { display: flex; align-items: center; }

/* Charts */
.charts-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.chart-header h3 { font-size: 15px; font-weight: 600; }
.chart-sub { font-size: 12px; color: var(--text-muted); }
.chart-legend { display: flex; align-items: center; gap: 14px; font-size: 12px; color: var(--text-muted); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }

.chart-wrapper { position: relative; }
.doughnut-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 180px;
}
.doughnut-center {
  position: absolute;
  display: flex; flex-direction: column; align-items: center;
}
.doughnut-total { font-size: 28px; font-weight: 800; font-family: var(--font-display); }
.doughnut-label { font-size: 11px; color: var(--text-muted); }

.doughnut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}
.legend-val { margin-left: auto; font-weight: 600; color: var(--text-primary); }

/* Table */
.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}
.table-header h3 { font-size: 15px; font-weight: 600; }
.btn-text { font-size: 13px; color: var(--accent); font-weight: 500; transition: opacity 0.2s; }
.btn-text:hover { opacity: 0.7; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 22px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 14px 22px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-secondary);
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg-hover); }
.id-cell { font-weight: 600; color: var(--text-primary); font-family: monospace; }
.muted { color: var(--text-muted); font-size: 12px; }

.status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.status-badge.resolu { background: rgba(16,185,129,0.12); color: #10b981; }
.status-badge.encours { background: rgba(59,130,246,0.12); color: #3b82f6; }
.status-badge.attente { background: rgba(245,158,11,0.12); color: #f59e0b; }
.status-badge.annule { background: rgba(239,68,68,0.12); color: #ef4444; }

@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .charts-row { grid-template-columns: 1fr; }
}
/* Loader */
.loading-bar {
  background: rgba(59,130,246,0.08);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-sm);
  padding: 12px 20px;
  font-size: 13px;
  color: var(--accent);
  text-align: center;
}

/* Mono */
.mono { font-family: monospace; font-size: 12px; }

/* Satisfaction badges */
.status-badge.satisfait     { background: rgba(16,185,129,0.12); color: #10b981; }
.status-badge.non_satisfait { background: rgba(239,68,68,0.12);  color: #ef4444; }

/* Priorité badges */
.priorite-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.priorite-badge.basse    { background: rgba(16,185,129,0.12); color: #10b981; }
.priorite-badge.moyenne  { background: rgba(59,130,246,0.12);  color: #3b82f6; }
.priorite-badge.haute    { background: rgba(245,158,11,0.12);  color: #f59e0b; }
.priorite-badge.critique { background: rgba(239,68,68,0.12);   color: #ef4444; }

/* Ticket statut badges dans le dashboard */
.status-badge.ouvert  { background: rgba(59,130,246,0.12); color: #3b82f6; }
.status-badge.attente { background: rgba(245,158,11,0.12); color: #f59e0b; }
</style>

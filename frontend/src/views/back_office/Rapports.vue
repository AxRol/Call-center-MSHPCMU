<template>
  <div class="rapports-page">
    <div class="page-header">
      <div>
        <h1>Rapports</h1>
        <p>Analyse détaillée des appels et des tickets</p>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportCSV" :disabled="loading || exporting" title="Exporter en CSV">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          CSV
        </button>
        <button class="btn-export-excel" @click="exportExcel" :disabled="loading || exporting" title="Exporter en Excel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><polyline points="9 9 10 9 11 9"/>
          </svg>
          Excel
        </button>
        <button class="btn-export-pdf" @click="exportPDF" :disabled="loading || exporting" title="Exporter en PDF">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="15" x2="11" y2="15"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
          {{ exporting ? 'PDF…' : 'PDF' }}
        </button>
        <button class="btn-primary" @click="loadRapports" :disabled="loading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Date début</label>
          <input type="date" v-model="filters.date_debut" class="filter-input" />
        </div>
        <div class="filter-group">
          <label>Date fin</label>
          <input type="date" v-model="filters.date_fin" class="filter-input" />
        </div>
        <div class="filter-group" v-if="canFilterByAgent">
          <label>Agent</label>
          <select v-model="filters.agent" class="filter-input">
            <option value="">Tous les agents</option>
            <option v-for="a in agentsList" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-apply" @click="loadRapports">Appliquer</button>
          <button class="btn-reset" @click="resetFilters">Réinitialiser</button>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="tabs-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'appels' }" @click="activeTab = 'appels'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.08-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
        </svg>
        Appels
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'tickets' }" @click="activeTab = 'tickets'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M20 8V6C20 4.9 19.1 4 18 4H4C2.9 4 2 4.9 2 6V8C3.1 8 4 8.9 4 10C4 11.1 3.1 12 2 12V16C2 17.1 2.9 18 4 18H18C19.1 18 20 17.1 20 16V14C18.9 14 18 13.1 18 12C18 10.9 18.9 10 20 8Z"/>
          <line x1="7" y1="9"  x2="13" y2="9"  stroke-linecap="round"/>
          <line x1="7" y1="12" x2="15" y2="12" stroke-linecap="round"/>
          <line x1="7" y1="15" x2="11" y2="15" stroke-linecap="round"/>
        </svg>
        Tickets
      </button>
    </div>

    <div v-if="loading" class="loading-bar"><span>Chargement des données...</span></div>

    <!-- ═══════════ ONGLET APPELS ═══════════ -->
    <template v-if="activeTab === 'appels' && !loading">
      <!-- KPIs appels -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(59,130,246,0.12);color:#3b82f6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.08-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Total appels</span>
            <span class="kpi-value">{{ rapportAppels.total ?? '–' }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(16,185,129,0.12);color:#10b981">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Satisfaits</span>
            <span class="kpi-value">{{ satisfaitCount }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(239,68,68,0.12);color:#ef4444">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Non satisfaits</span>
            <span class="kpi-value">{{ nonSatisfaitCount }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 8V6C20 4.9 19.1 4 18 4H4C2.9 4 2 4.9 2 6V8C3.1 8 4 8.9 4 10C4 11.1 3.1 12 2 12V16C2 17.1 2.9 18 4 18H18C19.1 18 20 17.1 20 16V14C18.9 14 18 13.1 18 12C18 10.9 18.9 10 20 8Z" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Avec ticket</span>
            <span class="kpi-value">{{ rapportAppels.avec_ticket ?? '–' }}</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <!-- Appels par mois -->
        <div class="chart-card large">
          <div class="chart-header">
            <div><h3>Évolution mensuelle</h3><span class="chart-sub">Nombre d'appels par mois</span></div>
          </div>
          <div class="chart-wrapper">
            <canvas ref="lineAppelsRef" height="110"></canvas>
          </div>
        </div>
        <!-- Répartition satisfaction -->
        <div class="chart-card small">
          <div class="chart-header"><div><h3>Satisfaction</h3><span class="chart-sub">Répartition</span></div></div>
          <div class="chart-wrapper doughnut-wrap">
            <canvas ref="doughnutSatisfRef" width="160" height="160"></canvas>
          </div>
          <div class="doughnut-legend">
            <div v-for="item in rapportAppels.par_satisfaction" :key="item.label" class="legend-item">
              <span class="legend-dot" :style="{ background: satisfactionColor(item.label) }"></span>
              <span>{{ item.label }}</span>
              <span class="legend-val">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tables-row">
        <!-- Par type de requête -->
        <div class="stat-card">
          <h3 class="stat-title">Par type de requête</h3>
          <div class="stat-list">
            <div v-if="!rapportAppels.par_type_requete?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportAppels.par_type_requete" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportAppels.par_type_requete) + '%', background: '#3b82f6' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <!-- Par agent -->
        <div class="stat-card" v-if="canFilterByAgent">
          <h3 class="stat-title">Par agent</h3>
          <div class="stat-list">
            <div v-if="!rapportAppels.par_agent?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportAppels.par_agent" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportAppels.par_agent) + '%', background: '#06b6d4' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <!-- Par type d'appel -->
        <div class="stat-card">
          <h3 class="stat-title">Par type d'appel</h3>
          <div class="stat-list">
            <div v-if="!rapportAppels.par_type_appel?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportAppels.par_type_appel" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportAppels.par_type_appel) + '%', background: '#8b5cf6' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <!-- Top localités -->
        <div class="stat-card">
          <h3 class="stat-title">Top 10 localités</h3>
          <div class="stat-list">
            <div v-if="!rapportAppels.par_localite?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportAppels.par_localite" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportAppels.par_localite) + '%', background: '#f59e0b' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ ONGLET TICKETS ═══════════ -->
    <template v-if="activeTab === 'tickets' && !loading">
      <!-- KPIs tickets -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(59,130,246,0.12);color:#3b82f6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 8V6C20 4.9 19.1 4 18 4H4C2.9 4 2 4.9 2 6V8C3.1 8 4 8.9 4 10C4 11.1 3.1 12 2 12V16C2 17.1 2.9 18 4 18H18C19.1 18 20 17.1 20 16V14C18.9 14 18 13.1 18 12C18 10.9 18.9 10 20 8Z"/>
            </svg>
          </div>
          <div class="kpi-body"><span class="kpi-label">Total tickets</span><span class="kpi-value">{{ rapportTickets.total ?? '–' }}</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(6,182,212,0.12);color:#06b6d4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" stroke-linecap="round"/></svg>
          </div>
          <div class="kpi-body"><span class="kpi-label">Ouverts</span><span class="kpi-value">{{ rapportTickets.ouverts ?? '–' }}</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-linecap="round"/></svg>
          </div>
          <div class="kpi-body"><span class="kpi-label">En attente</span><span class="kpi-value">{{ rapportTickets.en_attente ?? '–' }}</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(16,185,129,0.12);color:#10b981">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round"/></svg>
          </div>
          <div class="kpi-body"><span class="kpi-label">Clos</span><span class="kpi-value">{{ rapportTickets.clos ?? '–' }}</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(139,92,246,0.12);color:#8b5cf6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" stroke-linecap="round"/></svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Délai moyen de clôture</span>
            <span class="kpi-value">{{ rapportTickets.delai_moyen != null ? rapportTickets.delai_moyen + ' h' : '–' }}</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <!-- Tickets par mois -->
        <div class="chart-card large">
          <div class="chart-header">
            <div><h3>Évolution mensuelle</h3><span class="chart-sub">Nombre de tickets par mois</span></div>
          </div>
          <div class="chart-wrapper">
            <canvas ref="lineTicketsRef" height="110"></canvas>
          </div>
        </div>
        <!-- Répartition statuts -->
        <div class="chart-card small">
          <div class="chart-header"><div><h3>Statuts</h3><span class="chart-sub">Répartition</span></div></div>
          <div class="chart-wrapper doughnut-wrap">
            <canvas ref="doughnutStatutRef" width="160" height="160"></canvas>
          </div>
          <div class="doughnut-legend">
            <div v-for="(item, i) in rapportTickets.par_statut" :key="item.label" class="legend-item">
              <span class="legend-dot" :style="{ background: statutColors[i % statutColors.length] }"></span>
              <span>{{ item.label }}</span>
              <span class="legend-val">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tables-row">
        <!-- Par priorité -->
        <div class="stat-card">
          <h3 class="stat-title">Par priorité</h3>
          <div class="stat-list">
            <div v-if="!rapportTickets.par_priorite?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportTickets.par_priorite" :key="item.label" class="stat-row">
              <span class="stat-label">
                <span class="priorite-dot" :class="item.label"></span>
                {{ item.label }}
              </span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportTickets.par_priorite) + '%', background: prioriteColor(item.label) }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <!-- Par requête -->
        <div class="stat-card">
          <h3 class="stat-title">Par type de requête</h3>
          <div class="stat-list">
            <div v-if="!rapportTickets.par_requete?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportTickets.par_requete" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportTickets.par_requete) + '%', background: '#3b82f6' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <!-- Par créateur -->
        <div class="stat-card" v-if="canFilterByAgent">
          <h3 class="stat-title">Par créateur</h3>
          <div class="stat-list">
            <div v-if="!rapportTickets.par_createur?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportTickets.par_createur" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportTickets.par_createur) + '%', background: '#06b6d4' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <!-- Par assigné -->
        <div class="stat-card" v-if="canFilterByAgent">
          <h3 class="stat-title">Par assigné</h3>
          <div class="stat-list">
            <div v-if="!rapportTickets.par_assigne?.length" class="empty-stat">Aucune donnée</div>
            <div v-for="item in rapportTickets.par_assigne" :key="item.label" class="stat-row">
              <span class="stat-label">{{ item.label }}</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" :style="{ width: barWidth(item.count, rapportTickets.par_assigne) + '%', background: '#8b5cf6' }"></div>
              </div>
              <span class="stat-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { API_BASE } from '@/config/api.js'
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale,
  ArcElement, DoughnutController, LineController, Filler, Tooltip, Legend
} from 'chart.js'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale,
  ArcElement, DoughnutController, LineController, Filler, Tooltip, Legend)

const apiBase = API_BASE + '/api/rapport'
const router  = useRouter()

const user    = ref({})
const loading   = ref(false)
const exporting = ref(false)
const activeTab = ref('appels')

const filters = ref({ date_debut: '', date_fin: '', agent: '' })
const agentsList = ref([])

const rapportAppels  = ref({})
const rapportTickets = ref({})

const statutColors  = ['#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#64748b']

const canFilterByAgent = computed(() =>
  ['admin', 'superviseur'].includes(user.value?.role)
)

const satisfaitCount = computed(() =>
  rapportAppels.value.par_satisfaction?.find(s => s.label === 'satisfait')?.count ?? 0
)
const nonSatisfaitCount = computed(() =>
  rapportAppels.value.par_satisfaction?.find(s => s.label === 'non_satisfait')?.count ?? 0
)

// ── Refs canvas ──────────────────────────────────────────────────────────────
const lineAppelsRef   = ref(null)
const lineTicketsRef  = ref(null)
const doughnutSatisfRef = ref(null)
const doughnutStatutRef = ref(null)
let lineAppelsChart = null, lineTicketsChart = null
let doughnutSatisfChart = null, doughnutStatutChart = null

// ── Helpers ──────────────────────────────────────────────────────────────────
function satisfactionColor(label) {
  if (label === 'satisfait')     return '#10b981'
  if (label === 'non_satisfait') return '#ef4444'
  return '#94a3b8'
}
function prioriteColor(label) {
  const map = { critique: '#ef4444', haute: '#f59e0b', moyenne: '#3b82f6', basse: '#10b981' }
  return map[label] ?? '#64748b'
}
function barWidth(count, list) {
  const max = Math.max(...(list?.map(i => i.count) ?? [1]), 1)
  return Math.round((count / max) * 100)
}

function handleInvalidToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// ── Chargement données ────────────────────────────────────────────────────────
async function loadRapports() {
  const token = localStorage.getItem('token')
  if (!token) return handleInvalidToken()

  loading.value = true
  const q = new URLSearchParams()
  if (filters.value.date_debut) q.append('date_debut', filters.value.date_debut)
  if (filters.value.date_fin)   q.append('date_fin',   filters.value.date_fin)
  if (filters.value.agent)      q.append('agent',      filters.value.agent)
  const qs = q.toString() ? '?' + q.toString() : ''

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const [ra, rt] = await Promise.all([
      fetch(`${apiBase}/appels${qs}`,  { headers, credentials: 'include' }),
      fetch(`${apiBase}/tickets${qs}`, { headers, credentials: 'include' }),
    ])
    if (ra.status === 401 || rt.status === 401) return handleInvalidToken()

    if (ra.ok) { const r = await ra.json(); rapportAppels.value  = r.data ?? {} }
    if (rt.ok) { const r = await rt.json(); rapportTickets.value = r.data ?? {} }

    await nextTick()
    buildCharts()
  } catch (err) {
    console.error('Erreur chargement rapports:', err)
  } finally {
    loading.value = false
  }
}

async function loadAgents() {
  const token = localStorage.getItem('token')
  if (!token || !canFilterByAgent.value) return
  try {
    const resp = await fetch(API_BASE + '/api/user', {
      headers: { Authorization: `Bearer ${token}` }, credentials: 'include'
    })
    if (resp.ok) {
      const result = await resp.json()
      const items = Array.isArray(result) ? result : result.data ?? result.rows ?? []
      agentsList.value = items.map(u => u.username).filter(Boolean)
    }
  } catch (err) {
    console.error('Erreur chargement agents:', err)
  }
}

function resetFilters() {
  filters.value = { date_debut: '', date_fin: '', agent: '' }
  loadRapports()
}

// ── Construction charts ───────────────────────────────────────────────────────
function buildCharts() {
  destroyCharts()

  // Line chart appels
  if (lineAppelsRef.value && rapportAppels.value.par_mois?.length) {
    lineAppelsChart = new Chart(lineAppelsRef.value, {
      type: 'line',
      data: {
        labels: rapportAppels.value.par_mois.map(m => m.mois),
        datasets: [{
          label: 'Appels',
          data: rapportAppels.value.par_mois.map(m => m.count),
          borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.4, fill: true, pointRadius: 4, borderWidth: 2,
          pointBackgroundColor: '#3b82f6'
        }]
      },
      options: chartLineOptions('Appels')
    })
  }

  // Line chart tickets
  if (lineTicketsRef.value && rapportTickets.value.par_mois?.length) {
    lineTicketsChart = new Chart(lineTicketsRef.value, {
      type: 'line',
      data: {
        labels: rapportTickets.value.par_mois.map(m => m.mois),
        datasets: [{
          label: 'Tickets',
          data: rapportTickets.value.par_mois.map(m => m.count),
          borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)',
          tension: 0.4, fill: true, pointRadius: 4, borderWidth: 2,
          pointBackgroundColor: '#06b6d4'
        }]
      },
      options: chartLineOptions('Tickets')
    })
  }

  // Doughnut satisfaction
  if (doughnutSatisfRef.value && rapportAppels.value.par_satisfaction?.length) {
    doughnutSatisfChart = new Chart(doughnutSatisfRef.value, {
      type: 'doughnut',
      data: {
        labels: rapportAppels.value.par_satisfaction.map(s => s.label),
        datasets: [{
          data: rapportAppels.value.par_satisfaction.map(s => s.count),
          backgroundColor: rapportAppels.value.par_satisfaction.map(s => satisfactionColor(s.label)),
          borderWidth: 0, hoverOffset: 6
        }]
      },
      options: { responsive: false, cutout: '70%', plugins: { legend: { display: false } } }
    })
  }

  // Doughnut statuts tickets
  if (doughnutStatutRef.value && rapportTickets.value.par_statut?.length) {
    doughnutStatutChart = new Chart(doughnutStatutRef.value, {
      type: 'doughnut',
      data: {
        labels: rapportTickets.value.par_statut.map(s => s.label),
        datasets: [{
          data: rapportTickets.value.par_statut.map(s => s.count),
          backgroundColor: rapportTickets.value.par_statut.map((_, i) => statutColors[i % statutColors.length]),
          borderWidth: 0, hoverOffset: 6
        }]
      },
      options: { responsive: false, cutout: '70%', plugins: { legend: { display: false } } }
    })
  }
}

function destroyCharts() {
  lineAppelsChart?.destroy();    lineAppelsChart    = null
  lineTicketsChart?.destroy();   lineTicketsChart   = null
  doughnutSatisfChart?.destroy();doughnutSatisfChart = null
  doughnutStatutChart?.destroy();doughnutStatutChart = null
}

function chartLineOptions(label) {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 }, stepSize: 1 }, beginAtZero: true }
    }
  }
}

// Rebuild charts quand on change d'onglet
watch(activeTab, async () => {
  await nextTick()
  buildCharts()
})

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV() {
  if (activeTab.value === 'appels') {
    const rows = [
      ['Indicateur', 'Valeur'],
      ['Total appels', rapportAppels.value.total ?? 0],
      ['Avec ticket',  rapportAppels.value.avec_ticket ?? 0],
      [],
      ['Satisfaction', 'Nb'],
      ...(rapportAppels.value.par_satisfaction ?? []).map(r => [r.label, r.count]),
      [],
      ['Type requête', 'Nb'],
      ...(rapportAppels.value.par_type_requete ?? []).map(r => [r.label, r.count]),
      [],
      ['Type appel', 'Nb'],
      ...(rapportAppels.value.par_type_appel ?? []).map(r => [r.label, r.count]),
      [],
      ['Agent', 'Nb'],
      ...(rapportAppels.value.par_agent ?? []).map(r => [r.label, r.count]),
      [],
      ['Localité', 'Nb'],
      ...(rapportAppels.value.par_localite ?? []).map(r => [r.label, r.count]),
      [],
      ['Mois', 'Nb'],
      ...(rapportAppels.value.par_mois ?? []).map(r => [r.mois, r.count]),
    ]
    downloadCSV(rows, 'rapport_appels')
  } else {
    const rows = [
      ['Indicateur', 'Valeur'],
      ['Total tickets',  rapportTickets.value.total ?? 0],
      ['Ouverts',        rapportTickets.value.ouverts ?? 0],
      ['En attente',     rapportTickets.value.en_attente ?? 0],
      ['Clos',           rapportTickets.value.clos ?? 0],
      ['Délai moyen (h)',rapportTickets.value.delai_moyen ?? '–'],
      [],
      ['Statut', 'Nb'],
      ...(rapportTickets.value.par_statut ?? []).map(r => [r.label, r.count]),
      [],
      ['Priorité', 'Nb'],
      ...(rapportTickets.value.par_priorite ?? []).map(r => [r.label, r.count]),
      [],
      ['Type requête', 'Nb'],
      ...(rapportTickets.value.par_requete ?? []).map(r => [r.label, r.count]),
      [],
      ['Créateur', 'Nb'],
      ...(rapportTickets.value.par_createur ?? []).map(r => [r.label, r.count]),
      [],
      ['Mois', 'Nb'],
      ...(rapportTickets.value.par_mois ?? []).map(r => [r.mois, r.count]),
    ]
    downloadCSV(rows, 'rapport_tickets')
  }
}

function downloadCSV(rows, filename) {
  const content = '\uFEFF' + rows.map(r => r.join(';')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

// ── Export Excel ─────────────────────────────────────────────────────────────
function exportExcel() {
  const wb   = XLSX.utils.book_new()
  const date = new Date().toISOString().slice(0, 10)

  function addSheet(data, name) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), name)
  }

  if (activeTab.value === 'appels') {
    addSheet([
      ['Indicateur', 'Valeur'],
      ['Total appels',   rapportAppels.value.total        ?? 0],
      ['Satisfaits',     satisfaitCount.value],
      ['Non satisfaits', nonSatisfaitCount.value],
      ['Avec ticket',    rapportAppels.value.avec_ticket  ?? 0],
    ], 'KPIs')

    addSheet([
      ['Mois', "Nombre d'appels"],
      ...(rapportAppels.value.par_mois ?? []).map(r => [r.mois, r.count]),
    ], 'Evolution mensuelle')

    addSheet([
      ['Satisfaction', 'Nombre'],
      ...(rapportAppels.value.par_satisfaction ?? []).map(r => [r.label, r.count]),
    ], 'Satisfaction')

    addSheet([
      ['Type de requête', 'Nombre'],
      ...(rapportAppels.value.par_type_requete ?? []).map(r => [r.label, r.count]),
    ], 'Types requetes')

    addSheet([
      ["Type d'appel", 'Nombre'],
      ...(rapportAppels.value.par_type_appel ?? []).map(r => [r.label, r.count]),
    ], 'Types appels')

    if (rapportAppels.value.par_agent?.length) {
      addSheet([
        ['Agent', 'Nombre'],
        ...(rapportAppels.value.par_agent ?? []).map(r => [r.label, r.count]),
      ], 'Par agent')
    }

    addSheet([
      ['Localité', 'Nombre'],
      ...(rapportAppels.value.par_localite ?? []).map(r => [r.label, r.count]),
    ], 'Top localites')

    XLSX.writeFile(wb, `rapport_appels_${date}.xlsx`)
  } else {
    addSheet([
      ['Indicateur', 'Valeur'],
      ['Total tickets',   rapportTickets.value.total       ?? 0],
      ['Ouverts',         rapportTickets.value.ouverts     ?? 0],
      ['En attente',      rapportTickets.value.en_attente  ?? 0],
      ['Clos',            rapportTickets.value.clos        ?? 0],
      ['Délai moyen (h)', rapportTickets.value.delai_moyen ?? '–'],
    ], 'KPIs')

    addSheet([
      ['Mois', 'Nombre de tickets'],
      ...(rapportTickets.value.par_mois ?? []).map(r => [r.mois, r.count]),
    ], 'Evolution mensuelle')

    addSheet([
      ['Statut', 'Nombre'],
      ...(rapportTickets.value.par_statut ?? []).map(r => [r.label, r.count]),
    ], 'Statuts')

    addSheet([
      ['Priorité', 'Nombre'],
      ...(rapportTickets.value.par_priorite ?? []).map(r => [r.label, r.count]),
    ], 'Priorites')

    addSheet([
      ['Type de requête', 'Nombre'],
      ...(rapportTickets.value.par_requete ?? []).map(r => [r.label, r.count]),
    ], 'Types requetes')

    if (canFilterByAgent.value) {
      addSheet([
        ['Créateur', 'Nombre'],
        ...(rapportTickets.value.par_createur ?? []).map(r => [r.label, r.count]),
      ], 'Par createur')
      addSheet([
        ['Assigné', 'Nombre'],
        ...(rapportTickets.value.par_assigne ?? []).map(r => [r.label, r.count]),
      ], 'Par assigne')
    }

    XLSX.writeFile(wb, `rapport_tickets_${date}.xlsx`)
  }
}

// ── Export PDF ────────────────────────────────────────────────────────────────
async function exportPDF() {
  exporting.value = true
  await nextTick()

  try {
    const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const date  = new Date().toLocaleDateString('fr-FR')

    function sectionTitle(text, y) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(text, 14, y)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, y + 1.5, pageW - 14, y + 1.5)
    }

    function header(title) {
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, pageW, 16, 'F')
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(title, pageW / 2, 10.5, { align: 'center' })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Généré le ${date}`, pageW - 14, 10.5, { align: 'right' })

      if (filters.value.date_debut || filters.value.date_fin) {
        doc.setFontSize(9)
        doc.setTextColor(180, 210, 255)
        doc.text(
          `Période : ${filters.value.date_debut || '–'} → ${filters.value.date_fin || '–'}`,
          14, 10.5
        )
      }
    }

    const tableStyle = {
      styles:     { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 252] },
      margin: { left: 14, right: 14 },
    }

    function addStatTable(doc, title, body, y) {
      if (!body?.length) return doc.lastAutoTable?.finalY ?? y
      sectionTitle(title, y)
      autoTable(doc, {
        startY: y + 5,
        head:   [['Libellé', 'Nombre']],
        body:   body.map(r => [r.label, r.count]),
        ...tableStyle,
      })
      return doc.lastAutoTable.finalY
    }

    function addChartImage(doc, canvasEl, y, label) {
      if (!canvasEl) return y
      try {
        const img = canvasEl.toDataURL('image/png')
        sectionTitle(label, y)
        doc.addImage(img, 'PNG', 14, y + 5, pageW - 28, 55)
        return y + 67
      } catch { return y }
    }

    // ── Page 1 : Appels ──────────────────────────────────────────────────────
    if (activeTab.value === 'appels') {
      header('Rapport des Appels')

      // KPIs
      autoTable(doc, {
        startY: 22,
        head:   [['Indicateur', 'Valeur']],
        body: [
          ["Total appels",   rapportAppels.value.total        ?? 0],
          ["Satisfaits",     satisfaitCount.value],
          ["Non satisfaits", nonSatisfaitCount.value],
          ["Avec ticket",    rapportAppels.value.avec_ticket  ?? 0],
        ],
        ...tableStyle,
      })

      let y = doc.lastAutoTable.finalY + 10

      // Chart évolution
      y = addChartImage(doc, lineAppelsRef.value, y, "Évolution mensuelle des appels")
      y += 6

      // Satisfaction
      y = addStatTable(doc, 'Satisfaction', rapportAppels.value.par_satisfaction, y) + 8

      if (y > 230) { doc.addPage(); header('Rapport des Appels (suite)'); y = 22 }

      // Type requête
      y = addStatTable(doc, "Par type de requête", rapportAppels.value.par_type_requete, y) + 8

      if (y > 200) { doc.addPage(); header('Rapport des Appels (suite)'); y = 22 }

      // Type appel
      y = addStatTable(doc, "Par type d'appel", rapportAppels.value.par_type_appel, y) + 8

      if (y > 200) { doc.addPage(); header('Rapport des Appels (suite)'); y = 22 }

      // Par agent
      if (rapportAppels.value.par_agent?.length) {
        y = addStatTable(doc, 'Par agent', rapportAppels.value.par_agent, y) + 8
        if (y > 200) { doc.addPage(); header('Rapport des Appels (suite)'); y = 22 }
      }

      // Top localités
      addStatTable(doc, 'Top localités', rapportAppels.value.par_localite, y)

      doc.save(`rapport_appels_${new Date().toISOString().slice(0,10)}.pdf`)

    // ── Page 1 : Tickets ─────────────────────────────────────────────────────
    } else {
      header('Rapport des Tickets')

      autoTable(doc, {
        startY: 22,
        head:   [['Indicateur', 'Valeur']],
        body: [
          ['Total tickets',    rapportTickets.value.total       ?? 0],
          ['Ouverts',          rapportTickets.value.ouverts     ?? 0],
          ['En attente',       rapportTickets.value.en_attente  ?? 0],
          ['Clos',             rapportTickets.value.clos        ?? 0],
          ['Délai moyen (h)',  rapportTickets.value.delai_moyen ?? '–'],
        ],
        ...tableStyle,
      })

      let y = doc.lastAutoTable.finalY + 10

      y = addChartImage(doc, lineTicketsRef.value, y, "Évolution mensuelle des tickets")
      y += 6

      y = addStatTable(doc, 'Par statut',    rapportTickets.value.par_statut,   y) + 8
      if (y > 220) { doc.addPage(); header('Rapport des Tickets (suite)'); y = 22 }

      y = addStatTable(doc, 'Par priorité',  rapportTickets.value.par_priorite, y) + 8
      if (y > 220) { doc.addPage(); header('Rapport des Tickets (suite)'); y = 22 }

      y = addStatTable(doc, 'Par type de requête', rapportTickets.value.par_requete, y) + 8

      if (canFilterByAgent.value) {
        if (y > 200) { doc.addPage(); header('Rapport des Tickets (suite)'); y = 22 }
        y = addStatTable(doc, 'Par créateur', rapportTickets.value.par_createur, y) + 8
        if (y > 200) { doc.addPage(); header('Rapport des Tickets (suite)'); y = 22 }
        addStatTable(doc, 'Par assigné',  rapportTickets.value.par_assigne,  y)
      }

      doc.save(`rapport_tickets_${new Date().toISOString().slice(0,10)}.pdf`)
    }
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  const stored = localStorage.getItem('user')
  if (stored) user.value = JSON.parse(stored)
  loadAgents()
  loadRapports()
})
</script>

<style scoped>
.rapports-page { display: flex; flex-direction: column; gap: 20px; }

/* ── Page header ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
.page-header p  { color: var(--text-muted); font-size: 13px; margin-top: 2px; }
.header-actions { display: flex; gap: 10px; }

/* ── Boutons ── */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-export {
  display: flex; align-items: center; gap: 6px;
  background: rgba(16,185,129,0.12); color: #10b981;
  border: 1px solid rgba(16,185,129,0.3);
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-export:hover { background: rgba(16,185,129,0.22); }
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-export-excel {
  display: flex; align-items: center; gap: 6px;
  background: rgba(34,197,94,0.12); color: #22c55e;
  border: 1px solid rgba(34,197,94,0.3);
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-export-excel:hover { background: rgba(34,197,94,0.22); }
.btn-export-excel:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-export-pdf {
  display: flex; align-items: center; gap: 6px;
  background: rgba(239,68,68,0.12); color: #ef4444;
  border: 1px solid rgba(239,68,68,0.3);
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-export-pdf:hover { background: rgba(239,68,68,0.22); }
.btn-export-pdf:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Filtres ── */
.filters-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px 20px;
}
.filters-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end; }
.filter-group { display: flex; flex-direction: column; gap: 5px; }
.filter-group label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.filter-input {
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); padding: 7px 10px; border-radius: var(--radius-sm);
  font-size: 13px; outline: none; min-width: 150px;
}
.filter-input:focus { border-color: var(--border-accent); }
.filter-actions { display: flex; gap: 8px; }
.btn-apply {
  background: var(--accent); color: white; border: none;
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.btn-apply:hover { background: #2563eb; }
.btn-reset {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border); padding: 8px 14px;
  border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.btn-reset:hover { border-color: var(--text-muted); color: var(--text-primary); }

/* ── Onglets ── */
.tabs-bar { display: flex; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--text-secondary); padding: 10px 18px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; margin-bottom: -1px;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

/* ── Loader ── */
.loading-bar {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px; text-align: center;
  color: var(--text-muted); font-size: 13px;
}

/* ── KPI Grid ── */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
.kpi-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px 16px;
  display: flex; align-items: center; gap: 14px; transition: border-color 0.2s;
}
.kpi-card:hover { border-color: var(--border-accent); }
.kpi-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-body { display: flex; flex-direction: column; gap: 3px; }
.kpi-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.kpi-value { font-size: 26px; font-weight: 800; font-family: var(--font-display); color: var(--text-primary); }

/* ── Charts row ── */
.charts-row { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }
.chart-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px;
}
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.chart-header h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.chart-sub { font-size: 12px; color: var(--text-muted); }
.chart-wrapper { position: relative; }
.doughnut-wrap { display: flex; justify-content: center; align-items: center; padding: 10px 0; }

.doughnut-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-val { margin-left: auto; font-weight: 600; color: var(--text-primary); }

/* ── Tables stats ── */
.tables-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
.stat-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px 16px;
}
.stat-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 14px; }
.stat-list { display: flex; flex-direction: column; gap: 10px; }
.empty-stat { color: var(--text-muted); font-size: 12px; text-align: center; padding: 16px 0; }
.stat-row { display: flex; align-items: center; gap: 10px; }
.stat-label { font-size: 12px; color: var(--text-secondary); width: 110px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 5px; }
.stat-bar-wrap { flex: 1; height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; }
.stat-bar { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.stat-count { font-size: 12px; font-weight: 600; color: var(--text-primary); width: 30px; text-align: right; }

.priorite-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.priorite-dot.critique { background: #ef4444; }
.priorite-dot.haute    { background: #f59e0b; }
.priorite-dot.moyenne  { background: #3b82f6; }
.priorite-dot.basse    { background: #10b981; }

@media (max-width: 900px) {
  .charts-row { grid-template-columns: 1fr; }
}
</style>

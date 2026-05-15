<template>
  <!-- Backdrop mobile -->
  <transition name="backdrop">
    <div v-if="isMobile && isOpen" class="sidebar-backdrop" @click="close"></div>
  </transition>

  <aside class="sidebar" :class="{ collapsed: isCollapsed, open: isOpen, hidden: !isOpen }">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <img src="@/assets/images/logo_mshpcmu.png" alt="MSHPCMU logo" width="22" height="22" />
      </div>
      <span class="brand-name">Le 143</span>
      <!-- Bouton réduire (desktop uniquement) -->
      <button v-if="!isMobile" class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Développer' : 'Réduire'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path :d="isCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">

        <router-link to="/dashboard" class="nav-item" active-class="active">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        
        <router-link to="/appels" class="nav-item" active-class="active" v-if="userRole !='inspecteur'">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="nav-text">Appels</span>
          <!-- <span class="nav-badge">12</span> -->
        </router-link>

        <router-link to="/tickets" class="nav-item" active-class="active">
          <span class="nav-icon">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8V6C20 4.9 19.1 4 18 4H4C2.9 4 2 4.9 2 6V8C3.1 8 4 8.9 4 10C4 11.1 3.1 12 2 12V16C2 17.1 2.9 18 4 18H18C19.1 18 20 17.1 20 16V14C18.9 14 18 13.1 18 12C18 10.9 18.9 10 20 8Z" stroke="currentColor" stroke-width="1.5"/>
            <line x1="7" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="7" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="7" y1="15" x2="11" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          </span>
          <span class="nav-text">Tickets</span>
          <!-- <span class="nav-badge">12</span> -->
        </router-link>
      </div>

      <div class="nav-section" v-if="['admin', 'manager', 'superviseur'].includes(userRole)">
        <span class="nav-label">Paramètres</span>

        <router-link to="/typerequetes" class="nav-item" active-class="active">

          <span class="nav-icon">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2V5" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 13H15" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 17H12" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.5C19.33 3.68 21 4.95 21 9.65V15.83C21 19.95 20 22.01 15 22.01H9C4 22.01 3 19.95 3 15.83V9.65C3 4.95 4.67 3.69 8 3.5H16Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="nav-text">Catégorie de requête</span>
        </router-link>

        <router-link to="/typeappels" class="nav-item" active-class="active">

          <span class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 8C7.65685 8 9 6.65685 9 5C9 3.34315 7.65685 2 6 2C4.34315 2 3 3.34315 3 5C3 6.65685 4.34315 8 6 8Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 16V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8 16L7 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M16 16L17 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-text">Catégorie d'appel</span>
        </router-link>

        <router-link to="/localites" class="nav-item" active-class="active">

          <span class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M2 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 2V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-text">Villes/Communes/Localités</span>
        </router-link>

         <router-link to="/utilisateurs" class="nav-item" active-class="active" v-if="['admin'].includes(userRole)">

          <span class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 9C19.2091 9 21 7.20914 21 5C21 2.79086 19.2091 1 17 1C14.7909 1 13 2.79086 13 5C13 7.20914 14.7909 9 17 9Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M22 15V13C22 10.79 20.21 9 18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M2 15V13C2 10.79 3.79 9 6 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 15V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 22C14.7614 22 17 19.7614 17 17C17 14.2386 14.7614 12 12 12C9.23858 12 7 14.2386 7 17C7 19.7614 9.23858 22 12 22Z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </span>
          <span class="nav-text">Utilisateurs</span>
        </router-link>

        <router-link to="/equipes" class="nav-item" active-class="active" v-if="['admin'].includes(userRole)">
          <span class="nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M20 20C20 16.6863 16.4183 14 12 14C7.58172 14 4 16.6863 4 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M5 9C5 10.6569 3.65685 12 2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M19 9C19 10.6569 20.3431 12 22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-text">Équipes</span>
        </router-link>

        <router-link to="/rapports" class="nav-item" active-class="active">

          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="nav-text">Rapports</span>
        </router-link>
      </div>
    </nav>


    <!-- Infos utilisateur connecté -->
    <div v-if="currentUser" class="sidebar-user">
      <div class="user-avatar">
        <span>{{ userInitials }}</span>
      </div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRoleLabel }}</span>
      </div>
    </div>

    <!-- Bouton de déconnexion -->
    <div class="sidebar-logout">
      <button class="logout-btn" @click="confirmLogout">
        <!-- <span class="logout-icon" aria-hidden="true">🚪</span> -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        <span class="logout-text">Déconnexion</span>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { API_BASE } from '@/config/api.js'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar.js'

const { isOpen, isMobile, close, init } = useSidebar()
const isCollapsed = ref(false)

const router = useRouter()

// Récupérer l'utilisateur connecté depuis le localStorage
const currentUser = ref(null)

onMounted(() => {
  init()
  const stored = localStorage.getItem('user')
  if (!stored) return
  try {
    currentUser.value = JSON.parse(stored)
  } catch {
    currentUser.value = null
  }
})

const userName = computed(() => {
  return currentUser.value?.username || currentUser.value?.login || 'Utilisateur'
})

const userRole = computed(() => {
  return (currentUser.value?.role || '').toLowerCase()
})

const userRoleLabel = computed(() => {
  const role = (currentUser.value?.role || '').toLowerCase()
  const map = {
    admin: 'Administrateur',
    superviseur: 'Superviseur',
    agent: 'Agent',
    inspecteur: 'Inspecteur'
  }
  return map[role] || currentUser.value?.role || ''
})

const userInitials = computed(() => {
  const name = userName.value || ''
  if (name.length < 2) return name.toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

// Endpoint de déconnexion côté backend
const apiLogout = API_BASE + '/api/auth/logout'

async function doLogout() {
  const token = localStorage.getItem('token')
  try {
    if (token) {
      await fetch(apiLogout, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })
    }
  } catch (error) {
    // On affiche l'erreur mais on continue quand même la déconnexion côté client.
    console.error('Erreur lors de la déconnexion:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}

function confirmLogout() {
  // Débutant-friendly: confirmation simple avant de vider le token.
  const ok = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')
  if (ok) doLogout()
}
</script>

<style scoped>
/* Backdrop mobile */
.sidebar-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
}
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease, width 0.3s ease;
  overflow: hidden;
}

/* Desktop : sidebar masquée = réduite à zéro */
.sidebar.hidden {
  transform: translateX(-100%);
}

/* Mobile : hors écran par défaut, glisse quand open */
@media (max-width: 767px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: var(--header-height);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.brand-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 16px var(--accent-glow);
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.collapse-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  transition: all 0.2s;
  flex-shrink: 0;
}
.collapse-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-section { display: flex; flex-direction: column; gap: 2px; }

.nav-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  padding: 0 10px 8px;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(59,130,246,0.12);
  color: var(--accent);
  border: 1px solid var(--border-accent);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 60%;
  background: var(--accent);
  border-radius: 0 3px 3px 0;
}

.nav-icon { display: flex; flex-shrink: 0; }
.nav-text { font-size: 14px; font-weight: 500; flex: 1; }

.nav-badge {
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
}

.sidebar-user {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.user-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex-shrink: 0;
}

.user-info { display: flex; flex-direction: column; overflow: hidden; }
.user-name { font-size: 13px; font-weight: 600; white-space: nowrap; }
.user-role { font-size: 11px; color: var(--text-muted); white-space: nowrap; }

.collapsed { width: 64px; }
.collapsed .brand-name,
.collapsed .nav-text,
.collapsed .nav-label,
.collapsed .nav-badge,
.collapsed .user-info { display: none; }
.collapsed .nav-item { justify-content: center; padding: 10px; }
.collapsed .sidebar-brand { justify-content: center; padding: 0; }
.collapsed .collapse-btn { display: none; }
.collapsed .sidebar-user { justify-content: center; padding: 16px; }

.sidebar-logout {
  border-top: 1px solid var(--border);
  padding: 14px 12px;
  flex-shrink: 0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: var(--border-accent);
  color: var(--text-primary);
  background: var(--bg-hover);
}

.logout-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.logout-text {
  font-size: 14px;
  font-weight: 600;
}

.collapsed .logout-text {
  display: none;
}
</style>

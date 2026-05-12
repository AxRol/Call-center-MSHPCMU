<template>
  <header class="header">
    <div class="header-left">
      <!-- Bouton hamburger -->
      <button class="menu-toggle" @click="toggle" :title="isOpen ? 'Masquer le menu' : 'Afficher le menu'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-home">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ currentRoute }}</span>
      </div>
    </div>

    <!-- <div class="header-right">
      <div class="header-avatar">AD</div>
    </div> -->
    
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar.js'

const { isOpen, toggle } = useSidebar()

const route = useRoute()
const showNotifs = ref(false)

const currentRoute = computed(() => {
  const names = { '/dashboard': 'Dashboard', '/appels': 'Appels', '/tickets': 'Tickets', '/front_office/formulaire_appel': 'Formulaire d\'appel',
                  '/typeappels': 'Catégories d\'appels', '/typerequetes': 'Catégories de requêtes', '/localites': 'Localités', '/utilisateurs': 'Utilisateurs', '/rapports': 'Rapports', '/equipes': 'Équipes' }
  return names[route.path] || route.path
})

const notifications = ref([
  { id: 1, text: 'Nouvel appel entrant de +33 6 12 34 56', time: 'Il y a 2 min', type: 'info' },
  { id: 2, text: 'Action requise sur appel #4521', time: 'Il y a 15 min', type: 'warning' },
  { id: 3, text: 'Rapport mensuel disponible', time: 'Il y a 1h', type: 'success' },
])

function toggleTheme() {}
</script>

<style scoped>
.header {
  height: var(--header-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
}

.header-left { display: flex; align-items: center; gap: 12px; }

.menu-toggle {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  background: none; border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.menu-toggle:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border-accent); }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}
.breadcrumb-home { display: flex; }
.breadcrumb-sep { color: var(--text-muted); }
.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 600;
  font-family: var(--font-display);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  color: var(--text-muted);
  transition: all 0.2s;
  cursor: text;
  width: 220px;
}
.search-bar:focus-within {
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
  color: var(--text-primary);
}
.search-bar input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-secondary);
  font-size: 13px;
  flex: 1;
}
.search-bar input::placeholder { color: var(--text-muted); }
kbd {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.icon-btn {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 38px; height: 38px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.icon-btn:hover {
  border-color: var(--border-accent);
  color: var(--text-primary);
  background: var(--bg-hover);
}

.notif-dot {
  position: absolute;
  top: 7px; right: 7px;
  width: 8px; height: 8px;
  background: var(--danger);
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
}

.notif-btn { position: relative; }
.notif-dropdown {
  position: absolute;
  right: 0; top: calc(100% + 10px);
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  z-index: 200;
}
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-weight: 600;
  font-size: 13px;
}
.notif-count {
  font-size: 11px;
  background: var(--accent);
  color: white;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}
.notif-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: var(--bg-hover); }
.notif-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.notif-icon.info { background: rgba(59,130,246,0.15); color: var(--accent); }
.notif-icon.warning { background: rgba(245,158,11,0.15); color: var(--warning); }
.notif-icon.success { background: rgba(16,185,129,0.15); color: var(--success); }
.notif-body p { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
.notif-body span { font-size: 11px; color: var(--text-muted); }

.header-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.header-avatar:hover { border-color: var(--accent); }
</style>

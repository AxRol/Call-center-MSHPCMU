<template>
  <div class="app-layout" :class="{ 'auth-page': isAuthPage, 'form-page': isFormulairePage }">
    <Sidebar v-if="!isAuthPage" />
    
    <div 
      class="main-wrapper" 
      :class="{
        'full-width': isAuthPage, 
        'centered-form': isFormulairePage,
        'sidebar-collapsed': !isAuthPage && isCollapsed // Géré via l'état du composant
      }"
    >
      <Header v-if="!isAuthPage" />
      
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <Footer v-if="!isAuthPage" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/footer.vue'

const route = useRoute()
const router = useRouter()

const isAuthPage = computed(() => {
  return route.name === 'Login' || route.name === 'Inscription' || route.name === 'Formulaire_appel'
})

const isFormulairePage = computed(() => {
  return route.name === 'Formulaire_appel'
})

// Anti-"blocage après déconnexion":
// Si la déconnexion supprime le token du localStorage, on redirige vers /login
// même si l'utilisateur ne change pas de page.
let authIntervalId = null
onMounted(() => {
  authIntervalId = window.setInterval(() => {
    const token = localStorage.getItem('token')
    // Si on est déjà sur une page "auth", on ne redirige pas.
    if (isAuthPage.value) return
    if (!token) {
      router.push('/login')
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (authIntervalId) window.clearInterval(authIntervalId)
})
</script>

<style scoped>
/* Configuration des variables locales */
.app-layout {
  --sidebar-w: 280px;
  --sidebar-collapsed-w: 80px;
  --header-h: 70px;
  --bg-main: #f8fafc;
  --accent-color: #004a99;
  
  display: flex;
  min-height: 100vh;
  background: var(--bg-main);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

/* Styles spécifique Auth (Login) */
.app-layout.auth-page {
  background: #f1f5f9;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  /* Marge automatique si sidebar présente */
  padding-left: 0; 
}

/* Ajustement dynamique du contenu par rapport à la sidebar */
@media (min-width: 1024px) {
  .main-wrapper:not(.full-width) {
    margin-left: var(--sidebar-w);
  }
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

/* Page Formulaire d'appel (Design focalisé) */
.app-layout.form-page {
  background: #f8fafc;
}

.app-layout.form-page .main-content {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

/* Animations de transition de page */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive mobile */
@media (max-width: 1024px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
  .main-content {
    padding: 1rem;
  }
}

/* Dark Mode support */
@media (prefers-color-scheme: dark) {
  .app-layout:not(.auth-page):not(.form-page) {
    background: #0f172a;
    color: #f1f5f9;
  }
}
</style>
<template>
  <div class="app-layout" :class="{ 'auth-page': isAuthPage, 'form-page': isFormulairePage }">
    <Sidebar v-if="!isAuthPage" />
    <div class="main-wrapper" :class="{ 'full-width': isAuthPage, 'sidebar-collapsed': isCollapsed,  'centered-form': isFormulairePage, 'sidebar-open': !isAuthPage && mainShift }">
      <Header v-if="!isAuthPage" />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
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

.main-wrapper {
  margin-left: 260px; /* Largeur sidebar ouverte */
  transition: margin-left 0.3s ease; /* Animation fluide */
}

/* Quand la sidebar est réduite, on réduit la marge du contenu */
.main-wrapper.sidebar-collapsed {
  margin-left: 64px; /* Largeur sidebar réduite */
}

/* Dans :root ou au début du style */
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 64px;
}

/* Ligne CRUCIALE : quand la sidebar est réduite */
.sidebar.collapsed + .main-wrapper {
  margin-left: var(--sidebar-collapsed-width);
}

/* Pour le mobile ou le mode plein écran */
.main-wrapper.full-width {
  margin-left: 0;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-layout.auth-page {
  background: var(--bg-primary);
}

.app-layout.form-page {
  background: white;
}

.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-wrapper.full-width {
  margin-left: 0;
}

.main-wrapper.centered-form {
  justify-content: center;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: 28px 32px;
  background: var(--bg-primary);
  
}

.app-layout.auth-page .main-content {
  padding: 0;
}

.app-layout.form-page .main-content {
  background: white;
  padding: 28px 32px;
  border-radius: 0; /* Supprime les coins arrondis pour un vrai plein écran */
  box-shadow: none; /* Supprime l'ombre qui créait un effet de flottement */
  max-width: none; /* Supprime la limite de largeur */
  width: 100%;
  min-height: 80vh; /* Prend toute la hauteur de l'écran */
  margin: 0; /* Supprime les marges automatiques */
  display: flex;
  flex-direction: column;
}

/* @media (max-width: 768px) {
  .main-wrapper { margin-left: 0; }
} */

/* Mobile */
@media (max-width: 1024px) {
  .main-wrapper { margin-left: 0; }
}
</style>

/* import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

export default router */

import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Formulaire_appel from '@/views/Formulaire_appel.vue'
import Inscription from '@/views/Inscription.vue'
import Dashboard from '@/views/Dashboard.vue'
import Appels from '@/views/Appels.vue'
import Types_Appels from '@/views/Types_Appels.vue'
import Types_Requetes from '@/views/Types_Requetes.vue'
import Tickets from '@/views/Tickets.vue'
import Localite from '@/views/Localite.vue'
import Rapports from '@/views/Rapports.vue'
import Utilisateurs from '@/views/Utilisateurs.vue'
import Equipes from '@/views/Equipes.vue'


// note: component name matches file spelling (Dashbord) intentionally


const routes = [

  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  // {path: '/logout', name: 'Logout', component: Login },
  { path: '/inscription', name: 'Inscription', component: Inscription  },
  { path: '/formulaire_appel', name: 'Formulaire_appel', component: Formulaire_appel},


  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/appels', name: 'Appels', component: Appels },
  { path: '/typeappels', name: 'Types_Appels', component: Types_Appels },
  { path: '/typerequetes', name: 'Types_Requetes', component: Types_Requetes },
  { path: '/tickets', name: 'Tickets', component: Tickets },
  { path: '/localites', name: 'Localite', component: Localite }
  { path: '/rapports', name: 'Rapports', component: Rapports },
  { path: '/utilisateurs', name: 'Utilisateurs', component: Utilisateurs },
  { path: '/equipes', name: 'Equipes', component: Equipes },


]

const router = createRouter({
 history:createWebHistory(),
 routes
})

export default router

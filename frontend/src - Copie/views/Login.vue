<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-branding">
        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_Minist%C3%A8re_de_la_Sant%C3%A9_CI.png" alt="Filigrane MS" class="watermark-logo">
        
        <div class="branding-content">
          <h1>CRM du 143</h1>
          <p>Gestionnaire des requêtes d'appels et suivi de la relation usager.</p>
        </div>
      </div>

      <div class="login-form-area">
        <div class="login-header">
          <h2>Bon retour !</h2>
          <p>Identifiez-vous pour accéder à votre tableau de bord.</p>
        </div>

        <div class="login-body">
          <Transition name="fade">
            <div v-if="errorMessage" class="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ errorMessage }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="succesMessage" class="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {{ succesMessage }}
            </div>
          </Transition>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="login-login">identifiant <span class="required">*</span></label>
              <div class="input-wrapper" :class="{ 'error-border': loginErrors.login }">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input 
                  type="text" 
                  id="login-login" 
                  v-model="loginForm.login" 
                  placeholder="ex: agent.sanogo"
                  :disabled="isLoading"
                  @blur="validateLoginField('login')"
                >
              </div>
              <span v-if="loginErrors.login" class="error-text">{{ loginErrors.login }}</span>
            </div>

            <div class="input-group">
              <label for="login-password">Mot de passe <span class="required">*</span></label>
              <div class="input-wrapper" :class="{ 'error-border': loginErrors.password }">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="login-password" 
                  v-model="loginForm.password" 
                  placeholder="••••••••"
                  :disabled="isLoading"
                  @blur="validateLoginField('password')"
                  @keyup.enter="handleLogin"
                >
                <button type="button" class="btn-reveal" @click="showPassword = !showPassword">
                  <span v-if="!showPassword">👁️</span>
                  <span v-else>🔒</span>
                </button>
              </div>
              <span v-if="loginErrors.password" class="error-text">{{ loginErrors.password }}</span>
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Authentification...' : 'Se connecter' }}
            </button>
          </form>
        </div>

        <div class="login-footer">
          <p>© DISD | CRM du 143. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE } from '@/config/api.js'

const router = useRouter()
const isLoading     = ref(false)
const errorMessage  = ref('')
const succesMessage = ref('')
const loginForm     = reactive({ login: '', password: '' })
const loginErrors   = reactive({ login: '', password: '' })

const showPassword = ref(false) // La variable pour basculer l'affichage du mot de passe


const loginValidationRules = {
  login:    (v) => !v ? 'Le login est requis' : '',
  password: (v) => !v ? 'Le mot de passe est requis' : ''
}

function validateLoginField(field) {
  const rule = loginValidationRules[field]
  if (rule) loginErrors[field] = rule(loginForm[field])
}

function validateLoginForm() {
  let isValid = true
  Object.keys(loginValidationRules).forEach(field => {
    validateLoginField(field)
    if (loginErrors[field]) isValid = false
  })
  return isValid
}

async function handleLogin() {
  errorMessage.value  = ''
  succesMessage.value = ''
  if (!validateLoginForm()) return
  isLoading.value = true
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: loginForm.login, password: loginForm.password })
    })
    const data = await response.json()
    if (data.success) {
      succesMessage.value = data.message
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } else {
      errorMessage.value = data.message || 'Erreur de connexion'
    }
  } catch (error) {
    errorMessage.value = 'Impossible de se connecter au serveur'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.login-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 20px;
}

/* Carte principale */
.login-card {
  display: flex;
  width: 100%;
  max-width: 950px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 580px;
}

/* Panneau Branding (Gauche) */
.login-branding {
  flex: 1;
  /* Multi-couche : Dégradé + Logo en cover/contain */
  background-image: 
    linear-gradient(135deg, rgba(162, 178, 194, 0.85) 0%, rgba(0, 45, 95, 0.9) 100%), 
    url("/logo_mshpcmu.png");
  background-size: cover, 70%; /* Le logo est réduit à 70% pour bien flotter au milieu */
  background-position: center;
  background-repeat: no-repeat;
  padding: 40px;
  display: flex;
  align-items: center;
  color: white;
  position: relative;
}

.watermark-logo {
  position: absolute;
  width: 140%;
  opacity: 0.07;
  right: -20%;
  bottom: -10%;
  filter: grayscale(1) brightness(3);
  pointer-events: none;
}

.branding-content { position: relative; z-index: 2; }

.badge-online {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 25px;
  text-transform: uppercase;
}

.login-branding h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 15px; line-height: 1.1; }
.login-branding p { font-size: 1.1rem; opacity: 0.85; line-height: 1.6; }

.ms-label {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 13px;
}

/* Panneau Formulaire (Droite) */
.login-form-area {
  flex: 1.2;
  padding: 60px;
  display: flex;
  flex-direction: column;
}

.login-header h2 { color: #1e293b; font-size: 1.8rem; margin-bottom: 10px; }
.login-header p { color: #64748b; font-size: 0.95rem; margin-bottom: 40px; }

/* Groupes de saisie */
.input-group { margin-bottom: 24px; }
.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}
.required { color: #ef4444; }

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.input-wrapper.error-border { border-color: #ef4444; }

.input-icon { padding-left: 15px; color: #94a3b8; display: flex; }

.input-wrapper input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 14px 15px;
  font-size: 15px;
  outline: none;
  color: #1e293b;
}

.btn-reveal {
  background: none;
  border: none;
  padding-right: 15px;
  cursor: pointer;
  opacity: 0.6;
}

.error-text { color: #ef4444; font-size: 12px; margin-top: 6px; display: block; }

/* Bouton */
.btn-submit {
  width: 100%;
  padding: 15px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn-submit:hover { background: #0f172a; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

/* Alertes */
.alert {
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 25px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

.login-footer { margin-top: auto; text-align: center; color: #94a3b8; font-size: 12px; }

/* Animations */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .login-card { flex-direction: column; }
  .login-branding { display: none; }
  .login-form-area { padding: 40px 30px; }
}
</style>
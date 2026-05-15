<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <div class="header-logo">
        </div>
        <h1>Bienvenue</h1>
        <p>Gestionnaire des requêtes d'appels</p>
      </div>

      <div class="tab-content">
        <div v-if="errorMessage" class="error-alert">
          <i>⚠️</i> {{ errorMessage }}
        </div>
        <div v-if="succesMessage" class="succes-alert">
          <i>✅</i> {{ succesMessage }}
        </div>

        <div class="form-step active">
          <div class="info-message">
            <i>🔐 Connectez-vous à votre compte</i>
          </div>

          <div class="form-group">
            <label for="login-login">Login <span class="required">*</span></label>
            <input type="text" id="login-login" v-model="loginForm.login" placeholder="centre_appel"
              :class="{ 'error-border': loginErrors.login }"
              @blur="validateLoginField('login')" @keyup.enter="handleLogin" :disabled="isLoading">
            <span v-if="loginErrors.login" class="error-message">{{ loginErrors.login }}</span>
          </div>

          <div class="form-group">
            <label for="login-password">Mot de passe <span class="required">*</span></label>
            <input type="password" id="login-password" v-model="loginForm.password" placeholder="••••••••"
              :class="{ 'error-border': loginErrors.password }"
              @blur="validateLoginField('password')" @keyup.enter="handleLogin" :disabled="isLoading">
            <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
          </div>

          <button class="btn btn-primary" @click="handleLogin" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </div>

      <div class="login-footer">
        <p>© DISD | Gestionnaire des requêtes d'appels. Tous droits réservés.</p>
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

/* ══════════════════════════════════════════
   FOND + FILIGRANE GRAND FORMAT
   L'image fait 90vmin → occupe presque tout
   l'écran en restant proportionnelle.
   opacity: 0.10 = visible mais non intrusif.
══════════════════════════════════════════ */
.login-wrapper {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  /* Filigrane directement sur le wrapper via pseudo-élément */
  background-color: rgb(240, 241, 246);
}

/* Filigrane : centré, très grand, derrière tout */
.login-wrapper::before {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vmin;
  height: 90vmin;
  background-image: url("data:image/jpeg;base64,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");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.10;
  pointer-events: none;
  z-index: 0;
}

/* ── CARTE DE CONNEXION ── */
.login-container {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(2px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* ── HEADER ── */
.login-header {
  text-align: center;
  padding: 28px 40px 20px;
  background: linear-gradient(135deg, rgb(57, 90, 236) 0%, rgb(80, 81, 185) 100%);
  color: white;
}

.header-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.ministry-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 50%;
  background: white;
  padding: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.login-header h1 { font-size: 1.8rem; margin-bottom: 6px; font-weight: 600; }
.login-header p  { font-size: 0.95rem; opacity: 0.9; }

/* ── CONTENU ── */
.tab-content {
  padding: 30px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.form-group { margin-bottom: 20px; }

label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}
label .required { color: #dc3545; margin-left: 3px; }

input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  background: rgba(255,255,255,0.95);
}
input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
input.error-border { border-color: #dc3545; }

.error-message { color: #dc3545; font-size: 12px; margin-top: 5px; display: block; }

.btn {
  width: 100%;
  padding: 12px 30px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-primary {
  background: linear-gradient(135deg, rgb(71, 99, 224) 0%, rgb(80, 81, 185) 100%);
  color: white;
}
.btn-primary:hover    { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.info-message {
  background: #e7f5ff;
  color: #0c5460;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 25px;
  font-size: 14px;
  border-left: 4px solid #17a2b8;
}

.error-alert {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid #dc3545;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.succes-alert {
  background: rgb(213, 237, 208);
  color: rgb(28, 114, 42);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid rgb(38, 224, 66);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── FOOTER ── */
.login-footer {
  text-align: center;
  padding: 18px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  color: #6c757d;
  font-size: 13px;
}

/* ── SPINNER ── */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .login-container { margin: 10px; }
  .login-header    { padding: 22px 20px 16px; }
  .login-header h1 { font-size: 1.5rem; }
  .tab-content     { padding: 20px; }
}
</style>
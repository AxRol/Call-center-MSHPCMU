<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- Logo / Titre -->
      <div class="login-header">
        <h1>Bienvenue</h1>
        <p>Gestionnaire des requêtes d'appels</p>
      </div>

      <!-- Contenu -->
      <div class="tab-content">
        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="error-alert">
          <i>⚠️</i> {{ errorMessage }}
        </div>
        <div v-if="succesMessage" class="succes-alert">
          <i>✅</i> {{ succesMessage }}
        </div>

        <!-- Formulaire de Connexion -->
        <div class="form-step active">
          <div class="info-message">
            <i>🔐 Connectez-vous à votre compte</i>
          </div>

          <div class="form-group">
            <label for="login-login">Login <span class="required">*</span></label>
            <input type="text" id="login-login" v-model="loginForm.login" placeholder="centre_appel" :class="{ 'error-border': loginErrors.login }"  @blur="validateLoginField('login')" @keyup.enter="handleLogin" :disabled="isLoading">
            <span v-if="loginErrors.login" class="error-message">{{ loginErrors.login }}</span>
          </div>

          <div class="form-group">
            <label for="login-password">Mot de passe <span class="required">*</span></label>
            <input type="password" id="login-password" v-model="loginForm.password" placeholder="••••••••" :class="{ 'error-border': loginErrors.password }"  @blur="validateLoginField('password')" @keyup.enter="handleLogin" :disabled="isLoading">
            <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
          </div>

          <button class="btn btn-primary btn-block"  @click="handleLogin"  :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </div>

      <!-- Accès formulaire appel -->
      <!-- <div class="login-form-link">
        <a href="/front_office/formulaire_appel" target="_blank" rel="noopener" class="btn-form-appel">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.08-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
          </svg>
          Accéder au formulaire d'appel
        </a>
      </div> -->

      <!-- Footer -->
      <div class="login-footer">
        <p>© DISD | Gestionnaire des requêtes d'appels. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// États
const isLoading = ref(false)
const errorMessage = ref('')
const succesMessage = ref('')

// Formulaire de connexion
const loginForm = reactive({
  login: '',
  password: ''
})

// Erreurs de validation
const loginErrors = reactive({
  login: '',
  password: ''
})

// Règles de validation
const loginValidationRules = {
  login: (value) => {
    if (!value) return "Le login est requis"
    return ''
  },
  password: (value) => !value ? 'Le mot de passe est requis' : ''
}

// Validation des champs
function validateLoginField(field) {
  const rule = loginValidationRules[field]
  if (rule) {
    loginErrors[field] = rule(loginForm[field])
  }
}

// Validation complète
function validateLoginForm() {
  let isValid = true
  Object.keys(loginValidationRules).forEach(field => {
    validateLoginField(field)
    if (loginErrors[field]) isValid = false
  })
  return isValid
}

// Gestion de la connexion
async function handleLogin() {
  // Réinitialiser les messages d'erreur
  errorMessage.value = ''
  succesMessage.value = ''

  if (!validateLoginForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:5170/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour les sessions
      body: JSON.stringify({username: loginForm.login, password: loginForm.password})
    })

    const data = await response.json()

    if (data.success) {
      //console.log('Connexion réussie:', data.user, data.token)
      console.log('Connexion réussie:')
      succesMessage.value = data.message
      
      localStorage.setItem('token', data.token)
      
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/back_office/dashboard')
      
     /*  if (data.user.role === 'agent') {
        router.push('/front_office/formulaire_appel') 
      } else {
        router.push('/back_office/dashboard') 
      }  */
    
      //// Message de succès
      //alert('Connexion réussie !')
    } else {
      // Erreur de connexion
      errorMessage.value = data.message || 'Erreur de connexion'
    }
  } catch (error) {
    console.error('Erreur réseau:', error)
    errorMessage.value = 'Impossible de se connecter au serveur'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-wrapper {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg,rgb(233, 234, 239) 0%,rgb(248, 248, 248) 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 40px 40px 20px;
  background: linear-gradient(135deg,rgb(57, 90, 236) 0%,rgb(80, 81, 185) 100%);
  color: white;
}

.login-header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.login-header p {
  font-size: 1rem;
  opacity: 0.9;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.tab {
  flex: 1;
  padding: 15px 20px;
  text-align: center;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  transition: all 0.3s ease;
  position: relative;
}

.tab.active {
  color: #667eea;
  background-color: white;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.tab-content {
  padding: 30px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}

label .required {
  color: #dc3545;
  margin-left: 3px;
}

input, select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error-border {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.checkbox-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
}

.checkbox-item label {
  margin-bottom: 0;
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg,rgb(71, 99, 224) 0%,rgb(71, 99, 224) 100%);
  color: white;
  width: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-google {
  background: white;
  color: #495057;
  border: 2px solid #e9ecef;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-google:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 20px;
  height: 20px;
}

.separator {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.separator::before,
.separator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e9ecef;
}

.separator::before {
  left: 0;
}

.separator::after {
  right: 0;
}

.separator span {
  background: white;
  padding: 0 10px;
  color: #6c757d;
  font-size: 14px;
}

.info-message {
  background: #e7f5ff;
  color: #0c5460;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 25px;
  font-size: 14px;
  border-left: 4px solid #17a2b8;
}

.login-form-link {
  padding: 0 20px 16px;
  text-align: center;
}

.btn-form-appel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: #f0f7ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.btn-form-appel:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.login-footer {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .login-container {
    margin: 10px;
  }

  .login-header {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }

  .tab-content {
    padding: 20px;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    flex-direction: column;
    align-items: flex-start;
  }
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
  background:rgb(213, 237, 208);
  color:rgb(28, 114, 42);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid rgb(38, 224, 66);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
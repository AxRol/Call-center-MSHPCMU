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

        <!-- Message de succès -->
        <div v-if="successMessage" class="success-alert">
          <i>✅</i> {{ successMessage }}
        </div>

        <!-- Formulaire d'Inscription -->
        <div class="form-step active">
          <div class="info-message">
            <i>📝 Créez votre compte</i>
          </div>

          <div class="form-group">
            <label for="register-login">Login <span class="required">*</span></label>
            <input type="text" 
              id="register-login"
              v-model="registerForm.login"
              placeholder="centre_appel"
              :class="{ 'error-border': registerErrors.login }" 
              @blur="validateRegisterField('login')"
              @keyup.enter="handleRegister"
              :disabled="isLoading"
            >
            <span v-if="registerErrors.login" class="error-message">{{ registerErrors.login }}</span>
          </div>

          <div class="row">
            <div class="form-group">
              <label for="register-password">Mot de passe <span class="required">*</span></label>
              <input 
                type="password" 
                id="register-password"
                v-model="registerForm.password"
                placeholder="••••••••"
                :class="{ 'error-border': registerErrors.password }" 
                @blur="validateRegisterField('password')"
                @keyup.enter="handleRegister"
                :disabled="isLoading"
              >
              <span v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</span>
            </div>

            <div class="form-group">
              <label for="register-confirm-password">Confirmer <span class="required">*</span></label>
              <input 
                type="password" 
                id="register-confirm-password"
                v-model="registerForm.confirmPassword"
                placeholder="••••••••"
                :class="{ 'error-border': registerErrors.confirmPassword }" 
                @blur="validateRegisterField('confirmPassword')"
                @keyup.enter="handleRegister"
                :disabled="isLoading"
              >
              <span v-if="registerErrors.confirmPassword" class="error-message">{{ registerErrors.confirmPassword }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="register-role">Rôle</label>
            <select id="register-role" v-model="registerForm.role" :disabled="isLoading">
              <option value="">-- Selectionner le role utilisateur --</option>
              <option value="agent">Agent</option>
              <option value="superviseur">Superviseur</option>
              <option value="manager">Manager</option>
              <option value="inspecteur">Inspecteur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <button class="btn btn-primary btn-block" @click="handleRegister" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Inscription...' : "S'inscrire" }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>© DISD Gestionnaire d'appels. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { API_BASE } from '@/config/api.js'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// États
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Formulaire d'inscription
const registerForm = reactive({
  login: '',
  password: '',
  confirmPassword: '',
  role: ''
})

// Erreurs d'inscription
const registerErrors = reactive({
  login: '',
  password: '',
  confirmPassword: '',
  role: ''
})

// Règles de validation pour l'inscription
const registerValidationRules = {
  login: (value) => {
    if (!value) return 'Le login est requis'
    if (value.length < 3) return 'Le login doit contenir au moins 3 caractères'
    return ''
  },
  password: (value) => {
    if (!value) return 'Le mot de passe est requis'
    if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères'
    return ''
  },
  confirmPassword: (value) => {
    if (!value) return 'La confirmation est requise'
    if (value !== registerForm.password) return 'Les mots de passe ne correspondent pas'
    return ''
  },
}

// Validation des champs
function validateRegisterField(field) {
  const rule = registerValidationRules[field]
  if (rule) {
    registerErrors[field] = rule(registerForm[field])
  }
}

// Validation complète
function validateRegisterForm() {
  let isValid = true
  Object.keys(registerValidationRules).forEach(field => {
    validateRegisterField(field)
    if (registerErrors[field]) isValid = false
  })
  return isValid
}

// Gestion de l'inscription
async function handleRegister() {
  // Réinitialiser les messages
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateRegisterForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(API_BASE + '/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: registerForm.login,
        password: registerForm.password,
        role: registerForm.role
      })
    })

    const data = await response.json()

    if (data.success) {
      // Inscription réussie
      console.log('Inscription réussie:', data.user)
      
      // Message de succès
      successMessage.value = 'Inscription réussie ! Redirection vers la connexion...'
      
      // Réinitialiser le formulaire
      registerForm.login = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.role = ''
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      // Erreur d'inscription
      errorMessage.value = data.message || "Erreur lors de l'inscription"
    }
  } catch (error) {
    console.error('Erreur réseau:', error)
    errorMessage.value = 'Impossible de se connecter au serveur'
  } finally {
    isLoading.value = false
  }
}

// Redirection vers la page de connexion
function goToLogin() {
  router.push('/login')
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
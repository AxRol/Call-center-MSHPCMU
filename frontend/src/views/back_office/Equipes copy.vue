<template>
  <div class="equipes-page">
    <div class="page-header">
      <div>
        <h1>Liste des équipes</h1>
        <p>{{ filteredEquipes.length }} équipes trouvées</p>
      </div>
      <button class="btn-primary" @click="openModal('create')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Nouvelle équipe
      </button>
    </div>

    <div class="filters-bar">
      <div class="search-input">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Rechercher par nom ou UID..." />
      </div>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipe</th>
            <th>Superviseur(s)</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredEquipes.length === 0">
            <td colspan="6" class="empty-state">Aucune équipe trouvée.</td>
          </tr>
          <tr v-for="equipe in filteredEquipes" :key="equipe.uid">
            <td class="id-cell">{{ equipe.uid }}</td>
            <td>{{ equipe.nom }}</td>
            <td class="mono">{{ equipe.superviseur || "—" }}</td>
            <td>
              <span class="status-badge" :class="equipe.is_active ? 'active' : 'inactive'">
                {{ equipe.is_active ? "Active" : "Inactive" }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="action-btn edit" title="Éditer" @click="openModal('edit', equipe)">
                  ✎
                </button>
                <button class="action-btn delete" title="Supprimer" @click="confirmDelete(equipe)">
                  🗑
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="modal.show" @click.self="closeModal">
          <div class="modal">
            <template v-if="modal.type === 'create' || modal.type === 'edit'">
              <div class="modal-header">
                <h2>{{ modal.type === 'edit' ? "Éditer l'équipe" : "Nouvelle équipe" }}</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>Nom *</label>
                  <input v-model="form.nom" type="text" placeholder="Nom de l'équipe" />
                </div>
                <div class="form-group">
                  <label>Superviseur(s)</label>
                  <input v-model="form.user_name" type="text" placeholder="Nom du superviseur" />
                </div>
                <div class="form-group checkbox-inline">
                  <input id="is_active" v-model="form.is_active" type="checkbox" />
                  <label for="is_active">Équipe active</label>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-primary" @click="saveForm" :disabled="loading">
                  {{ loading ? "Chargement..." : (modal.type === "edit" ? "Enregistrer" : "Créer") }}
                </button>
              </div>
            </template>

            <template v-else-if="modal.type === 'delete'">
              <div class="modal-header danger">
                <h2>Supprimer l'équipe</h2>
                <button class="modal-close" @click="closeModal">✕</button>
              </div>
              <div class="modal-body">
                <p>
                  Confirmer la suppression de l'équipe <strong>{{ modal.data?.nom }}</strong> ?
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn-outline" @click="closeModal">Annuler</button>
                <button class="btn-danger" @click="doDelete" :disabled="loading">
                  {{ loading ? "Chargement..." : "Supprimer" }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const apiEquipe = "http://localhost:5170/api/equipe";

const equipes = ref([]);
const search = ref("");
const loading = ref(false);

const modal = ref({ show: false, type: "", data: null });
const form = ref({
  uid: "",
  nom: "",
  user_uid: "",
  is_active: true
});

const filteredEquipes = computed(() => {
  if (!search.value.trim()) return equipes.value;
  const s = search.value.toLowerCase().trim();
  return equipes.value.filter((e) =>
    String(e.nom || "").toLowerCase().includes(s) ||
    String(e.uid || "").toLowerCase().includes(s) ||
    String(e.user_uid || "").toLowerCase().includes(s)
  );
});

function formatDate(dateIso) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

async function loadEquipes() {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    const resp = await fetch(apiEquipe, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });
    if (resp.ok) {
      const result = await resp.json();
      equipes.value = result.data || [];
    }
  } catch (err) {
    console.error("Erreur loadEquipes:", err);
  } finally {
    loading.value = false;
  }
}

function openModal(type, data = null) {
  modal.value = { show: true, type, data };
  if (type === "edit" && data) {
    form.value = {
      uid: data.uid || "",
      nom: data.nom || "",
      user_name: data.superviseur || "",
      is_active: !!data.is_active
    };
  } else if (type === "create") {
    form.value = { uid: "", nom: "", user_name: "", is_active: true };
  }
}

function closeModal() {
  modal.value = { show: false, type: "", data: null };
}

function confirmDelete(equipe) {
  openModal("delete", equipe);
}

async function saveForm() {
  if (!form.value.nom) {
    alert("Le nom est requis");
    return;
  }
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const isEdit = modal.value.type === "edit";
    const url = isEdit ? `${apiEquipe}/${form.value.uid}` : apiEquipe;
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      nom: form.value.nom,
      user_uid: null,
      is_active: !!form.value.is_active
    };

    const resp = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || "Erreur serveur");
    }

    closeModal();
    await loadEquipes();
  } catch (err) {
    console.error("Erreur saveForm equipe:", err);
    alert(err.message || "Erreur lors de l'enregistrement");
  } finally {
    loading.value = false;
  }
}

async function doDelete() {
  if (!modal.value.data?.uid) return;
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    const resp = await fetch(`${apiEquipe}/${modal.value.data.uid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || "Erreur serveur");
    }
    closeModal();
    await loadEquipes();
  } catch (err) {
    console.error("Erreur doDelete equipe:", err);
    alert(err.message || "Erreur lors de la suppression");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadEquipes();
});
</script>

<style scoped>
.equipes-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
.page-header p { color: var(--text-muted); font-size: 13px; margin-top: 2px; }

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--accent); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; transition: all 0.2s;
}
.btn-primary:hover { background: #2563eb; }

.btn-outline {
  background: none; border: 1px solid var(--border);
  color: var(--text-secondary); padding: 9px 16px;
  border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
}

.btn-danger {
  background: var(--danger); color: white; border: none;
  padding: 9px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500;
}

.filters-bar { display: flex; gap: 10px; align-items: center; }
.search-input {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 9px 14px;
  color: var(--text-muted); flex: 1;
}
.search-input input { background: none; border: none; outline: none; color: var(--text-secondary); font-size: 13px; flex: 1; }

.table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 13px 16px; border-bottom: 1px solid var(--border);
  font-size: 13px; color: var(--text-secondary);
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }

.id-cell { font-weight: 700; color: var(--text-primary); font-family: monospace; font-size: 12px; }
.mono { font-family: monospace; font-size: 12px; }
.muted { color: var(--text-muted); font-size: 12px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); }

.status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.status-badge.active { background: rgba(16,185,129,0.12); color: #10b981; }
.status-badge.inactive { background: rgba(239,68,68,0.12); color: #ef4444; }

.action-btns { display: flex; gap: 6px; }
.action-btn {
  width: 30px; height: 30px; border: 1px solid var(--border);
  border-radius: 7px; display: flex; align-items: center; justify-content: center;
  background: none; transition: all 0.15s;
}
.action-btn.edit { color: var(--warning); }
.action-btn.delete { color: var(--danger); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.modal {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); width: 100%; max-width: 560px;
  box-shadow: var(--shadow); max-height: 90vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
.modal-header.danger h2 { color: var(--danger); }
.modal-close {
  background: none; border: none; color: var(--text-muted);
  font-size: 18px; cursor: pointer; width: 30px; height: 30px;
}
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.form-group input {
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); padding: 9px 12px;
  border-radius: var(--radius-sm); font-size: 13px; outline: none;
}
.checkbox-inline { flex-direction: row; align-items: center; gap: 8px; }
.checkbox-inline input { width: 16px; height: 16px; }

.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 16px 24px; border-top: 1px solid var(--border);
}
</style>

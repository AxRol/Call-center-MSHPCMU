<template>
  <footer class="footer">
    <span class="footer-left">© 2026 <strong>MSHPCMU | DISD | DCRP | Le CRM du 143</strong> — Tous droits réservés</span>
    <span class="footer-right">
    </span>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 48px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.footer-left strong { color: var(--text-secondary); }

.footer-right a {
  color: var(--text-muted);
  transition: color 0.2s;
}
.footer-right a:hover { color: var(--accent); }
</style>

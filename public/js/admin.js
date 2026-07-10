document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('adminSidebar');
  if (!sidebar) return;

  const user = getUser();
  const initiale = user && user.nom ? user.nom.charAt(0).toUpperCase() : 'A';

  sidebar.innerHTML = `
    <div class="admin-sidebar">
      <div class="admin-sidebar-brand">
        <i class="fas fa-cubes"></i> StockPro
      </div>
      <div class="admin-sidebar-nav">
        <a href="/views/admin/dashboard.html" class="sidebar-link" data-page="dashboard">
          <i class="fas fa-chart-line"></i> Tableau de bord
        </a>
        <a href="/views/admin/produits.html" class="sidebar-link" data-page="produits">
          <i class="fas fa-boxes"></i> Produits
        </a>
        <a href="/views/admin/categories.html" class="sidebar-link" data-page="categories">
          <i class="fas fa-tags"></i> Catégories
        </a>
        <a href="/views/admin/commandes.html" class="sidebar-link" data-page="commandes">
          <i class="fas fa-truck"></i> Commandes
        </a>
        <a href="/views/admin/alertes.html" class="sidebar-link" data-page="alertes">
          <i class="fas fa-bell"></i> Alertes stock <span class="sidebar-badge" id="sidebarAlertBadge" style="display:none"></span>
        </a>
        <a href="/views/admin/clients.html" class="sidebar-link" data-page="clients">
          <i class="fas fa-users"></i> Clients
        </a>
        <a href="/views/admin/promotions.html" class="sidebar-link" data-page="promotions">
          <i class="fas fa-tag"></i> Promotions
        </a>
        <div class="sidebar-divider"></div>
        <a href="/views/profil.html" class="sidebar-link">
          <i class="fas fa-user-circle"></i> Mon profil
        </a>
        <button class="sidebar-link logout" id="sidebarLogout">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
    </div>
  `;

  const currentPage = document.body.dataset.page || '';
  document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });

  document.getElementById('sidebarLogout').addEventListener('click', async () => {
    if (!await confirmAsync('Êtes-vous sûr de vouloir vous déconnecter ?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/views/auth/login.html';
  });

  const token = localStorage.getItem('token');
  if (token) {
    fetch(API + '/alertes', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const actives = data.data.filter(a => !a.resolu);
          const badge = document.getElementById('sidebarAlertBadge');
          if (badge && actives.length > 0) {
            badge.textContent = actives.length;
            badge.style.display = 'inline-flex';
          }
        }
      }).catch(() => {});
  }
});

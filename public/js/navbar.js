document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  fetch('/views/partials/navbar.html')
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;
      initialiserNavbar();
    })
    .catch(() => {});
});

function initialiserNavbar() {
  const token = getToken();
  const user = getUser();

  const authLinks = document.getElementById('authLinks');
  const userMenu = document.getElementById('userMenu');

  if (token && user) {
    if (authLinks) authLinks.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'block';
      const nameEl = document.getElementById('userName');
      const avatarEl = document.getElementById('userAvatar');
      if (nameEl) nameEl.textContent = user.nom || user.email || 'Utilisateur';
      if (avatarEl) avatarEl.textContent = (user.nom || 'U').charAt(0).toUpperCase();
    }

    if (user.role === 'admin') {
      const userBtn = document.getElementById('userBtn');
      if (userBtn) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = '/views/admin/dashboard.html';
        });
      }
      const panierLink = document.getElementById('navPanier');
      if (panierLink) panierLink.style.display = 'none';
    } else {
      chargerBadgePanier();
    }

    const navNotif = document.getElementById('navNotif');
    if (navNotif) navNotif.style.display = 'block';
    if (typeof chargerNotifications === 'function') chargerNotifications();
  } else {
    if (authLinks) authLinks.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }

  const userBtn = document.getElementById('userBtn');
  const dropdown = document.getElementById('userDropdown');
  if (userBtn && dropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (!await confirmAsync('Êtes-vous sûr de vouloir vous déconnecter ?')) return;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/views/auth/login.html';
    });
  }

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navbarLinks');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

async function chargerBadgePanier() {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(API + '/panier', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
      const nb = data.data.lignes ? data.data.lignes.reduce((a, l) => a + l.quantite, 0) : 0;
      const badge = document.getElementById('cartBadge');
      if (badge) {
        badge.textContent = nb;
        badge.style.display = nb > 0 ? 'inline' : 'none';
      }
    }
  } catch (e) {}
}

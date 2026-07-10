async function chargerNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(API + '/notifications?lue=false', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
      const badge = document.getElementById('notifBadge');
      const count = data.data.length;
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    }
  } catch (e) {}
}

async function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;

  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(API + '/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.success) {
      const list = document.getElementById('notifList');
      if (data.data.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px"><i class="fas fa-bell-slash"></i><br>Aucune notification</div>';
      } else {
        list.innerHTML = data.data.slice(0, 20).map(n => {
          const icons = { commande: 'fa-receipt', alerte: 'fa-exclamation-triangle', promotion: 'fa-tag', info: 'fa-info-circle' };
          const icon = icons[n.type] || 'fa-bell';
          return `
            <div class="notif-item ${n.lu ? 'lue' : ''}" onclick="marquerNotifLue('${n._id}', this)">
              <i class="fas ${icon} notif-icon"></i>
              <div class="notif-content">
                <p>${n.message}</p>
                <span class="notif-date">${new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          `;
        }).join('');
      }
      panel.style.display = 'block';
    }
  } catch (e) {}
}

async function marquerNotifLue(id, el) {
  const token = localStorage.getItem('token');
  try {
    await fetch(API + '/notifications/' + id + '/lue', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (el) el.classList.add('lue');
    chargerNotifications();
  } catch (e) {}
}

async function marquerToutLue() {
  const token = localStorage.getItem('token');
  try {
    await fetch(API + '/notifications/lire-tout', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    document.querySelectorAll('.notif-item').forEach(el => el.classList.add('lue'));
    chargerNotifications();
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  chargerNotifications();
  setInterval(chargerNotifications, 60000);
});

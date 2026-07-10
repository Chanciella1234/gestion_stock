function formatPrix(prix) {
  return prix.toFixed(2) + 'FBU';
}

function getNbArticles() {
  const badge = document.getElementById('cartBadge');
  return badge ? parseInt(badge.textContent) || 0 : 0;
}

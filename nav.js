function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function updateSideNavVisibility() {
  const upBtn = document.getElementById("scroll-up-btn");
  const downBtn = document.getElementById("scroll-down-btn");
  if (!upBtn || !downBtn) return;

  const scrollY = window.scrollY;
  const nearTop = scrollY <= 5;
  const nearBottom = window.innerHeight + scrollY >= document.body.scrollHeight - 5;

  upBtn.classList.toggle("side-btn-hidden", nearTop);
  downBtn.classList.toggle("side-btn-hidden", nearBottom);
}

window.addEventListener("scroll", updateSideNavVisibility);
window.addEventListener("resize", updateSideNavVisibility);
window.addEventListener("load", updateSideNavVisibility);
// Recheck when a Step is expanded/collapsed, since it changes page height
document.addEventListener("toggle", updateSideNavVisibility, true);

// Handles the dynamic number of Lesson blocks on step.html (max 5),
// based on the "Number of sessions" selector.

const MAX_SESSIONS = 7;

function getLessonBlock(n) {
  return document.getElementById("lesson-" + n);
}

function clearLessonFields(n) {
  const block = getLessonBlock(n);
  if (!block) return;
  block.querySelectorAll("textarea").forEach((t) => (t.value = ""));
  block.querySelectorAll('input[type="text"], input[type="url"]').forEach((i) => (i.value = ""));
  block.querySelectorAll("select").forEach((s) => (s.selectedIndex = 0));
  block.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
}

function applySessionCount(count) {
  for (let n = 1; n <= MAX_SESSIONS; n++) {
    const block = getLessonBlock(n);
    if (!block) continue;
    block.style.display = n <= count ? "" : "none";
  }
}

function handleSessionCountChange(selectEl) {
  const newCount = parseInt(selectEl.value, 10) || 0;
  const previousCount = parseInt(selectEl.dataset.previousCount || "0", 10);

  if (newCount < previousCount) {
    const confirmed = window.confirm(
      "Reducing the number of sessions will delete the content already entered for the removed sessions. Do you want to continue?"
    );
    if (!confirmed) {
      selectEl.value = String(previousCount);
      return;
    }
    for (let n = newCount + 1; n <= previousCount; n++) {
      clearLessonFields(n);
    }
  }

  applySessionCount(newCount);
  selectEl.dataset.previousCount = String(newCount);
}

window.addEventListener("load", () => {
  const selectEl = document.getElementById("number-select");
  if (!selectEl) return;
  const initialCount = parseInt(selectEl.value, 10) || 0;
  selectEl.dataset.previousCount = String(initialCount);
  applySessionCount(initialCount);
});

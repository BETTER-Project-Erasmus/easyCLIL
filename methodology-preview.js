// Shows a mind-map preview (image + confirm/cancel) when a teacher clicks
// one of the three methodology buttons on index.html, before entering the
// corresponding lesson-preparation page.

const METHODOLOGY_PREVIEWS = {
  linguistic: { image: "IMG/linguistic.png", target: "linguistic.html", label: "Linguistic approach" },
  problem: { image: "IMG/solve.png", target: "problem.html", label: "Solve a problem" },
  step: { image: "IMG/step.png", target: "step.html", label: "Step by step" },
};

const METHODOLOGY_ORDER = ["linguistic", "problem", "step"];

let pendingMethodology = null;
let pendingKey = null;

function showMethodologyPreview(key) {
  const info = METHODOLOGY_PREVIEWS[key];
  if (!info) return;

  pendingMethodology = info;
  pendingKey = key;

  const img = document.getElementById("methodology-preview-image");
  img.src = info.image;
  img.alt = "Mind map of the " + info.label + " methodology";
}

function openMethodologyPreview(event, key) {
  event.preventDefault();
  showMethodologyPreview(key);
  document.getElementById("methodology-preview").showModal();
}

// Lets the teacher browse the other two methodologies without closing
// the dialog, in case their first click wasn't the right one.
function navigateMethodologyPreview(direction) {
  const currentIndex = METHODOLOGY_ORDER.indexOf(pendingKey);
  if (currentIndex === -1) return;
  const nextIndex = (currentIndex + direction + METHODOLOGY_ORDER.length) % METHODOLOGY_ORDER.length;
  showMethodologyPreview(METHODOLOGY_ORDER[nextIndex]);
}

function closeMethodologyPreview() {
  const dialog = document.getElementById("methodology-preview");
  dialog.close();
}

function confirmMethodologyChoice() {
  if (!pendingMethodology) return;
  saveContextAndContinue();
  window.location.href = pendingMethodology.target;
}

document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("methodology-preview");
  if (!dialog) return;
  // Also clears the pending choice when closed via Escape (native <dialog> behavior).
  dialog.addEventListener("close", () => {
    pendingMethodology = null;
  });
});

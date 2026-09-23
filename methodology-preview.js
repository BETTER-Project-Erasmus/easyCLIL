// Shows a mind-map preview (image + confirm/cancel) when a teacher clicks
// one of the three methodology buttons on index.html, before entering the
// corresponding lesson-preparation page.

const METHODOLOGY_PREVIEWS = {
  linguistic: { image: "IMG/linguistic.png", target: "linguistic.html", label: "Linguistic approach" },
  problem: { image: "IMG/solve.png", target: "problem.html", label: "Solve a problem" },
  step: { image: "IMG/step.png", target: "step.html", label: "Step by step" },
};

let pendingMethodology = null;

function openMethodologyPreview(event, key) {
  event.preventDefault();
  const info = METHODOLOGY_PREVIEWS[key];
  if (!info) return;

  pendingMethodology = info;

  const dialog = document.getElementById("methodology-preview");
  const img = document.getElementById("methodology-preview-image");
  img.src = info.image;
  img.alt = "Mind map of the " + info.label + " methodology";

  dialog.showModal();
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

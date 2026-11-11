// Shows a mind-map preview (image + level gauge + confirm/cancel) when a
// teacher clicks one of the three methodology buttons on index.html, before
// entering the corresponding lesson-preparation page.

const METHODOLOGY_PREVIEWS = {
  linguistic: { image: "IMG/linguistic.png", target: "linguistic.html", label: "Linguistic approach", level: "Beginner", litDots: 2 },
  problem: { image: "IMG/solve.png", target: "problem.html", label: "Solve a problem", level: "Intermediate", litDots: 4 },
  step: { image: "IMG/step.png", target: "step.html", label: "Step by step", level: "Expert", litDots: 6 },
};

const METHODOLOGY_ORDER = ["linguistic", "problem", "step"];

// Level gauge: 6 dots, colour of each dot goes from #1063AA (dot 1) to #F7AC27 (dot 6).
const LEVEL_DOTS_TOTAL = 6;
const LEVEL_COLOR_START = [16, 99, 170];
const LEVEL_COLOR_END = [247, 172, 39];

let pendingMethodology = null;
let pendingKey = null;

function levelDotColor(index) {
  const t = index / (LEVEL_DOTS_TOTAL - 1);
  const channels = LEVEL_COLOR_START.map((start, i) =>
    Math.round(start + (LEVEL_COLOR_END[i] - start) * t)
  );
  return "rgb(" + channels.join(",") + ")";
}

function renderLevelGauge(level, litDots) {
  document.getElementById("methodology-level-text").textContent = "Level: " + level;

  const dotsContainer = document.getElementById("methodology-level-dots");
  dotsContainer.setAttribute("aria-label", "Level: " + level + ", " + litDots + " out of " + LEVEL_DOTS_TOTAL);
  dotsContainer.innerHTML = "";

  for (let i = 0; i < LEVEL_DOTS_TOTAL; i++) {
    const dot = document.createElement("span");
    dot.className = "level-dot";
    if (i < litDots) {
      dot.style.background = levelDotColor(i);
    } else {
      dot.classList.add("level-dot-off");
    }
    dotsContainer.appendChild(dot);
  }
}

function showMethodologyPreview(key) {
  const info = METHODOLOGY_PREVIEWS[key];
  if (!info) return;

  pendingMethodology = info;
  pendingKey = key;

  const img = document.getElementById("methodology-preview-image");
  img.src = info.image;
  img.alt = "Mind map of the " + info.label + " methodology";

  renderLevelGauge(info.level, info.litDots);
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
    pendingKey = null;
  });
});

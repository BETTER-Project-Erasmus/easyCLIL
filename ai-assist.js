// Single "Suggest with AI" button logic: validates required fields first
// (the teacher's own reflection), then asks the Worker to complete only
// the fields left empty, using the country/level context from index.html.

const AI_WORKER_URL = "https://easyclil-ai.betterprojecterasmus.workers.dev";

function getLessonContext() {
  try {
    return JSON.parse(sessionStorage.getItem("easyclil-context") || "{}");
  } catch (e) {
    return {};
  }
}

// A field counts only if it (and every ancestor) is actually visible —
// this matters on step.html, where hidden Lesson blocks (beyond the chosen
// number of sessions) must not block the AI button.
function isVisible(field) {
  return field.offsetParent !== null;
}

// Checks that every visible [required] field is filled.
// Highlights problems and returns false if anything is missing.
function validateRequiredFields() {
  let firstInvalid = null;
  let ok = true;

  document.querySelectorAll("[required]").forEach((field) => {
    field.classList.remove("field-invalid");
    if (!isVisible(field)) return;
    if (!field.value.trim()) {
      field.classList.add("field-invalid");
      ok = false;
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (!ok && firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid.focus();
  }

  return ok;
}

async function completeWithAI(button, methodology) {
  if (!FEATURES.aiSuggestions) {
    comingSoon();
    return;
  }

  if (!validateRequiredFields()) {
    alert("Please fill in the fields marked with * first — they're the core of your lesson plan and should come from you before the AI builds on them.");
    return;
  }

  const filledFields = {};
  const emptyFields = [];

  // Every field marked data-ai-label is a candidate for AI completion,
  // including link fields (data-ai-type="url") — the Worker only lets the
  // AI propose a link it actually found via web search, never an invented one.
  document.querySelectorAll("[data-ai-label]").forEach((field) => {
    if (!isVisible(field)) return;
    const label = field.dataset.aiLabel;
    const type = field.dataset.aiType || "text";
    if (field.value.trim()) {
      filledFields[field.id] = { label: label, value: field.value.trim() };
    } else {
      emptyFields.push({ id: field.id, label: label, type: type });
    }
  });

  if (emptyFields.length === 0) {
    alert("Every AI-completable field is already filled in — nothing left to suggest!");
    return;
  }

  const originalHTML = button.innerHTML;
  button.disabled = true;
  button.textContent = "Thinking...";

  try {
    const response = await fetch(AI_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        methodology: methodology,
        context: getLessonContext(),
        filledFields: filledFields,
        emptyFields: emptyFields,
      }),
    });

    if (!response.ok) throw new Error("Request failed with status " + response.status);

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    Object.entries(data.suggestions || {}).forEach(([id, text]) => {
      const field = document.getElementById(id);
      if (field && text) field.value = text;
    });

    if (data.sources && data.sources.length) {
      console.log("Sources used by the AI:", data.sources);
    }
  } catch (error) {
    alert("The AI completion could not be generated. Please try again in a moment.");
    console.error("AI completion error:", error);
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
}

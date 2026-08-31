// Carries the context selected on index.html (country, subject, topic, level)
// over to the methodology pages, via sessionStorage.

const CONTEXT_KEY = "easyclil-context";

// Called on index.html, right before navigating to a methodology page.
function saveContextAndContinue() {
  const context = {
    country: document.getElementById("country-select")?.value || "",
    subject: document.getElementById("subject-select")?.value || "",
    topic: document.getElementById("topic-input")?.value || "",
    level: document.getElementById("level-select")?.value || "",
  };
  sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  // Let the link's default navigation continue as normal.
}

// Called on the methodology pages to read back that context.
function getLessonContext() {
  try {
    return JSON.parse(sessionStorage.getItem(CONTEXT_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

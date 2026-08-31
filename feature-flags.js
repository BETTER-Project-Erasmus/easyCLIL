// Temporary switches while the app is still being built and tested.
// Flip a flag to true (and nothing else) once that feature is ready to go live.
const FEATURES = {
  aiSuggestions: false,
  docxExport: false,
  teachingTips: false,
};

function comingSoon() {
  alert("This function will be available very soon.");
}

function tipsLinkClick(event) {
  if (!FEATURES.teachingTips) {
    event.preventDefault();
    comingSoon();
  }
}

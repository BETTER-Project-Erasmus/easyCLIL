async function exportDocx() {
  if (!FEATURES.docxExport) {
    comingSoon();
    return;
  }


  const { Document, Packer, Paragraph, TextRun } = window.docx;

  // Récupération des données
  const textareas = document.querySelectorAll("textarea");

  let content = [];

  textareas.forEach((textarea, index) => {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: textarea.previousElementSibling.innerText + " :",
            bold: true
          })
        ]
      }),
      new Paragraph(textarea.value || " ")
    );
  });

  // Création du document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: content
      }
    ]
  });

  // Génération du fichier
  const blob = await Packer.toBlob(doc);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "CLILCraft.docx";
  link.click();
}
import { jsPDF } from "jspdf";

const MARGIN = 14;
const LINE_HEIGHT = 6;
const PAGE_WIDTH = 210;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = LINE_HEIGHT) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function addSectionTitle(doc, title, y) {
  if (y > 270) {
    doc.addPage();
    y = MARGIN;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(14, 116, 144);
  y = addWrappedText(doc, title, MARGIN, y, MAX_WIDTH, 7);
  doc.setDrawColor(236, 72, 153);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 95);
  return y;
}

function exportDefinitions(doc, definitions, y) {
  y = addSectionTitle(doc, "Definitions VPN", y);
  definitions.forEach((d, i) => {
    y = addWrappedText(doc, `${i + 1}. ${d.term} [${d.tag}]`, MARGIN, y, MAX_WIDTH);
    y = addWrappedText(doc, d.def, MARGIN + 4, y, MAX_WIDTH - 4);
    y += 3;
  });
  return y;
}

function exportScenarios(doc, scenarios, y) {
  y = addSectionTitle(doc, "Scenarios d'examen", y);
  scenarios.forEach((s) => {
    y = addWrappedText(doc, `S${s.id} - ${s.titre}`, MARGIN, y, MAX_WIDTH);
    y = addWrappedText(doc, `Contexte: ${s.contexte}`, MARGIN + 4, y, MAX_WIDTH - 4);
    y = addWrappedText(doc, `Question: ${s.question}`, MARGIN + 4, y, MAX_WIDTH - 4);
    y = addWrappedText(doc, "Corrige:", MARGIN + 4, y, MAX_WIDTH - 4);
    s.corrige.points.forEach((p, i) => {
      y = addWrappedText(doc, `  ${i + 1}. ${p}`, MARGIN + 4, y, MAX_WIDTH - 4);
    });
    y = addWrappedText(doc, `Piege: ${s.corrige.piege}`, MARGIN + 4, y, MAX_WIDTH - 4);
    y += 4;
  });
  return y;
}

function exportTopologies(doc, topologies, y) {
  y = addSectionTitle(doc, "Topologies reseau", y);
  topologies.forEach((t) => {
    y = addWrappedText(doc, t.titre, MARGIN, y, MAX_WIDTH);
    y = addWrappedText(doc, t.description, MARGIN + 4, y, MAX_WIDTH - 4);
    t.questions.forEach((q, i) => {
      y = addWrappedText(doc, `Q${i + 1}: ${q.q}`, MARGIN + 4, y, MAX_WIDTH - 4);
      y = addWrappedText(doc, `R: ${q.r}`, MARGIN + 8, y, MAX_WIDTH - 8);
    });
    y += 4;
  });
  return y;
}

function exportAstuces(doc, astuces, y) {
  y = addSectionTitle(doc, "Astuces exam", y);
  astuces.forEach((a) => {
    y = addWrappedText(doc, a.cat.replace(/[^\x00-\x7F]/g, ""), MARGIN, y, MAX_WIDTH);
    a.tips.forEach((tip) => {
      y = addWrappedText(doc, `- ${tip}`, MARGIN + 4, y, MAX_WIDTH - 4);
    });
    y += 3;
  });
  return y;
}

const TAB_LABELS = {
  definitions: "Definitions",
  scenarios: "Scenarios",
  topologies: "Topologies",
  astuces: "Astuces",
};

export function downloadPdf(data, scope, activeTab) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(236, 72, 153);
  doc.text("VPN & Reseaux Cisco - Revision Exam", MARGIN, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Genere le ${new Date().toLocaleDateString("fr-FR")}`, MARGIN, y);
  y += 10;

  if (scope === "all") {
    y = exportDefinitions(doc, data.definitions, y);
    y = exportScenarios(doc, data.scenarios, y);
    y = exportTopologies(doc, data.topologies, y);
    y = exportAstuces(doc, data.astuces, y);
  } else {
    const sections = {
      definitions: () => exportDefinitions(doc, data.definitions, y),
      scenarios: () => exportScenarios(doc, data.scenarios, y),
      topologies: () => exportTopologies(doc, data.topologies, y),
      astuces: () => exportAstuces(doc, data.astuces, y),
    };
    y = sections[activeTab]?.() ?? y;
  }

  const suffix = scope === "all" ? "complet" : TAB_LABELS[activeTab] ?? activeTab;
  doc.save(`vpn-revision-${suffix}.pdf`);
}

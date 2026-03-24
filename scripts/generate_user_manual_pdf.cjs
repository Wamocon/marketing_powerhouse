const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const inputPath = path.resolve(process.cwd(), 'public', 'Benutzerhandbuch_Momentum.md');
const outputPath = path.resolve(process.cwd(), 'public', 'Benutzerhandbuch_Momentum.pdf');

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, 'utf8');
const lines = markdown.split(/\r?\n/);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 52, bottom: 52, left: 52, right: 52 },
  info: {
    Title: 'Momentum Benutzerhandbuch',
    Author: 'Momentum Team',
    Subject: 'Benutzerhandbuch',
    Keywords: 'Momentum, Handbuch, Marketing, Workflow',
  },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function drawHeading(text, level) {
  const sizes = { 1: 22, 2: 16, 3: 13 };
  const spacingBefore = { 1: 8, 2: 12, 3: 8 };

  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(sizes[level] || 12).fillColor('#111827');
  doc.text(text, {
    width: pageWidth,
    align: 'left',
    paragraphGap: level === 1 ? 10 : 4,
    lineGap: 1,
  });
  doc.moveDown(spacingBefore[level] ? spacingBefore[level] / 24 : 0.2);
}

function drawParagraph(text) {
  doc.font('Helvetica').fontSize(11).fillColor('#1f2937');
  doc.text(text, {
    width: pageWidth,
    align: 'left',
    paragraphGap: 4,
    lineGap: 1.5,
  });
}

function drawBullet(text, indent = 14) {
  const startX = doc.x;
  const startY = doc.y;

  doc.font('Helvetica').fontSize(11).fillColor('#1f2937');
  doc.text('•', startX, startY, { continued: true });
  doc.text(` ${text}`, {
    width: pageWidth - indent,
    indent,
    paragraphGap: 2,
    lineGap: 1.5,
  });
}

function drawNumbered(text) {
  doc.font('Helvetica').fontSize(11).fillColor('#1f2937');
  doc.text(text, {
    width: pageWidth,
    indent: 8,
    paragraphGap: 2,
    lineGap: 1.5,
  });
}

let inCodeBlock = false;

for (const raw of lines) {
  const line = raw.replace(/\t/g, '    ');
  const trimmed = line.trim();

  if (trimmed.startsWith('```')) {
    inCodeBlock = !inCodeBlock;
    continue;
  }

  if (inCodeBlock) {
    doc.font('Courier').fontSize(9.5).fillColor('#374151');
    doc.text(line || ' ', {
      width: pageWidth,
      paragraphGap: 0,
      lineGap: 0.5,
    });
    continue;
  }

  if (trimmed === '') {
    doc.moveDown(0.35);
    continue;
  }

  if (trimmed.startsWith('# ')) {
    drawHeading(trimmed.replace(/^#\s+/, ''), 1);
    continue;
  }

  if (trimmed.startsWith('## ')) {
    drawHeading(trimmed.replace(/^##\s+/, ''), 2);
    continue;
  }

  if (trimmed.startsWith('### ')) {
    drawHeading(trimmed.replace(/^###\s+/, ''), 3);
    continue;
  }

  if (/^-\s+/.test(trimmed)) {
    drawBullet(trimmed.replace(/^-\s+/, ''));
    continue;
  }

  if (/^\d+\.\s+/.test(trimmed)) {
    drawNumbered(trimmed);
    continue;
  }

  drawParagraph(line);
}

const now = new Date();
doc.moveDown(1.2);
doc.font('Helvetica-Oblique').fontSize(9).fillColor('#6b7280');
doc.text(`Erzeugt am: ${now.toLocaleString('de-DE')}`, {
  align: 'right',
});

doc.end();

stream.on('finish', () => {
  console.log(`PDF created: ${outputPath}`);
});

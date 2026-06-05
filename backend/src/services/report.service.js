const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Case = require('../models/Case');
const Alert = require('../models/Alert');
const Report = require('../models/Report');

// Encrypt the PDF file using AES-256
const encryptReport = (filePath) => {
  const key = crypto.scryptSync(
    process.env.JWT_SECRET || 'defaultkey',
    'salt',
    32
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  const input = fs.readFileSync(filePath);
  const encrypted = Buffer.concat([
    iv,
    cipher.update(input),
    cipher.final(),
  ]);

  const encryptedPath = filePath + '.enc';
  fs.writeFileSync(encryptedPath, encrypted);

  return encryptedPath;
};

const generateReport = async (userId, caseId = null) => {
  const caseQuery = caseId ? { _id: caseId } : {};
  const [cases, alerts] = await Promise.all([
    Case.find(caseQuery).populate('createdBy', 'name').limit(20),
    Alert.find(caseId ? { caseId } : {}).limit(50).sort({ createdAt: -1 }),
  ]);

  const summary = {
    totalCases: cases.length,
    totalAlerts: alerts.length,
    criticalThreats: alerts.filter((a) => a.severity === 'critical').length,
    resolvedCases: cases.filter((c) => c.status === 'resolved').length,
  };

  const fileName = `report-${Date.now()}.pdf`;
  const reportsDir = path.join(process.cwd(), 'reports');
  const filePath = path.join(reportsDir, fileName);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const doc = new PDFDocument({
    margin: 50,
    bufferPages: false,
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ── Header ──────────────────────────────────────
  doc.fontSize(22).font('Helvetica-Bold')
    .text('CYBER FORENSICS INVESTIGATION REPORT', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica')
    .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.fontSize(10).font('Helvetica')
    .text('CONFIDENTIAL - AES-256 Encrypted', { align: 'center' });
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // ── Summary ─────────────────────────────────────
  doc.fontSize(14).font('Helvetica-Bold').text('EXECUTIVE SUMMARY');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Cases:      ${summary.totalCases}`);
  doc.text(`Total Alerts:     ${summary.totalAlerts}`);
  doc.text(`Critical Threats: ${summary.criticalThreats}`);
  doc.text(`Resolved Cases:   ${summary.resolvedCases}`);
  doc.moveDown();

  // ── Cases ────────────────────────────────────────
  if (cases.length > 0) {
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('CASES SUMMARY');
    doc.moveDown(0.5);

    cases.forEach((c, i) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .text(`${i + 1}. ${c.caseNumber || 'N/A'} - ${c.title}`);
      doc.font('Helvetica')
        .text(`   Status: ${c.status} | Priority: ${c.priority}`)
        .text(`   Attack Type: ${c.attackType || 'Unknown'}`)
        .text(`   Created: ${new Date(c.createdAt).toLocaleDateString()}`);
      doc.moveDown(0.5);
    });
  }

  // ── Alerts ───────────────────────────────────────
  if (alerts.length > 0) {
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('SECURITY ALERTS');
    doc.moveDown(0.5);

    alerts.slice(0, 20).forEach((a, i) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .fillColor(
          a.severity === 'critical' ? '#dc2626' :
          a.severity === 'high' ? '#ea580c' : '#000000'
        )
        .text(`${i + 1}. [${a.severity.toUpperCase()}] ${a.title}`);
      doc.fillColor('#000000').font('Helvetica')
        .text(`   Type: ${a.type} | Score: ${a.threatScore}/100`)
        .text(`   Source IP: ${a.sourceIP || 'Unknown'}`)
        .text(`   Time: ${new Date(a.createdAt).toLocaleString()}`);
      doc.moveDown(0.5);
    });
  }

  // ── No data message ──────────────────────────────
  if (cases.length === 0 && alerts.length === 0) {
    doc.moveDown();
    doc.fontSize(12).font('Helvetica')
      .fillColor('#666666')
      .text('No cases or alerts found in the system.', { align: 'center' });
  }

  // ── End document ─────────────────────────────────
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // ── Encrypt the PDF ──────────────────────────────
  const encryptedPath = encryptReport(filePath);

  // Delete original unencrypted PDF
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const report = await Report.create({
    title: caseId
      ? `Case Report - ${new Date().toLocaleDateString()}`
      : `Full System Report - ${new Date().toLocaleDateString()}`,
    caseId: caseId || null,
    generatedBy: userId,
    filePath: encryptedPath,
    fileSize: fs.statSync(encryptedPath).size,
    status: 'ready',
    summary,
    isEncrypted: true,
  });

  return report;
};

const getReports = async () => {
  return await Report.find()
    .populate('generatedBy', 'name email')
    .populate('caseId', 'caseNumber title')
    .sort({ createdAt: -1 });
};

module.exports = { generateReport, getReports };
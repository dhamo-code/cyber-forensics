const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Case = require('../models/Case');
const Alert = require('../models/Alert');
const Report = require('../models/Report');

const generateReport = async (userId, caseId = null) => {
  // Collect data
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

  // Create PDF
  const fileName = `report-${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'reports', fileName);

  // Make sure reports folder exists
  if (!fs.existsSync(path.join(process.cwd(), 'reports'))) {
    fs.mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });
  }

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(22).font('Helvetica-Bold')
    .text('CYBER FORENSICS INVESTIGATION REPORT', { align: 'center' });
  doc.fontSize(10).font('Helvetica')
    .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();

  // Divider
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Summary
  doc.fontSize(14).font('Helvetica-Bold').text('EXECUTIVE SUMMARY');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Cases: ${summary.totalCases}`);
  doc.text(`Total Alerts: ${summary.totalAlerts}`);
  doc.text(`Critical Threats: ${summary.criticalThreats}`);
  doc.text(`Resolved Cases: ${summary.resolvedCases}`);
  doc.moveDown();

  // Cases
  if (cases.length > 0) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('CASES SUMMARY');
    doc.moveDown(0.5);
    cases.forEach((c, i) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .text(`${i + 1}. ${c.caseNumber} - ${c.title}`);
      doc.font('Helvetica')
        .text(`   Status: ${c.status} | Priority: ${c.priority}`)
        .text(`   Attack Type: ${c.attackType || 'Unknown'}`)
        .text(`   Created: ${new Date(c.createdAt).toLocaleDateString()}`);
      doc.moveDown(0.5);
    });
  }

  // Alerts
  if (alerts.length > 0) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('SECURITY ALERTS');
    doc.moveDown(0.5);
    alerts.slice(0, 20).forEach((a, i) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .fillColor(a.severity === 'critical' ? '#dc2626' : a.severity === 'high' ? '#ea580c' : '#000000')
        .text(`${i + 1}. [${a.severity.toUpperCase()}] ${a.title}`);
      doc.fillColor('#000000').font('Helvetica')
        .text(`   Type: ${a.type} | Score: ${a.threatScore}/100`)
        .text(`   Source IP: ${a.sourceIP || 'Unknown'}`)
        .text(`   Time: ${new Date(a.createdAt).toLocaleString()}`);
      doc.moveDown(0.5);
    });
  }

  // Footer on every page
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#666666')
      .text(
        `CyberForensics AI System | CONFIDENTIAL | Page ${i + 1} of ${pageCount}`,
        50, doc.page.height - 40,
        { align: 'center', width: doc.page.width - 100 }
      );
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // Save report record
  const report = await Report.create({
    title: caseId ? `Case Report - ${new Date().toLocaleDateString()}` : `Full System Report - ${new Date().toLocaleDateString()}`,
    caseId: caseId || null,
    generatedBy: userId,
    filePath,
    fileSize: fs.statSync(filePath).size,
    status: 'ready',
    summary,
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
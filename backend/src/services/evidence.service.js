const Evidence = require('../models/Evidence');
const { hashFile } = require('../utils/crypto');
const fs = require('fs');

const uploadEvidence = async (file, data, userId) => {
  const sha256Hash = await hashFile(file.path);

  const evidence = await Evidence.create({
    title: data.title,
    description: data.description,
    type: data.type,
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    filePath: file.path,
    sha256Hash,
    caseId: data.caseId,
    uploadedBy: userId,
    chainOfCustody: [{ action: 'uploaded', performedBy: userId }],
  });

  return evidence;
};

const getEvidenceByCase = async (caseId) => {
  return await Evidence.find({ caseId })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};

const verifyEvidence = async (id) => {
  const evidence = await Evidence.findById(id);
  if (!evidence) throw new Error('Evidence not found');

  const { verifyIntegrity } = require('../utils/crypto');
  const result = await verifyIntegrity(evidence.filePath, evidence.sha256Hash);

  if (!result.isIntact) {
    await Evidence.findByIdAndUpdate(id, { isCompromised: true });
  }

  return result;
};

const deleteEvidence = async (id) => {
  const evidence = await Evidence.findById(id);
  if (!evidence) throw new Error('Evidence not found');

  if (fs.existsSync(evidence.filePath)) {
    fs.unlinkSync(evidence.filePath);
  }

  await Evidence.findByIdAndDelete(id);
};

module.exports = {
  uploadEvidence,
  getEvidenceByCase,
  verifyEvidence,
  deleteEvidence,
};
const Case = require('../models/Case');

const getCases = async (filters = {}, userId, role) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.attackType) query.attackType = filters.attackType;

  // Viewers only see their own cases
  if (role !== 'admin') query.createdBy = userId;

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [cases, total] = await Promise.all([
    Case.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Case.countDocuments(query),
  ]);

  return { cases, total, page, limit };
};

const getCaseById = async (id) => {
  return await Case.findById(id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
};

const createCase = async (data) => {
  const newCase = await Case.create(data);
  return newCase;
};

const updateCase = async (id, data) => {
  return await Case.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteCase = async (id) => {
  return await Case.findByIdAndDelete(id);
};

const getCaseStats = async () => {
  const [total, open, critical, resolved] = await Promise.all([
    Case.countDocuments(),
    Case.countDocuments({ status: 'open' }),
    Case.countDocuments({ priority: 'critical' }),
    Case.countDocuments({ status: 'resolved' }),
  ]);

  return { total, open, critical, resolved };
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCaseStats,
};
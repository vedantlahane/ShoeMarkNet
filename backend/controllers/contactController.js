const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');

const sanitizeAttachments = (attachments = []) => {
  if (!Array.isArray(attachments)) return [];
  return attachments.slice(0, 5).map((file) => ({
    name: file.name || 'attachment',
    size: Number(file.size) || 0,
    type: file.type || 'application/octet-stream',
    preview: file.preview,
    url: file.url
  }));
};

const formatContact = (contactDoc) => {
  if (!contactDoc) return null;
  const contact = contactDoc.toObject ? contactDoc.toObject({ virtuals: true }) : contactDoc;

  return {
    id: contact._id ? contact._id.toString() : contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    subject: contact.subject,
    message: contact.message,
    category: contact.category,
    priority: contact.priority,
    preferredContact: contact.preferredContact,
    orderNumber: contact.orderNumber,
    status: contact.status,
    assignedTo: contact.assignedTo,
    attachments: contact.attachments || [],
    responseHistory: contact.responseHistory || [],
    timeline: contact.timeline || [],
    confirmationNumber: contact.confirmationNumber,
    estimatedResponseTime: contact.estimatedResponseTime,
    metadata: contact.metadata || {},
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  };
};

const buildFilters = (query = {}) => {
  const filters = {};

  const sourceFilters = typeof query.filters === 'string' ? (() => {
    try {
      return JSON.parse(query.filters);
    } catch (error) {
      return {};
    }
  })() : query.filters || {};

  const status = query.status || sourceFilters.status;
  if (status && status !== 'all') {
    filters.status = status;
  }

  const category = query.category || sourceFilters.category;
  if (category && category !== 'all') {
    filters.category = category;
  }

  const priority = query.priority || sourceFilters.priority;
  if (priority && priority !== 'all') {
    filters.priority = priority;
  }

  const assignedTo = query.assignedTo || sourceFilters.assignedTo;
  if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
    filters.assignedTo = assignedTo;
  }

  if (query.dateFrom || sourceFilters.dateFrom || query.dateTo || sourceFilters.dateTo) {
    filters.createdAt = {};
    const dateFrom = query.dateFrom || sourceFilters.dateFrom;
    const dateTo = query.dateTo || sourceFilters.dateTo;

    if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filters.createdAt.$lte = new Date(dateTo);
  }

  return filters;
};

const submitContact = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    subject,
    message,
    category = 'general',
    priority = 'medium',
    preferredContact = 'email',
    orderNumber,
    attachments,
    source = 'contact_page',
    userAgent,
    referrer,
    timestamp,
    formVersion,
    tags
  } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      message: 'Name, email, subject, and message are required.'
    });
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone,
    subject: subject.trim(),
    message: message.trim(),
    category,
    priority,
    preferredContact,
    orderNumber,
    attachments: sanitizeAttachments(attachments),
    metadata: {
      source,
      userAgent,
      referrer,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      locale: req.headers['accept-language'],
      submittedAt: timestamp,
      formVersion,
      tags: Array.isArray(tags) ? tags : undefined
    }
  });

  res.status(201).json({
    id: contact.id,
    createdAt: contact.createdAt,
    estimatedResponseTime: contact.estimatedResponseTime,
    confirmationNumber: contact.confirmationNumber,
    status: contact.status
  });
});

const getContacts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  const filters = buildFilters(req.query);

  if (search) {
    const regex = new RegExp(search, 'i');
    filters.$or = [
      { name: regex },
      { email: regex },
      { subject: regex },
      { confirmationNumber: regex }
    ];
  }

  const [contacts, total] = await Promise.all([
    Contact.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Contact.countDocuments(filters)
  ]);

  const formatted = contacts.map(formatContact);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  res.json({
    data: formatted,
    total,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  });
});

const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id).lean({ virtuals: true });

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  res.json({
    data: formatContact(contact),
    history: contact.responseHistory || []
  });
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const { status, response, assignedTo, channel = 'internal' } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  const oldStatus = contact.status;
  contact.status = status;
  if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
    contact.assignedTo = assignedTo;
  }

  contact.timeline.push({
    label: 'Status updated',
    details: { from: oldStatus, to: status, updatedBy: req.user?.id },
    createdAt: new Date()
  });

  if (response) {
    contact.responseHistory.push({
      message: response,
      responder: req.user?._id,
      channel
    });
  }

  await contact.save();

  res.json({
    ...formatContact(contact),
    oldStatus
  });
});

const respondToContact = asyncHandler(async (req, res) => {
  const { message, channel = 'email', status } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Response message is required' });
  }

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  contact.responseHistory.push({
    message: message.trim(),
    responder: req.user?._id,
    channel
  });

  if (status) {
    const oldStatus = contact.status;
    contact.status = status;
    contact.timeline.push({
      label: 'Status updated',
      details: { from: oldStatus, to: status, updatedBy: req.user?.id },
      createdAt: new Date()
    });
  }

  contact.timeline.push({
    label: 'Response sent',
    details: { channel, responder: req.user?.id },
    createdAt: new Date()
  });

  await contact.save();

  res.json({
    message: 'Response recorded',
    contact: formatContact(contact)
  });
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  res.json({ message: 'Contact deleted successfully' });
});

const getContactStats = asyncHandler(async (_req, res) => {
  const contacts = await Contact.find({}, 'status priority responseHistory createdAt updatedAt').lean();
  const totalSubmissions = contacts.length;

  const statusCounts = contacts.reduce((acc, contact) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = contacts.reduce((acc, contact) => {
    acc[contact.priority] = (acc[contact.priority] || 0) + 1;
    return acc;
  }, {});

  let respondedCount = 0;
  let accumulatedResponseHours = 0;

  contacts.forEach((contact) => {
    if (Array.isArray(contact.responseHistory) && contact.responseHistory.length > 0) {
      respondedCount += 1;
      const firstResponse = contact.responseHistory[0].sentAt || contact.updatedAt;
      if (firstResponse) {
        const diffHours = (firstResponse.getTime() - contact.createdAt.getTime()) / (1000 * 60 * 60);
        if (!Number.isNaN(diffHours) && diffHours >= 0) {
          accumulatedResponseHours += diffHours;
        }
      }
    }
  });

  const averageResponseTime = respondedCount > 0
    ? Number((accumulatedResponseHours / respondedCount).toFixed(1))
    : null;

  const resolvedCount = statusCounts.resolved || 0;
  const closedCount = statusCounts.closed || 0;
  const responseRate = totalSubmissions > 0
    ? Math.round((respondedCount / totalSubmissions) * 100)
    : 0;

  res.json({
    totalSubmissions,
    responseRate,
    averageResponseTime,
    satisfactionScore: totalSubmissions > 0
      ? Math.round(((resolvedCount + closedCount) / totalSubmissions) * 100)
      : 0,
    statusBreakdown: statusCounts,
    priorityBreakdown: priorityCounts,
    respondedCount
  });
});

module.exports = {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
  respondToContact
};

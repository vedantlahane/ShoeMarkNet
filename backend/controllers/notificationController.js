const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { broadcastNotification } = require('../services/realtimeService');

const toBoolean = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

const getNotifications = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 20 } = req.query;
  const parsedLimit = Math.min(Number(limit) || 20, 100);
  const parsedPage = Math.max(Number(page) || 1, 1);

  const filter = {};
  const readStatus = status ? status.toLowerCase() : undefined;
  if (readStatus === 'read' || readStatus === 'unread') {
    filter.read = readStatus === 'read';
  }
  if (category) {
    filter.category = category;
  }
  if (priority) {
    filter.priority = priority;
  }

  const skip = (parsedPage - 1) * parsedLimit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Notification.countDocuments(filter)
  ]);

  const data = {
    notifications: notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      category: notification.category,
      priority: notification.priority,
      read: notification.read,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      actions: notification.actions || [],
      metadata: notification.metadata || {}
    }))
  };

  const meta = {
    pagination: {
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit) || 0,
      limit: parsedLimit
    },
    filters: {
      status: readStatus,
      category: category || null,
      priority: priority || null
    }
  };

  if (typeof res.success === 'function') {
    return res.success('Notifications retrieved successfully', data, meta);
  }

  return res.status(200).json({
    message: 'Notifications retrieved successfully',
    data,
    meta
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    if (req.user && req.user._id) {
      notification.readBy = req.user._id;
    }
    await notification.save();
  }

  if (typeof res.success === 'function') {
    return res.success('Notification marked as read', { id: notification._id, read: notification.read, readAt: notification.readAt }, {
      category: notification.category,
      priority: notification.priority
    });
  }

  return res.status(200).json({
    message: 'Notification marked as read',
    id: notification._id,
    read: notification.read,
    readAt: notification.readAt
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const { category, priority } = req.body || {};

  const filter = { read: false };
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const update = {
    read: true,
    readAt: new Date()
  };
  if (req.user && req.user._id) {
    update.readBy = req.user._id;
  }

  const { modifiedCount } = await Notification.updateMany(filter, { $set: update });

  if (typeof res.success === 'function') {
    return res.success('Notifications updated successfully', { updated: modifiedCount }, {
      category: category || null,
      priority: priority || null
    });
  }

  return res.status(200).json({ message: 'Notifications updated successfully', updated: modifiedCount });
});

const createNotification = asyncHandler(async (req, res) => {
  const { title, message, category, priority, actions, metadata, read } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required');
  }

  const notification = await Notification.create({
    title,
    message,
    category,
    priority,
    actions,
    metadata,
    read: toBoolean(read) || false,
    createdBy: req.user?._id
  });

  if (!notification.read) {
    broadcastNotification(notification.toObject());
  }

  if (typeof res.success === 'function') {
    return res.success('Notification created successfully', { id: notification._id }, {
      category: notification.category,
      priority: notification.priority
    }, 201);
  }

  return res.status(201).json({ message: 'Notification created successfully', id: notification._id });
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification
};

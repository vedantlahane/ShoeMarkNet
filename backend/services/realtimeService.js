const EventEmitter = require('events');
const Order = require('../models/Order');
const User = require('../models/User');

// Simple in-memory event bus for notifications and realtime metrics.
const notificationEmitter = new EventEmitter();
const statsEmitter = new EventEmitter();

const METRICS_INTERVAL_MS = Number(process.env.REALTIME_METRICS_INTERVAL || 15000);
let statsInterval = null;
let activeClientCount = 0;

const broadcastNotification = (notification) => {
  notificationEmitter.emit('notification', notification);
};

const computeRealtimeStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activeThreshold = new Date(now.getTime() - 15 * 60 * 1000);

  const [ordersToday, revenueAggregation, activeUsers, pendingOrders] = await Promise.all([
    Order.countDocuments({
      createdAt: { $gte: startOfDay },
      status: { $ne: 'cancelled' }
    }),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $project: {
          total: {
            $ifNull: ['$grandTotal', '$totalPrice']
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]),
    User.countDocuments({ lastLogin: { $gte: activeThreshold } }),
    Order.countDocuments({ status: { $in: ['pending', 'processing'] } })
  ]);

  const revenueToday = revenueAggregation[0]?.total || 0;

  return {
    timestamp: now.toISOString(),
    activeUsers,
    ordersToday,
    revenueToday,
    pendingOrders
  };
};

const emitRealtimeStats = (stats) => {
  statsEmitter.emit('stats', stats);
};

const startRealtimeLoop = () => {
  if (statsInterval) return;
  statsInterval = setInterval(async () => {
    try {
      const stats = await computeRealtimeStats();
      emitRealtimeStats(stats);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to compute realtime stats:', error);
      }
    }
  }, METRICS_INTERVAL_MS);
};

const stopRealtimeLoop = () => {
  if (!statsInterval) return;
  clearInterval(statsInterval);
  statsInterval = null;
};

const registerRealtimeClient = () => {
  activeClientCount += 1;
  if (activeClientCount === 1) {
    startRealtimeLoop();
  }
};

const unregisterRealtimeClient = () => {
  activeClientCount = Math.max(activeClientCount - 1, 0);
  if (activeClientCount === 0) {
    stopRealtimeLoop();
  }
};

const getNotificationEmitter = () => notificationEmitter;
const getStatsEmitter = () => statsEmitter;

module.exports = {
  broadcastNotification,
  computeRealtimeStats,
  emitRealtimeStats,
  getNotificationEmitter,
  getStatsEmitter,
  registerRealtimeClient,
  unregisterRealtimeClient,
  startRealtimeLoop,
  stopRealtimeLoop,
  METRICS_INTERVAL_MS
};

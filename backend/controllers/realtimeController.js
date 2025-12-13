const asyncHandler = require('express-async-handler');
const {
  computeRealtimeStats,
  getStatsEmitter,
  registerRealtimeClient,
  unregisterRealtimeClient
} = require('../services/realtimeService');

const streamRealtimeStats = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Encoding', 'identity');

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  registerRealtimeClient();

  const emitter = getStatsEmitter();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const listener = (stats) => {
    sendEvent(stats);
  };

  emitter.on('stats', listener);

  try {
    const initialStats = await computeRealtimeStats();
    sendEvent(initialStats);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to send initial realtime stats:', error);
    }
  }

  req.on('close', () => {
    emitter.off('stats', listener);
    unregisterRealtimeClient();
    res.end();
  });
});

const getRealtimeSnapshot = asyncHandler(async (req, res) => {
  const stats = await computeRealtimeStats();

  if (typeof res.success === 'function') {
    return res.success('Realtime snapshot retrieved successfully', { stats });
  }

  return res.status(200).json({
    message: 'Realtime snapshot retrieved successfully',
    stats
  });
});

module.exports = {
  streamRealtimeStats,
  getRealtimeSnapshot
};

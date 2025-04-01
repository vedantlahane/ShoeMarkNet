const cron = require('node-cron');
const User = require('../models/User');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');

// Define the cron job: Runs every day at 10 AM
cron.schedule('0 10 * * *', async () => {
  console.log('Running lead reminder cron job...');

  try {
    // Fetch users who have high lead scores but haven't placed an order
    const users = await User.find({ score: { $gte: 10 } });

    for (const user of users) {
      const hasOrdered = await Order.exists({ user: user._id });

      // If the user hasn't placed an order, send them a reminder
      if (!hasOrdered) {
        const subject = 'Still Thinking About Your Shoes?';
        const text = `Hey ${user.name}, we noticed you've been checking out some shoes! Don't miss out on your favorites.`;
        const html = `<h1>Hey ${user.name},</h1><p>We noticed you've been checking out some shoes! Don't miss out on your favorites. <a href="https://yourshop.com/cart">Complete your purchase now!</a></p>`;

        await sendEmail(user.email, subject, text, html);
        console.log(`Reminder email sent to ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Error in lead reminder cron job:', error);
  }
});

console.log('Lead reminder cron job scheduled.');

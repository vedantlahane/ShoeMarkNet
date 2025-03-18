// controllers/userInteractionController.js
const UserProductInteraction = require("../models/userProductInteraction");
const User = require("../models/user");

/**

    Update product-specific score when a user visits a product.

    Also update user's overall lead score.
    */
exports.recordProductVisit = async (req, res) => {
  try {
    const userId = req.userId; // Populated via JWT middleware
    const { shoeId } = req.body; // The ID of the shoe being visited
    const visitPoints = 3; // Points for each visit
    const globalVisitPoints = 1; // Points added to overall user score

    // Find interaction record for this product and user (upsert if not exists)
    let interaction = await UserProductInteraction.findOne({
      user: userId,
      shoe: shoeId,
    });

    if (interaction) {
      interaction.visits += 1;
    } else {
      interaction = new UserProductInteraction({
        user: userId,
        shoe: shoeId,
        visits: 1,
      });
    }

    // (Optional) Calculate the product-specific score.
    // For instance, simply multiplying visits by points:
    interaction.score = interaction.visits * visitPoints;
    interaction.lastUpdated = new Date();
    await interaction.save();

    // Update global user score with to the overall lead score (increment by, say, 1 point per product view)
    await User.findByIdAndUpdate(userId, {
      $inc: { score: globalVisitPoints },
    });

    res.json({ message: "Product visit recorded", interaction });
  } catch (err) {
    console.error("Error recording product visit:", err);
    res
      .status(500)
      .json({ message: "Error recording product visit", error: err });
  }
};

/**

    Record that the user has added a product to their cart, awarding a higher score.
    */
exports.recordAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { shoeId } = req.body;
    const addToCartPoints = 20;
    const globalCartPoints = 5; // Additional points to global user score

    // Upsert the interaction record with addToCart set to true
    let interaction = await UserProductInteraction.findOne({
      user: userId,
      shoe: shoeId,
    });
    if (interaction) {
      // Only update if not already marked as added to cart
      if (!interaction.addedToCart) {
        interaction.addedToCart = true;
        // Increment score or set it to a fixed high value for add-to-cart, or add addToCartPoints.
        interaction.score += addToCartPoints;
      }
    } else {
      interaction = new UserProductInteraction({
        user: userId,
        shoe: shoeId,
        visits: 0,
        clicks: 0,
        addedToCart: true,
        score: addToCartPoints,
      });
    }
    interaction.lastUpdated = new Date();
    await interaction.save();

    // Update the global user score as well
    await User.findByIdAndUpdate(userId, { $inc: { score: globalCartPoints } });

    res.json({ message: "Product added to cart recorded", interaction });
  } catch (err) {
    console.error("Error recording add-to-cart:", err);
    res
      .status(500)
      .json({ message: "Error recording add-to-cart", error: err });
  }
};

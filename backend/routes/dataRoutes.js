//// filepath: /home/vedant/Desktop/ShoeMarkNet/backend/routes/dataRoutes.js
const express = require("express");
const router = express.Router();
const Data = require("../models/data");

// GET endpoint to retrieve the seeded data document
router.get("/", async (req, res) => {
  try {
    const dataDoc = await Data.findOne({});
    res.json(dataDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
//// filepath: /home/vedant/Desktop/ShoeMarkNet/backend/routes/dataRoutes.js
const express = require("express");// Importing express
const router = express.Router();//express.Router is a class to create route handlers or endpoints. Which is provided by express.
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
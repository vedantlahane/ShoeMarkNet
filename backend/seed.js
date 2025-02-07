const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbConfig = require("./config/db"); // Your database connection function
const Data = require("./models/data");     // The data model you created
const dataToImport = require("./data/data"); // The Node-friendly data file

// Connect to the database
dbConfig();

const importData = async () => {
  try {
    // Remove any existing data (optional)
    await Data.deleteMany({});
    console.log("Existing data cleared");

    // Create a new document with your data
    const newData = new Data(dataToImport);
    await newData.save();

    console.log("Data imported successfully");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

importData();
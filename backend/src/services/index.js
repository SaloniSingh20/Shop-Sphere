const { searchAmazon } = require("./amazonService");
const { searchFlipkart } = require("./flipkartService");
const { searchNykaa } = require("./nykaaService");
const { searchMyntra } = require("./myntraService");

module.exports = {
  searchAmazon,
  searchFlipkart,
  searchNykaa,
  searchMyntra,
};

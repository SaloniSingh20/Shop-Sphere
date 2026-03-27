require("dotenv").config();

const { fetchAmazon } = require("./services/amazonService.cjs");
const { fetchFlipkart } = require("./services/flipkartService.cjs");

(async () => {
  const amazon = await fetchAmazon("iphone", { limit: 24, pages: 2 });
  const flipkart = await fetchFlipkart("iphone", { limit: 24, pages: 2 });

  console.log("Amazon fetched:", amazon.length);
  console.log("Flipkart fetched:", flipkart.length);
})();

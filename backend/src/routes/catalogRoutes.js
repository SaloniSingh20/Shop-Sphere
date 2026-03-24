const express = require("express");
const {
  getCategories,
  getCatalogProducts,
  syncCatalog,
  getCatalogProductByUrl,
} = require("../controllers/catalogController");

const router = express.Router();

router.get("/categories", getCategories);
router.get("/product", getCatalogProductByUrl);
router.get("/", getCatalogProducts);
router.post("/sync", syncCatalog);

module.exports = router;

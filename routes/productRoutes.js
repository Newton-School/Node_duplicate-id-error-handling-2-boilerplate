const express = require("express");

// Importing the controller functions.
const {getProductByID, createProduct, searchProducts
} = require("../controllers/productControllers");


const router = express.Router();

router.get("/", searchProducts);
router.get("/:id", getProductByID);
router.post("/", createProduct);

module.exports = router;
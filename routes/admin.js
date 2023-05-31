const express = require("express");
const path = require("path");
const { body } = require("express-validator");
const isAuth = require("../routes_protection/isAuth");

const adminController = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body(
      "title",
      "Please enter a title with only text and numbers and at least 3 characters."
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Please enter a float number.").isFloat(),
    body("description", "Please enter a description from 5 to 400 characters.")
      .trim()
      .isLength({ min: 5, max: 400 }),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body(
      "title",
      "Please enter a title with only text and numbers and at least 3 characters."
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Please enter a float number.").isFloat(),
    body("description", "Please enter a description from 5 to 400 characters.")
      .trim()
      .isLength({ min: 5, max: 400 }),
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;

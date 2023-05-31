const express = require("express");

const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");
const { Promise } = require("mongoose");

const router = express.Router();

//////////////////////////////////////////////////////////////
// Signup ////////////////////////////////////////////////////
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value, { req }) => {
      // check for existing email
      try {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject(
            "E-mail exists already, please pick a different one"
          );
        }
      } catch {
        throw new Error(
          "Servers are down for the moment, please try another time."
        );
      }
    }),
  body(
    "password",
    "Please enter a password with only numbers and text and at least 5 characters."
  )
    .trim()
    .isLength({ min: 5 })
    .isAlphanumeric(),

  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  authController.postSignup
);

//////////////////////////////////////////////////////////////
// Login ////////////////////////////////////////////////////
router.get("/login", authController.getLogin);
router.post(
  "/login",
  check("email").isEmail().withMessage("Please enter a valid email."),
  body("password", "Invalid Password!")
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  authController.postLogin
);

/////////////////////////////////////////////////////////////
// Logout////////////////////////////////////////////////////
router.post("/logout", authController.postLogout);

///////////////////////////////////////////////////////////////////////
// Reset Password ////////////////////////////////////////////////////
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;

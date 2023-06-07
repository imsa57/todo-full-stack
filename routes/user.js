const express = require("express");
const mongoose = require("mongoose");
const model = require("../model/userData");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "drhmgjg6k",
  api_key: "221631461525271",
  api_secret: "1WJpy2yvyNw72n1cXyHDcvvRfeU",
});

const routes = express.Router();

routes
  .post(
    "/createuser",
    body("email").isEmail().withMessage("Please enter a valid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password has min 6 charecter"),
    async (req, res) => {
      console.log(req.body);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.json({ errors: result.array() });
      }

      const isUserExist = await model.users.findOne({ email: req.body.email });

      if (isUserExist) {
        res.json("User already exist");
      } else {
        try {
          const file = req.files.userImage;
          const { url } = await cloudinary.uploader.upload(file.tempFilePath);

          const salt = await bcrypt.genSalt(10);
          const seccurePassword = await bcrypt.hash(req.body.password, salt);

          const newUser = await model.users({
            name: req.body.userName,
            email: req.body.email,
            password: seccurePassword,
            profileImage: url,
          });
          newUser.save();
          res.json({ success: true });
        } catch (error) {
          console.log(error);
          res.json({ error: error, success: false });
        }
      }
    }
  )

  .post("/login", async (req, res) => {
    const isValidUser = await model.users.findOne({ email: req.body.email });
    if (isValidUser) {
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        isValidUser.password
      );
      if (isPasswordMatch) {
        const userID = {
          id: isValidUser._id,
        };
        const authToken = jwt.sign(userID, "iamsarfrajansari");
        return res.json({
          success: true,
          authToken,
        });
      } else {
        return res.json("wrong password !");
      }
    } else {
      return res.json("Email is not registred !");
    }
  })

  .post("/saveTodo", async (req, res) => {
    const user = await model.users.findOne({ email: req.body.email });
    if (req.body.datas) {
      await model.users.findOneAndUpdate(
        { _id: user._id },
        { $set: { myTodo: [...req.body.datas] } }
      );
      res.json({ success: true });
    } else if (req.body.email && !req.body.datas) {
      res.json({
        success: true,
        todoData: user.myTodo,
        userImage: user.profileImage,
        userName: user.name,
      });
    }
  });

exports.routes = routes;

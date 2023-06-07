const express = require("express");
const { default: mongoose } = require("mongoose");
const userRouter = require("./routes/user");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
require("dotenv").config();

const server = express();

async function connectionDb() {
  return await mongoose.connect(process.env.DB_URL);
}
connectionDb()
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((error) => {
    console.log(error);
  });

server.use(
  fileUpload({
    useTempFiles: true,
  })
);
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cors());
server.use("/user", userRouter.routes);
server.use(express.static(path.resolve(__dirname, "build")));

server.listen(process.env.PORT || 8080, () => {
  console.log("SERVER STARTED");
});

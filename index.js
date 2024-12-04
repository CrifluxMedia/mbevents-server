require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const cloudinary = require("cloudinary").v2;
const fileupload = require("express-fileupload");
const userRouter = require("./routes/userRouter");
const eventRouter = require("./routes/eventRouter");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET, // Click 'View API Keys' above to copy your API secret
});

//setting up middlewares
app.use(fileupload({ useTempFiles: true }));
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Mb Events server" });
});
app.use("/api/v1", userRouter);
app.use("/api/v1/events", eventRouter);

//error route
app.use((req, res) => {
  res.status(401).json({ success: false, message: "ROUTE NOT FOUND" });
});

//data base connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: "mbevents" });
    app.listen(PORT, () => {
      console.log(`server running on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();

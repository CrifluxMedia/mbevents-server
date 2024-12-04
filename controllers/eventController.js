const EVENT = require("../models/events");
const USER = require("../models/user");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
// fs above means file system

const createEvent = async (req, res) => {
  const { userId } = req.user;
  const {
    date,
    title,
    startTime,
    endTime,
    location,
    description,
    tags,
    free,
    online,
    category,
  } = req.body;
  try {
    if (
      !date ||
      !startTime ||
      !endTime ||
      !description ||
      !tags ||
      !free ||
      !title ||
      !category ||
      (!location && !online)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // Image Upload which is accessed in req.files
    const imageFile = req.files.image.tempFilePath;
    // Upload the image to cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imageFile, {
      use_filename: true,
      folder: "mbevents",
    });
    // Delete the file from the server
    fs.unlinkSync(req.files.image.tempFilePath);
    // create a new event
    const newEvent = new EVENT({
      image: uploadedImage.secure_url,
      title,
      date,
      startTime,
      endTime,
      description,
      category,
      location: online === "true" ? "online" : location,
      tags : Array.isArray(tags) ? tags : tags.split(','),
      price: {
        free: free === "true",
        regular: free === "true" ? 0 : req.body?.regularPrice,
        vip: free === "true" ? 0 : req.body?.vipPrice,
      },
      hostedBy: userId,
    });
    const event = await newEvent.save();
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
};

//
const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    //finds events where the date is in the future or today
    const upcomingEvents = await EVENT.find({ date: { $gte: currentDate } })
      .sort("date") //sort by date in asceding order
      .limit(6) //limit the no of events to 4
      .populate("hostedBy", "fullName");
    res.status(200).json({ success: true, events: upcomingEvents });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//price :{free: true}
//free events happenign in the future
const getFreeEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const freeEvents = await EVENT.find({
      date: { $gte: currentDate },
      "price.free": true,
    })
      .sort("date")
      .limit(6)
      .populate("hostedBy", "fullName");
    res.status(200).json({ success: true, events: freeEvents });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSingleEvent = async (req, res)=>{
    res.send('get single event')
}

module.exports = { createEvent, getUpcomingEvents, getFreeEvents, getSingleEvent };

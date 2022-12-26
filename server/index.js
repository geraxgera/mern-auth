const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
mongoose.set("strictQuery", false);

//setup server
const app = express();
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

//connect to MongoDB

mongoose.connect(process.env.MDB_CONNECT, {}, (err) => {
  if (err) return console.log(err);
  console.log("connected to MongoDB");
});

//setup routes

app.use("/auth", require("./routers/userRouter"));
app.use("/customer", require("./routers/customerRouter"));

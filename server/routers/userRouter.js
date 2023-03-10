const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register

router.post("/", async (req, res) => {
  console.log(req.body);
  try {
    const { email, password, passwordVerify } = req.body;

    // validation

    if (!email || !password || !passwordVerify)
      return res.status(400).json({ errorMessage: "Fülle alle Felder aus!" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ errorMessage: "Password muss mindestens 6 Zeichen sein " });

    if (password.length > 150)
      return res
        .status(400)
        .json({ errorMessage: "Password darf maximal 150 Zeichen sein " });

    if (password !== passwordVerify)
      return res
        .status(400)
        .json({ errorMessage: "Password stimmt nicht miteinander " });

    const existinUser = await User.findOne({ email });
    if (existinUser)
      return res
        .status(400)
        .json({ errorMessage: "Dieses E-mail ist bereits regetriert!" });

    // Hash the password

    const passwordHash = await bcrypt.hash(password, 13);

    // save a new user account to the db

    const newUser = new User({
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();

    // sign the token

    const token = jwt.sign(
      {
        user: savedUser._id,
      },

      process.env.JWT_SECRET
    );

    //send the token in a HTTP-only cookie

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

// login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate

    if (!email || !password)
      return res.status(400).json({ errorMessage: "Fülle alle Felder aus!" });

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res
        .status(401)
        .json({ errorMessage: "email oder password ist falsch!" });

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect)
      return res
        .status(401)
        .json({ errorMessage: "email oder password ist falsch!" });

    // sign the token

    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    //send the token in a HTTP-only cookie

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);

    jwt.verify(token, process.env.JWT_SECRET);

    res.send(true);
  } catch (err) {
    res.json(false);
  }
});

module.exports = router;

const User = require("../../model/userModel")
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config(); 

let otp;
const otpGenerator = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};



exports.otpGet = (req, res) => {
  const email = req.session.detail?.email; // Use optional chaining to safely access the email property
  if (!email) {
    return res.render("login");
  }

  try {
    otp = otpGenerator();
    console.log(otp);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "OTP Verification",
      text: `The OTP for your verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {

      if (error) {
        console.error("Error occurred:", error);
        return res.render("login");
      } else {

        return res.render("OTP");
      }
    });
  } catch (error) {
        console.log(error)
  }
};



const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

exports.otpVerify = async (req, res) => {
  const { first, second, third, fourth } = req.body;
  let completeotp;
  completeotp = first + second + third + fourth;
  const data = req.session.detail;
  if (completeotp == otp) {
    try {
      const { name, email, phone, password, isBlocked } = data;
      const hashedPassword = await securePassword(password); 

      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword, 
        isBlocked,
      });

      const result = await newUser.save();

      delete req.session.detail;
      delete req.session.otp;

      return res.redirect("/login");
      // return res.status(200).end();
    } catch (error) {
      console.log(error);
      return res.render("OTP", { error: "Failed to Register" });
    }
  } else {
    return res.render("OTP", { error: "Invalid OTP!" });
    // return res.status(400).json({ error: "invalid OTP" });
  }
};
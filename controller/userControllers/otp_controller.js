const User = require("../../model/userModel")
const nodemailer = require("nodemailer");

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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "muhammedjazool47@gmail.com",
        pass: "ocorverhwsdaawwy",
      },
    });
    const mailOptions = {
      from: "muhammedjazool47@gmail.com",
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

  }
};

exports.otpVerify = async (req, res) => {
  const { first, second, third, fourth } = req.body;
  let completeotp;
  completeotp = first + second + third + fourth;
  const data = req.session.detail;
  if (completeotp == otp) {
    try {
      console.log(data);
      const { name, email, phone, password, isBlocked } = data;
      const newUser = new User({
        name,
        email,
        phone,
        password,
        isBlocked,
      });
      const result = await newUser.save();

      delete req.session.detail;
      delete req.session.otp;

      return res.redirect("/login");
      // return res.status(200).end();
    } catch (error) {
      return res.render("OTP", { error: "Failed to Register" })
      
    }
  } else {
    return res.render("OTP", { error: "Invalid OTP!" })
    // return res.status(400).json({ error: "invalid OTP" });
  }

};
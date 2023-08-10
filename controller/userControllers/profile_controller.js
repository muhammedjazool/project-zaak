const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Address = require("../../model/addressModel");
const Product = require("../../model/productModel");
const bcrypt = require("bcrypt");
const moment = require("moment");

exports.loadProfile = async (req, res) => {
  try {
    const categoryData = await Category.find({ isNotBlocked: true });
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const addressData = await Address.find({ userId: userId });
    const user = await User.findById(userId);
    const transactions = user.wallet.transactions.sort(
      (a, b) => b.date - a.date
    );

    const newTransactions = transactions.map((transactions) => {
      const formattedDate = moment(transactions.date).format("MMMM D, YYYY");
      return { ...transactions.toObject(), date: formattedDate };
    });

    if (userDetail) {
      res.render("profile", {
        title: "profile",
        userDetail,
        categoryData,
        addressData,
        newTransactions,
      });
    } else {
      res.render("profile", { title: "profile", categoryData });
    }
  } catch (error) {
    console.log(error);
  }
};

async function profileValidation(data) {
  const { name, phone, email, currentPassword, newPassword, confirmPassword } =
    data;
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const existingUser = await User.findOne({ email: email });

  if (!email) {
    errors.emailError = "Please Enter an Email";
  } else if (!emailRegex.test(email)) {
    errors.emailError = "Please provide a valid Email";
  }

  if (!name) {
    errors.nameError = "Please Enter a Name";
  }

  if (!phone) {
    errors.phoneError = "Please provide a Phone number";
  } else if (!phoneRegex.test(phone)) {
    errors.phoneError = "Invalid Phone Number";
  }

  if (
    currentPassword &&
    !(await bcrypt.compare(currentPassword, existingUser.password))
  ) {
    errors.currentPasswordError = "Incorrect Password!";
  }

  if (!email) {
    errors.emailError = "Please Enter an Email";
  } else if (!emailRegex.test(email)) {
    errors.emailError = "Please provide a valid Email";
  }

  if (!newPassword) {
    errors.newPasswordError = "Please provide a Password";
  } else if (!passwordRegex.test(newPassword)) {
    errors.newPasswordError =
      "Password must be 8 characters with one uppercase letter, one lowercase letter, and one number";
  }

  if (newPassword !== confirmPassword && newPassword.length > 0) {
    errors.confirmPasswordError = "The passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

exports.verifyProfile = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    };

    const user = await User.findOne({ email: data.email });

    const valid = await profileValidation(req.body);

    if (!valid.isValid) {
      return res.status(400).json({ error: valid.errors });
    }

    if (data.newPassword) {
      const hashedPassword = await securePassword(data.newPassword);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).end();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

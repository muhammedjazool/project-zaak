const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Address = require("../../model/addressModel");
const Product = require("../../model/productModel");
const cloudinary = require("../../config/cloudinary");

exports.homePage = async (req, res) => {
  try {
    const categoryData = await Category.find({ isNotBlocked: true });

    const userDetail = req.session.email;

    if (userDetail) {
      res.render("home", { userDetail, categoryData });
    } else {
      res.render("home", { categoryData });
    }
  } catch (error) {
    console.log(error);
    res.render("404");
  }
};

exports.logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

async function validation(data) {
  const { name, email, address, mobile, city, state, pincode } = data;
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const pincodeRegex = /^\d{6}$/;
  const cityRegex = /^[a-zA-Z]{2,50}$/;
  const stateRegex = /^[a-zA-Z]{2,50}$/;
  const addressRegex = /^[a-zA-Z0-9\s,.\-]{5,100}$/;

  if (!name) {
    errors.nameError = "please eneter the name";
  }

  if (!email) {
    errors.emailError = "please enter the email";
  } else if (!emailRegex.test(email)) {
    errors.emailRegex = "please provide valid email";
  }

  if (!mobile) {
    errors.phoneError = "Please provide a Phone number";
  } else if (!phoneRegex.test(mobile)) {
    errors.phoneError = "Invalid Phone Number";
  }

  if (!pincode) {
    errors.pincodeError = "Please provide a Pincode";
  } else if (!pincodeRegex.test(pincode)) {
    errors.pincodeError = "Invalid Pin number";
  }

  if (!cityRegex) {
    errors.cityError = "Please provide  your city name";
  } else if (!cityRegex.test(city)) {
    errors.cityError = "Error";
  }

  if (!address) {
    errors.addressError = "Please provide a Address";
  } else if (!addressRegex.test(address)) {
    errors.addressError = "Invalid Address";
  }

  if (!state) {
    errors.stateError = "Please provide your state name";
  } else if (!stateRegex.test(state)) {
    errors.stateError = "Invalid ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

exports.addNewAddress = async (req, res) => {
  try {
    const userDetail = req.session.email;

    const userId = userDetail._id;

    const { name, email, address, mobile, city, state, pincode } = req.body;
    const data = {
      userId,
      name,
      email,
      address,
      mobile,
      city,
      state,
      pincode,
      is_default: false,
    };

    const valid = await validation(req.body);

    if (valid.isValid) {
      const address = new Address(data);
      await address.save();
      return res.status(200).end();
    } else if (!valid.isValid) {
      return res.status(400).json({ error: valid.errors });
    }
  } catch (error) {
    res.status(500).send();
    console.log(error.message);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;

    const success = await Address.findByIdAndDelete(addressId);

    if (success) {
      res.status(200).send();
    } else {
      res.status(500).send();
    }
  } catch (error) {
    console.log(error.message);
  }
};

////////////////WISHLIST//////////////
exports.wishlistLoad = (req, res) => {
  res.render("wishlist");
};

const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");
const Address = require("../../model/addressModel");
const Coupon = require("../../model/couponModel");
const cloudinary = require("../../config/cloudinary");
const moment = require("moment");

exports.loadCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    const couponData = coupon.map((element) => {
      const formattedDate = moment(element.expiryDate).format("MMMM D, YYYY");

      return {
        ...element,
        expiryDate: formattedDate,
      };
    });

    res.render("coupons", { title: "Coupons", couponData });
  } catch (error) {
    console.log(error.messaage);
  }
};

exports.loadAddCoupon = async (req, res) => {
  try {
    res.render("addCoupon", { title: "Add Coupon", user: req.session.admin });
  } catch (error) {
    console.log(error.messaage);
  }
};

exports.addCoupon = async (req, res) => {
  try {
    const { couponCode, couponDiscount, couponDate, minDiscount, maxDiscount } =
      req.body;
    const couponCodeUpperCase = couponCode.toUpperCase();
    const couponExist = await Coupon.findOne({ code: couponCodeUpperCase });

    if (!couponExist) {
      const coupon = new Coupon({
        code: couponCodeUpperCase,
        discount: couponDiscount,
        expiryDate: couponDate,
        minDiscount: minDiscount,
        maxDiscount: maxDiscount,
      });

      await coupon.save();
      res.json({ message: "coupon addedd" });
    } else {
      res.json({ messaage: "coupon exists" });
    }
  } catch (error) {
    console.log(error.messaage);
  }
};

exports.blockCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    const unlistCoupon = await Coupon.findById(couponId);
    await Coupon.findByIdAndUpdate(
      couponId,
      { $set: { status: !unlistCoupon.status } },
      { new: true }
    );

    res.json({ message: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    await Coupon.findByIdAndDelete(couponId);

    res.json({ message: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

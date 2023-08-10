const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Address = require("../../model/addressModel");
const Coupon = require("../../model/couponModel");
const cloudinary = require("../../config/cloudinary");
const { Query } = require("mongoose");

exports.loadCart = async (req, res) => {
  try {
    req.session.checkout = true;
    const userDetail = req.session.email;
    const userId = userDetail._id; // Assuming the user's ID is stored in req.session.user._id

    const categoryData = await Category.find({ isNotBlocked: true });

    const user = await User.findOne({ _id: userId })
      .populate("cart.product")
      .lean();

    const cart = user.cart;
    const cartLength = user.cart.length;

    let subTotal = 0;

    cart.forEach((val) => {
      val.total = val.product.price * val.quantity;
      subTotal += val.total;
    });

    if (cart.length === 0) {
      res.render("cart", {
        title: "cart",
        userDetail,
        categoryData,
        cart: [],
        subTotal: 0,
        isEmpty: true,
      });
    } else {
      res.render("cart", {
        title: "Cart",
        userDetail,
        categoryData,
        cart,
        subTotal,
        isEmpty: false,
      });
    }
  } catch (error) {
    console.log(error);
    const userDetail = req.session.email;
    const categoryData = await Category.find({ isNotBlocked: true });
    res.render("404", { userDetail, categoryData });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const { size, quantity } = req.body;
    const productId = req.body.productId.trim();

    const product = await Product.findById(productId);

    const smallStock = product.stock[0].small;
    const mediumStock = product.stock[0].medium;
    const largeStock = product.stock[0].large;
    const xlargeStock = product.stock[0].xlarge;

    const existed = await User.findOne({
      _id: userId,
      "cart.product": productId,
    });

    let status = false;

    if (size === "s" && quantity > smallStock) {
      status = true;
    }
    if (size === "m" && quantity > mediumStock) {
      status = true;
    }
    if (size === "l" && quantity > largeStock) {
      status = true;
    }
    if (size === "xl" && quantity > xlargeStock) {
      status = true;
    }

    if (status) {
      return res.status(400).json({ message: "Out of stock" });
    }

    if (existed) {
      await User.findOneAndUpdate(
        { _id: userId, "cart.product": productId },
        { $inc: { "cart.$.quantity": quantity ? quantity : 1 } },
        { new: true }
      );
      res.status(200).json({ message: "item already in cart" });
    } else {
      await Product.findOneAndUpdate({ _id: productId }, { isOnCart: true });
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: {
              product: product._id,
              quantity: quantity ? quantity : 1,
            },
          },
        },
        { new: true }
      );

      res.status(200).json({ message: "item added to cart" });
    }
  } catch (error) {
    console.log(error);
    const userDetail = req.session.email;
    res.render("404", { userDetail });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const userData = req.session.email;

    const data = await User.find(
      { _id: userData._id },
      { _id: 0, cart: 1 }
    ).lean();

    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });

    await User.updateOne(
      { _id: userData._id },
      { $set: { cart: data[0].cart } }
    );
    res.status(200).send();
  } catch (error) {
    console.log(error.message);
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const productId = req.query.productId;
    const cartId = req.query.cartId;
    const newP = await Product.findById(productId);
    await Product.findOneAndUpdate(
      { _id: productId },
      { $set: { isOnCart: false } },
      { new: true }
    );

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { cart: { product: productId } } },
      { new: true }
    );

    res.status(200).send();
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadCheckOut = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const categoryData = await Category.find({ isNotBlocked: true });
    const addressData = await Address.find({ userId: userId });

    const userCart = await User.findOne({ _id: userId })
      .populate("cart.product")
      .lean();

    const cart = userCart.cart;

    let subTotal = 0;

    cart.forEach((element) => {
      element.total = element.product.price * element.quantity;
      subTotal += element.total;
    });

    const now = new Date();

    const availableCoupons = await Coupon.find({
      expiryDate: { $gte: now },
      usedBy: { $nin: [userId] },
      status: true,
    });

    res.render("checkout", {
      title: "Checkout",
      categoryData,
      userDetail,
      addressData,
      subTotal,
      cart,
      availableCoupons,
    });
  } catch (error) {}
};

exports.validateCoupon = async (req, res) => {
  try {
    const { coupon, subTotal } = req.body;
    const couponData = await Coupon.findOne({ code: coupon });

    if (!couponData) {
      res.json("invalid");
    } else if (couponData.expiryDate < new Date()) {
      res.json("expired");
    } else {
      const couponId = couponData._id;
      const discount = couponData.discount;
      const minDiscount = couponData.minDiscount;
      const maxDiscount = couponData.maxDiscount;
      const userId = req.session.email._id;

      const couponUsed = await Coupon.findOne({
        _id: couponId,
        usedBy: { $in: [userId] },
      });

      if (couponUsed) {
        res.json("already used");
      } else {
        let discountAmount;
        let maximum;

        const discountValue = Number(discount);
        const couponDiscount = (subTotal * discountValue) / 100;

        if (couponDiscount < minDiscount) {
          res.json("minimum value not met");
        } else {
          if (couponDiscount > maxDiscount) {
            discountAmount = maxDiscount;
            maximum = "maximum";
          } else {
            discountAmount = couponDiscount;
          }

          const newTotal = subTotal - discountAmount;
          const couponName = coupon;

          res.json({
            couponName,
            discountAmount,
            newTotal,
            maximum,
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

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
    const productData = await Product.find()


    const user = await User.findOne({ _id: userId })
      .populate("cart.product")
      .lean();

    const cart = user.cart.map(cartItem => {
      const product = cartItem.product;
      const stockForSize = product.stock;


      return {
        ...cartItem,
        stockForSize,
        selectedSize: cartItem.size,
      };
    });


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

    const userData = await User.findById(userId).populate("cart.product").lean();
    const product = await Product.findById(productId);

    if (!size) {
      return res.status(400).json({ error: "Size is required" });
    } else {
      const cartProduct = userData.cart.find(
        (item) => item.product._id.toString() === productId && item.size === size
      );

      const sizeMapping = {
        's': 'small',
        'm': 'medium',
        'l': 'large',
        'xl': 'xlarge'
      };

      const sizes = product.stock[0][sizeMapping[size]];
      const totalQuantityInCart = cartProduct
        ? Number(cartProduct.quantity) + Number(quantity)
        : Number(quantity);

      if (totalQuantityInCart > sizes) {
        return res.status(200).json({ message: "Quantity exceeds available stock" });
      }

      if (cartProduct) {
        await User.updateOne(
          { _id: userId, "cart.product": productId, "cart.size": size },
          { $inc: { "cart.$.quantity": quantity ? quantity : 1 } }
        );

        res.status(200).json({ message: "Item quantity updated in cart" });
      } else {
        await Product.findOneAndUpdate({ _id: productId }, { isOnCart: true });
        await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              cart: {
                product: product._id,
                size: size,
                quantity: quantity ? quantity : 1,
              },
            },
          }
        );

        res.status(200).json({ message: "Item added to cart" });
      }
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

exports.getStock = async (req, res) => {
  try {

    const productId = req.query.productId;

    const selectedSize = req.query.size;



    const product = await Product.findById(productId);


    const stockMapping = {
      's': 'small',
      'm': 'medium',
      'l': 'large',
      'xl': 'xlarge'
    };

    const selectedStock = product.stock[0][stockMapping[selectedSize]];

    res.status(200).json({ stock: selectedStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.removeFromCart = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const productId = req.query.productId;
    const size = req.query.size
    const cartId = req.query.cartId;

    const newP = await Product.findById(productId);
    await Product.findOneAndUpdate(
      { _id: productId },
      { $set: { isOnCart: false } },
      { new: true }
    );

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { cart: { product: productId, size: size } } },
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
  } catch (error) { }
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

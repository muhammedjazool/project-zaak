const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Address = require("../../model/addressModel");
const Order = require("../../model/orderModel");
const Coupon = require("../../model/couponModel");
const cloudinary = require("../../config/cloudinary");
const moment = require("moment");
const { Query } = require("mongoose");
const Razorpay = require("razorpay");

exports.placeOrder = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const addressId = req.body.selectedAddress;
    const amount = req.body.amount;
    const paymentMethod = req.body.selectedPayment;
    const couponData = req.body.couponData;

    const user = await User.findOne({ _id: userId }).populate("cart.product");

    const userCart = user.cart;

    let subTotal = 0;
    let size;
    userCart.forEach((item) => {
      item.total = item.product.price * item.quantity;
      subTotal += item.total;
      size = item.size;
    });

    let productData = userCart.map((item) => {
      return {
        id: item.product._id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl[0].url,
        size: size,
      };
    });

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;

    let saveOrder = async () => {
      const ExpectedDeliveryDate = new Date();
      ExpectedDeliveryDate.setDate(ExpectedDeliveryDate.getDate() + 3);

      if (couponData) {
        const order = new Order({
          userId: userId,
          product: productData,
          address: addressId,
          orderId: orderId,
          total: subTotal,
          ExpectedDeliveryDate: ExpectedDeliveryDate,
          paymentMethod: paymentMethod,
          discountAmount: couponData.discountAmount,
          amountAfterDiscount: couponData.newTotal,
          couponName: couponData.couponName,
          isNotBlocked: true,
        });

        await order.save();
        const couponCode = couponData.couponName;
        await Coupon.updateOne(
          { code: couponCode },
          { $push: { usedBy: userId } }
        );
      } else {
        const order = new Order({
          userId: userId,
          product: productData,
          orderId: orderId,
          address: addressId,
          ExpectedDeliveryDate: ExpectedDeliveryDate,
          total: subTotal,
          paymentMethod: paymentMethod,
        });
        await order.save();
      }

      let userDetails = await User.findById(userId);

      let userCartDetails = userDetails.cart;

      userCartDetails.forEach(async (item) => {
        const productId = item.product._id;

        const quantity = item.quantity;

        const size = item.size;

        const product = await Product.findById(productId);

        const stock = product.stock;

        const sizeId = product.stock[0]._id;

        let stockIndex = product.stock.findIndex((stockItem) =>
          stockItem._id.equals(sizeId)
        );

        if (stockIndex !== -1) {
          if (size === "s") {
            product.stock[stockIndex].small -= quantity;
          } else if (size === "m") {
            product.stock[stockIndex].medium -= quantity;
          } else if (size === "l") {
            product.stock[stockIndex].large -= quantity;
          } else if (size === "xl") {
            product.stock[stockIndex].xlarge -= quantity;
          }
        }

        await product.save();
      });

      userDetails.cart = [];
      await userDetails.save();
    };

    if (addressId) {
      if (paymentMethod === "Cash On Delivery") {
        saveOrder();
        req.session.checkout = false;

        res.json({
          order: "Success",
        });
      } else if (paymentMethod === "Razorpay") {
        var instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await instance.orders.create({
          amount: amount * 100,
          currency: "INR",
          receipt: "ZAAK",
        });

        saveOrder();
        req.session.checkout = false;

        res.json({
          order: "Success",
        });
      } else if (paymentMethod === "Wallet") {
        try {
          const walletBalance = req.body.walletBalance;

          await User.findByIdAndUpdate(
            userId,
            { $set: { "wallet.balance": walletBalance } },
            { new: true }
          );

          const transaction = {
            date: new Date(),
            details: `Confirmed Order - ${orderId}`,
            amount: subTotal,
            status: "Debit",
          };

          await User.findByIdAndUpdate(
            userId,
            { $push: { "wallet.transactions": transaction } },
            { new: true }
          );

          saveOrder();
          req.session.checkout = false;

          res.json({
            order: "Success",
          });
        } catch (error) {
          console.log(error.message);
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.orderSuccess = async (req, res) => {
  try {
    const categoryData = await Category.find({ isNotBlocked: true });
    const userDetail = req.session.email;

    res.render("orderSuccess", {
      title: "Order Success",
      categoryData,
      userDetail,
    });
  } catch (error) {}
};

exports.myOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const ordersPerPage = 6;
    const skip = (page - 1) * ordersPerPage;

    const userDetail = req.session.email;

    const userId = userDetail._id;

    const categoryData = await Category.find({ isNotBlocked: true });

    const orders = await Order.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(ordersPerPage);

    const totalCount = await Order.countDocuments({ userId });
    const totalPages = Math.ceil(totalCount / ordersPerPage);

    const formattedOrders = orders.map((order) => {
      const formattedDate = moment(order.date).format("MMMM D, YYYY");
      return { ...order.toObject(), date: formattedDate };
    });

    res.render("viewOrder", {
      title: "View Order",
      categoryData,
      userDetail,
      myOrders: formattedOrders || [],
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.orderDetails = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;
    const orderId = req.query.orderId;

    const categoryData = await Category.find({ isNotBlocked: true });

    const orderDetails = await Order.findById(orderId).populate({
      path: "product",
      populate: [{ path: "category", model: "category" }],
    });

    const orderProductData = orderDetails.product;
    const addressId = orderDetails.address;

    const address = await Address.findById(addressId);
    const ExpectedDeliveryDate = moment(
      orderDetails.ExpectedDeliveryDate
    ).format("MMMM D, YYYY");
    const deliveryDate = moment(orderDetails.deliveredDate).format(
      "MMMM D, YYYY"
    );
    const returnEndDate = moment(orderDetails.returnEndDate).format(
      "MMMM D, YYYY"
    );
    const currentDate = new Date();

    res.render("orderDetails", {
      title: "Order Details",
      userDetail,
      categoryData,
      orderDetails,
      orderProductData,
      address,
      currentDate,
      orderProductData,
      ExpectedDeliveryDate,
      deliveryDate,
      returnEndDate,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.filterOrder = async (req, res) => {
  try {
    const status = req.query.status;

    const userDetail = req.session.email;
    const userId = userDetail._id;

    const orders = await Order.find({ userId, status: status }).sort({
      date: -1,
    });

    const formattedOrders = orders.map((order) => {
      const formattedDate = moment(order.date).format("MMMM D YYYY");
      return { ...order.toObject(), date: formattedDate };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const userDetail = req.session.email;
    const userId = userDetail._id;

    const orderId = req.query.orderId;

    const status = req.body.orderStatus;

    const paymentMethod = req.body.paymentMethod;

    const updatedBalance = req.body.wallet;
    const total = req.body.total;
    const order = await Order.findOne({ _id: orderId });
    const orderIdValue = order.orderId;

    if (paymentMethod != "Cash On Delivery") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { "wallet.balance": updatedBalance } },
        { new: true }
      );

      if (status === "Returned" || status === "Cancelled") {
        await Order.findByIdAndUpdate(orderId, {
          $set: { status: status },
          $unset: { ExpectedDeliveryDate: "" },
        });

        for (const productInfo of order.product) {
          const sizeMapping = {
            s: "small",
            m: "medium",
            l: "large",
            xl: "xlarge",
          };

          const productId = productInfo.id;

          const productSize = productInfo.size;

          const backendSize = sizeMapping[productSize];

          const product = await Product.findById(productId);

          if (product) {
            const stockToUpdate = backendSize;

            const quantityReturnedOrCancelled = productInfo.quantity;

            const updateObject = {
              [`stock.0.${backendSize}`]: quantityReturnedOrCancelled,
            };

            await Product.findByIdAndUpdate(productId, { $inc: updateObject });
          }
        }
        const transaction = {
          date: new Date(),
          details: `${
            status === "Returned" ? "Returned" : "Cancelled"
          } Order - ${orderIdValue}`,
          amount: total,
          status: "Credit",
        };

        await User.findByIdAndUpdate(
          userId,
          { $push: { "wallet.transactions": transaction } },
          { new: true }
        );

        res.json({
          message: status === "Returned" ? "Returned" : "Cancelled",
          refund: status === "Returned" ? "Refund" : "No Refund",
        });
      }
    } else if (paymentMethod == "Cash On Delivery" && status === "Returned") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { "wallet.balance": updatedBalance } },
        { new: true }
      );

      for (const productInfo of order.product) {
        const sizeMapping = {
          s: "small",
          m: "medium",
          l: "large",
          xl: "xlarge",
        };

        const productId = productInfo.id;

        const productSize = productInfo.size;

        const backendSize = sizeMapping[productSize];

        const product = await Product.findById(productId);

        if (product) {
          const stockToUpdate = backendSize;

          const quantityReturnedOrCancelled = productInfo.quantity;

          const updateObject = {
            [`stock.0.${backendSize}`]: quantityReturnedOrCancelled,
          };

          await Product.findByIdAndUpdate(productId, { $inc: updateObject });
        }
      }
      const transaction = {
        date: new Date(),
        details: `Returned Order - ${orderIdValue}`,
        amount: total,
        status: "Credit",
      };

      await User.findByIdAndUpdate(
        userId,
        { $push: { "wallet.transactions": transaction } },
        { new: true }
      );

      await Order.findByIdAndUpdate(orderId, {
        $set: { status: status },
        $unset: { ExpectedDeliveryDate: "" },
      });
      res.json({
        message: "Returned",
        refund: "Refund",
      });
    } else if (paymentMethod == "Cash On Delivery" && status === "Cancelled") {
      await Order.findByIdAndUpdate(orderId, {
        $set: { status: status },
        $unset: { ExpectedDeliveryDate: "" },
      });

      for (const productInfo of order.product) {
        const sizeMapping = {
          s: "small",
          m: "medium",
          l: "large",
          xl: "xlarge",
        };

        const productId = productInfo.id;

        const productSize = productInfo.size;

        const backendSize = sizeMapping[productSize];

        const product = await Product.findById(productId);

        if (product) {
          const stockToUpdate = backendSize;

          const quantityReturnedOrCancelled = productInfo.quantity;

          const updateObject = {
            [`stock.0.${backendSize}`]: quantityReturnedOrCancelled,
          };

          await Product.findByIdAndUpdate(productId, { $inc: updateObject });
        }
      }
      res.json({
        message: "Cancelled",
        refund: "No Refund",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};




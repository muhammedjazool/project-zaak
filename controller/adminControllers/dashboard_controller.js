
const User = require("../../model/userModel")
const Category = require("../../model/categoryModel")
const Product = require("../../model/productModel")
const moment = require("moment");
const Sale = require("../../model/orderModel");

let months = [];
let ordersByMonth = [];
let revenueByMonth = [];
let totalRevenue = 0;
let totalSales = 0;
let categorySalesData = []; // Define categorySalesData at a higher scope
let paymentMethodSalesData = []; // Define paymentMethodSalesData at a higher scope
////////////////////DASHBOARD/////////////////////////////

exports.loadDashboard = async (req, res) => {
    try {
        const sales = await Sale.find({}).populate("product.id");


        const salesByMonth = {};
        const categorySales = {};
        const paymentMethodSales = {};

        
        for (const sale of sales) {
            const monthYear = moment(sale.date).format("MMMM YYYY");
            if (!salesByMonth[monthYear]) {
                salesByMonth[monthYear] = {
                    totalOrders: 0,
                    totalRevenue: 0,
                };
            }
            salesByMonth[monthYear].totalOrders += 1;
            salesByMonth[monthYear].totalRevenue += sale.total;
           
           for (const product of sale.product) {
                const categoryId = product.category.toString();
                const category=await Category.findById(categoryId)
                const categoryName=category.category
                 // Assuming 'category' field holds the category ID
                if (!categorySales[categoryId]) {
                    categorySales[categoryId] = {
                        category: categoryName, // Assuming 'category' field holds the category name
                        totalSales: 0,
                    };
                }
                categorySales[categoryId].totalSales += product.quantity;
               
            }
            const paymentMethod = sale.paymentMethod;
            if (!paymentMethodSales[paymentMethod]) {
                paymentMethodSales[paymentMethod] = {
                    totalSales: 0,
                };
            }
            paymentMethodSales[paymentMethod].totalSales += 1;
            paymentMethodSalesData = paymentMethodSales
        }

        

        const chartData = [];
        categorySalesData = [];

        Object.keys(salesByMonth).forEach((monthYear) => {
            const { totalOrders, totalRevenue } = salesByMonth[monthYear];
            chartData.push({
                month: monthYear.split(" ")[0],
                totalOrders: totalOrders || 0,
                totalRevenue: totalRevenue || 0,
            });
        });


        Object.keys(categorySales).forEach((categoryId) => {
            categorySalesData.push({
                category: categorySales[categoryId].category,
                totalSales: categorySales[categoryId].totalSales,
            });
        });

        months = [];
        ordersByMonth = [];
        revenueByMonth = [];
        totalRevenue = 0;
        totalSales = 0;

        chartData.forEach((data) => {
            months.push(data.month);
            ordersByMonth.push(data.totalOrders);
            revenueByMonth.push(data.totalRevenue);
            totalRevenue += Number(data.totalRevenue);
            totalSales += Number(data.totalOrders);
        });

        const thisMonthOrder = ordersByMonth[ordersByMonth.length - 1];
        const thisMonthSales = revenueByMonth[revenueByMonth.length - 1];

        res.render("dashboard", {
            title: "Dashboard",
            user: req.session.admin,
            revenueByMonth,
            months,
            ordersByMonth,
            totalRevenue,
            totalSales,
            thisMonthOrder,
            thisMonthSales,
            categorySalesData,
            paymentMethodSalesData: paymentMethodSales,
        });
    } catch (error) {
        console.log(error.message);
    }
};

exports.chartData = async (req, res) => {
    try {
        res.json({
            months: months,
            revenueByMonth: revenueByMonth,
            ordersByMonth: ordersByMonth,
            categorySalesData: categorySalesData, 
            paymentMethodSalesData: paymentMethodSalesData, 
        });
    } catch (error) {
        console.log(error.message);
    }
};





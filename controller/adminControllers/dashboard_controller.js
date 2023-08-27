
const User = require("../../model/userModel")
const Category = require("../../model/categoryModel")
const Product = require("../../model/productModel")
const moment = require("moment");
const Sale = require("../../model/orderModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const ejs=require("ejs")

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
                 
                if (!categorySales[categoryId]) {
                    categorySales[categoryId] = {
                        category: categoryName, 
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

// exports.generateSalesReport=async(req,res)=>{
//   try {
//     console.log(139,"salesreport");
//     const startDate = new Date(req.query.startDate);
//     const endDate = new Date(req.query.endDate);
//    console.log(142,"salesreport startdate",startDate,"endate",endDate);
//     // Fetch sales data from the database based on the date range
//     const salesData = await Sale.find({
//         date: { $gte: startDate, $lte: endDate },
//         status: "Delivered",
//     }).sort({ date: "desc" });
// console.log(147,"salesreport",salesData);
//     // Create a PDF document
//     const doc = new PDFDocument();
    
//     const pdfFilePath = path.join(__dirname, "sales-report.pdf");
//     console.log(152,"hallo",pdfFilePath);
//     const stream = fs.createWriteStream(pdfFilePath);
  
//     doc.pipe(stream);

//     // Build the PDF content
//     doc.fontSize(18).text("Sales Report", { align: "center" });
//     doc.text(`Date Range: ${startDate.toDateString()} - ${endDate.toDateString()}`);

//     // Loop through sales data and add to the PDF
//     salesData.forEach((order) => {
//         doc.fontSize(12).text(`Order ID: ${order.orderId}`);
//         // Add more relevant information from your order model

//         doc.moveDown();
//     });

//     // Finalize the PDF
//     doc.end();

//     // Send the generated PDF as a response
//     res.setHeader("Content-Disposition", "inline; filename=sales-report.pdf");
//     res.setHeader("Content-Type", "application/pdf");
//     fs.createReadStream(pdfFilePath).pipe(res);
//   } catch (error) {
//     console.log(error)
//   }
// }


exports.generateSalesReport = async (req, res) => {
    try {
        
        const { startDate, endDate } = req.query;
       
        const newstartDate = new Date(startDate);
    
        
        const newEndDate = new Date(endDate);
      
      
        const orderData = await Sale.find({
            date: {
                $gte: newstartDate,
                $lte: newEndDate,
            },
            status: "Delivered",
        }).sort({ date: "desc" });
 

        const formattedOrders = orderData.map((order) => ({
            date: moment(order.date).format("YYYY-MM-DD"),
            ...order,
        }));

        let salesData = [];
        
        formattedOrders.forEach((element) => {
            salesData.push({
                date: element.date,
                orderId: element._doc.orderId,
                total: element._doc.total,
                paymentMethod: element._doc.paymentMethod,
                productName: element._doc.product,
            });
        });

        let grandTotal = 0;

        salesData.forEach((element) => {
            grandTotal += element.total;
        });


        const orderdatas = {
            grandTotal: grandTotal,
            orders: salesData,
        };

        const renderTemp = `
        <%
        function forLoop(from, to, incr, block) {
          let accum = "";
          for (let i = from; i < to; i += incr) {
            accum += block(i);
          }
          return accum;
        }
        %>
        <div class="col-xl-12">
        <!-- Account details card-->
        <div class="card mb-4">
          <div class="card-header">Sales Report</div>
          <div class="card-body ml-3 p-5">
            <ul>
              <table id="my-table" class="my-table table table-hover" style="border-top: 1px solid black;">
                <thead>
                  <tr>
                    <th scope="col">SI.NO</th>
                   
                    <th scope="col">Date</th>
                    <th scope="col">Order id</th>
                    <th scope="col">Payment Method</th>
                    <th scope="col">Product Details</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <% data.orders.forEach(function(order, index) { %>
                  <tr>
                    <td><%= index + 1 %></td> <!-- SI.NO column -->
                   
                    <td><%= order.date %></td>
                    <td><%= order.orderId %></td>
                    <td><%= order.paymentMethod %></td>
                    <td>
                      <% order.productName.forEach(function(product) { %>
                      <p>Name: <%= product.name %></p>
                      <p>Quantity: <%= product.quantity %></p>
                      <p>Price: <span>₹</span><%= product.price %></p>
                      <% }); %>
                    </td>
                    <td><span>₹</span><%= order.total %></td>
                  </tr>
                  <% }); %>
                </tbody>
              </table>
              <h5>Total Revenue: ₹<strong class="ml-auto"><%= data.grandTotal %></strong></h5>
            </ul>
          </div>
        </div>
        </div>
        <div class="col-xl-12 d-flex justify-content-end mb-4">
        <button onclick="downloadSalesReport()" class="btn btn-primary">DOWNLOAD REPORT</button>
        </div>
        
          `;

          const renderContent = ejs.render(renderTemp, { data: orderdatas });
          res.status(200).json({data: renderContent});
       
    } catch (error) {
        console.log(error.message);
    }
};

//checking merge code
exports.downloadSalesReport = async (req, res) => {

console.log(304,"downloadsaleseeport");
try {
  const orderData = req.body.orderData;
  console.log(305,orderData);

  const { startDate, endDate } = req.query;
console.log(308,req.query);
  const pdfBuffer = await generateSalesReportPDF( startDate, endDate);

  res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=GadgetrySalesReport.pdf`,
  });

  res.send(pdfBuffer);
} catch (error) {
  console.log(error.message);
  res.status(500).send('An error occurred');
}
};





const generateSalesReportPDF = async ( startDate, endDate) => {
    console.log(344,"generate");
  const newstartDate = new Date(startDate);
  const newEndDate = new Date(endDate);
  const orderData = await Sale.find({
    date: {
        $gte: newstartDate,
        $lte: newEndDate,
    },
    status: "Delivered",
}).sort({ date: "desc" });
  return new Promise((resolve, reject) => {
    
      const doc = new PDFDocument();
      const pdfBuffer = [];

      doc.on('data', (chunk) => {
          pdfBuffer.push(chunk);
      });

      doc.on('end', () => {
          resolve(Buffer.concat(pdfBuffer));
      });

      doc.on('error', (error) => {
          reject(error);
      });

      // Customize PDF content
      doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();
      doc.fontSize(14).text(`Start Date: ${startDate}`, { align: 'center' });
      doc.text(`End Date: ${endDate}`, { align: 'center' }).moveDown();

      // Add order data to the PDF
      doc.moveDown();
      doc.fontSize(14).text('Order Details:', { underline: true }).moveDown();

      orderData.forEach(async (order) => {
          doc.text(`Order ID: ${order.orderId}`);
        
          doc.text(`Total: ${order.total}`);
          doc.text(`Payment Method: ${order.paymentMethod}`);
          doc.text(`Status: ${order.status}`);
          doc.moveDown();

          // Add product details
          order.product.forEach(product => {
              doc.text(`Product: ${product.name}`);
              doc.text(`Price: ${product.price}`);
              doc.text(`Quantity: ${product.quantity}`);
              doc.moveDown();
          });

          doc.moveDown();
      });

      doc.end();
  });
};




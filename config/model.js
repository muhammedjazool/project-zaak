const mongoose = require('mongoose');
require('dotenv').config();



const connectDB = async () => {
     try {
       await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
       console.log("Connected to the database!");
     } catch (error) {
       console.error("Error connecting to the database:", error.message);
       process.exit(1); // Exit the process with a failure code
     }
   };
   
   module.exports = connectDB;
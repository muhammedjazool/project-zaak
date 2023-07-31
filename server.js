    const express=require("express")
    const app=express()
    const path=require("path")
    const ejs=require("ejs")
    const  morgan = require('morgan')
    const mongoose = require("mongoose")
    const cookieParser = require("cookie-parser");
    const session = require("express-session");
    const nocache = require("nocache");
    const { v4: uuidv4 } = require("uuid"); 
    require("dotenv").config();
    const user_router=require("./routes/userRoute")
    const admin_router=require("./routes/adminRoute")

    app.set("view engine","ejs")
    app.set("views" , [
        path.join(__dirname,"views/user"), 
        path.join(__dirname,"views/admin"),
        path.join(__dirname,"views/partials")
    ]) 


    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    app.use(express.static(path.join(__dirname,"public")))
    app.use("/js",express.static(path.join(__dirname,"public/assets/js")))
    app.use("/css",express.static(path.join(__dirname,"public/assests/css")))


    app.use(session({
        secret:uuidv4(),
        resave:false,
        saveUninitialized:true,
    }))

    // app.use(morgan('tiny'))
    app.use(nocache());
    app.use(cookieParser());


    const port= process.env.PORT

    const connectDB = require("./config/model");
    connectDB(); 

    app.use('/', user_router)
    app.use("/admin",admin_router)



    app.listen(port,()=>{
        console.log(`server is running on http://localhost:${port}/`);
    })
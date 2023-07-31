const User = require("../../model/userModel");
const nodemailer = require("nodemailer");
const bcrypt=require("bcrypt")
const Category = require("../../model/categoryModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")


exports.loginGet =async (req, res) => {
  const categoryData= await Category.find({isBlocked:true})
  const userDetail = await User.findOne({ email: req.session.email })
   
  try {
    if(userDetail){
    res.render("login",{categoryData,userDetail});
    }else{
      res.render("login",{categoryData})
    }
  } catch (error) {
   
     console.log(error);
  }
};



exports.loginPost = async (req, res) => {
  const email = req.body.loginEmail;
  const valid = await loginValidation(req.body);
  if (valid.isValid) {
    req.session.email = email;

    return res.status(200).json({ email: req.session.email });
  } else {
    return res.status(400).json({ error: valid.errors });
  }
};


async function loginValidation(data) {
  const { loginEmail, loginPassword } = data;
  const errors = {};

  if (!loginEmail) {
    errors.loginEmailError = "Please provide an Email";
  }

  if (loginEmail && !loginPassword) {
    errors.loginPasswordError = "Password Not Entered";
  }

  if (loginEmail && loginPassword) {
    const existingUser = await User.findOne({
      email: loginEmail,
    });

    if (!existingUser) {
      errors.loginError = "Incorrect Email or password";
    } else {
      const isPasswordValid = await bcrypt.compare(loginPassword, existingUser.password);
      if (!isPasswordValid) {
        errors.incorrectPassword = "Incorrect Password";
      } else if (existingUser.isBlocked) {
        errors.isBlockedError = "Your account has been blocked";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}




/////////////////////forgot password///////////////////////

let otp;
const otpGenerator = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

exports.forgotPassword=(req,res)=>{
    res.render("forgotPassword")
}



exports.verifyForgotEmail = async (req, res) => {
  try {
    const { email } = req.body;
    req.session.userEmail = email;
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(400).json({ error: "This email is not registered" });
    } else {
      return res.status(200).end();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};




async function sendForgotPasswordOtp(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "OTP Verification",
        text: `The OTP for your verification is: ${otp}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error);
          return; 
        } else {
          console.log("Email sent successfully!");
        }
      });
    } catch (error) {
      console.log(error)
      res.render("404")
  }
}
  
  exports.forgotPasswordOtp = (req, res) => {
        
    try {
      otp = otpGenerator();
      let forgotPasswordOtp = otp
      console.log(otp);
      const email = req.session.userEmail;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
  
      sendForgotPasswordOtp(email, otp);
  
       res.render("forgotOtpEnter");
      setTimeout(() => {
        forgotPasswordOtp = null;
        console.log("otp removed");
    }, 60 * 1000);
     
    } 
    catch (error) {
      console.log(error);
    }
  };


  exports.verifyForgotPasswordOtp=async(req,res)=>{
    try {
        const { first, second,third,fourth}=req.body
       let enteredOtp 
        enteredOtp=first+second+third+fourth
        console.log(enteredOtp);
        if(enteredOtp===otp){
          return res.status(200).end()
        }else{
            console.log(169);
            return res.status(400).json({ error: "Invalid OTP!" });
        }
    } catch (error) {
        
    }
  }

exports.loadResetPassword=(req,res)=>{
    res.render("reset_password")
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


exports.verifyResetPassword=async(req,res)=>{
    try {
        const email=req.session.userEmail
        const newPassword=req.body.password
        console.log(185,newPassword);
        const hashedPassword= await securePassword(newPassword)

        const userData = await User.findOneAndUpdate({email:email},{set:{password:hashedPassword}})
        console.log(189,userData);
        if(userData){ 
            res.redirect("/login")
            delete req.session.userEmail
        }else{
            console.log("something error happened");
        }
    } catch (error) {
         console.log(error)
    }
}

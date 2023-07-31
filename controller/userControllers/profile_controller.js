const Category = require("../../model/categoryModel")
const User = require("../../model/userModel")
const Product = require("../../model/productModel")
const cloudinary = require("../../config/cloudinary")
const bcrypt=require("bcrypt")



exports.loadProfile=async(req,res)=>{
    const categoryData= await Category.find({isBlocked:true})
    const userDetail =await User.findOne({email:req.session.email})
    try{
     if(userDetail){
     res.render("profile",{title:"profile",
     userDetail,
     categoryData
})
}else{
     res.render("profile",{title:"profile",categoryData})
}
    }catch(error){
     console.log(error)
    }
}

async function profileValidation(data) {
    const { name, phone, email, currentPassword, newPassword, confirmPassword } = data;
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    const existingUser = await User.findOne({ email: email })

    if (!email) {
        errors.emailError = "Please Enter an Email"
    } else if (!emailRegex.test(email)) {
        errors.emailError = "Please provide a valid Email"
    } 

    if (!name) {
        errors.nameError = "Please Enter a Name"
    }

    if (!phone) {
        errors.phoneError = "Please provide a Phone number"
    } else if (!phoneRegex.test(phone)) {
        errors.phoneError = "Invalid Phone Number"
    }

    if (currentPassword && (!await bcrypt.compare(currentPassword, existingUser.password))) {
        errors.currentPasswordError = "Incorrect Password!"
    }

    if (!email) {
        errors.emailError = "Please Enter an Email"
    } else if (!emailRegex.test(email)) {
        errors.emailError = "Please provide a valid Email"
    }

    if (!newPassword) {
        errors.newPasswordError = "Please provide a Password"
    } else if (!passwordRegex.test(newPassword)) {
        errors.newPasswordError = "Password must be 8 characters with one uppercase letter, one lowercase letter, and one number"
    }

    if (newPassword !== confirmPassword && newPassword.length > 0) {
        errors.confirmPasswordError = "The passwords do not match"
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
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

  exports.verifyProfile = async (req, res) => {
    console.log(76);
    try {
      const data = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };
  
      const user = await User.findOne({ email: data.email });
      console.log(86, user);
      
  
      const valid = await profileValidation(req.body);
      console.log(89, valid);
  
      if (!valid.isValid) {
        console.log(95);
        return res.status(400).json({ error: valid.errors });
      }
  
      // If the newPassword field is provided, hash the new password
      if (data.newPassword) {
        const hashedPassword = await securePassword(data.newPassword);
        user.password = hashedPassword;
      }
  
      // Save the user's details (including the password if updated)
      await user.save();
      console.log(91);
      return res.status(200).end();
    } catch (error) {
      console.log(99);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
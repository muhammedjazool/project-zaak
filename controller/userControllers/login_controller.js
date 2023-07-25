const User = require("../../model/userModel")


exports.loginGet = (req, res) => {
     res.render("login")
   }
   
   
   
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
       } else if (existingUser.password !== loginPassword) {
         errors.incorrectPassword = "Incorrect Password";
       }
       else if (existingUser.isBlocked) {
         errors.isBlockedError = "Your account has been blocked";
       }
     }
   
     return {
       isValid: Object.keys(errors).length === 0,
       errors,
     };
   }
   
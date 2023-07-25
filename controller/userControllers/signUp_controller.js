const User = require("../../model/userModel")


async function validation(data) {
  const { name, phone, email, password, confirmPassword } = data;
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const existingUser = await User.findOne({ email: email });

  if (!email) {
    errors.emailError = "Please Enter an Email";
  } else if (!emailRegex.test(email)) {
    errors.emailError = "please provide a valid Email";
  } else if (existingUser && email == existingUser.email) {
    errors.emailError = 'This email is already registered';
  }

  if (!name) {
    errors.nameError = "Please Enter a Firstname";
  }
   //  else if (name.includes(" ")) {
     // //   errors.nameError = "Invalid spacing between names";
     // // }

  if (!phone) {
    errors.phoneError = "Please provide a Phone number";
  } else if (!phoneRegex.test(phone)) {
    errors.phoneError = "Invalid Phone Number";
  }

  if (!password) {
    errors.passwordError = "Please provide a Password";
  } else if (password.length < 8) {
    errors.passwordError = "Password length should be at least 8";
  }

  if (password != confirmPassword && password.length > 0) {
    errors.confirmPasswordError = "The passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

exports.signUpPost = async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    isBlocked: false,
  };
  req.session.detail = data;

  const valid = await validation(req.body);

  if (valid.isValid) {
    return res.status(200).end();
  } else if (!valid.isValid) {
    return res.status(400).json({ error: valid.errors });
  }
};

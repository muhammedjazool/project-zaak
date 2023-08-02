const User = require("../../model/userModel");

async function validation(data) {
  const { name, phone, email, password, confirmPassword } = data;
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  const existingUser = await User.findOne({ email: email });

  if (!email) {
    errors.emailError = "Please Enter an Email";
  } else if (!emailRegex.test(email)) {
    errors.emailError = "please provide a valid Email";
  } else if (existingUser && email == existingUser.email) {
    errors.emailError = "This email is already registered";
  }

  if (!name) {
    errors.nameError = "Please Enter a Name";
  }

  if (!phone) {
    errors.phoneError = "Please provide a Phone number";
  } else if (!phoneRegex.test(phone)) {
    errors.phoneError = "Invalid Phone Number";
  }

  if (!password) {
    errors.passwordError = "Please provide a Password";
  } else if (!passwordRegex.test(password)) {
    errors.passwordError =
      "Password must be 8 characters with one uppercase letter, one lowercase letter, and one number";
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
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      isNotBlocked: false,
    };

    req.session.detail = data;

    const valid = await validation(req.body);

    if (valid.isValid) {
      return res.status(200).end();
    } else if (!valid.isValid) {
      return res.status(400).json({ error: valid.errors });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

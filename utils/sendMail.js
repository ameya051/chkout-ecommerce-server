const dotenv = require("dotenv");
const transporter = require("../utils/transporter.js");
const generateToken = require("../utils/generateToken.js");

dotenv.config();

const sendMail = async (user, email) => {
  const frontendURL = process.env.FRONTEND_BASE_URL;

  // create a new JWT to verify user via email
  const forgetPasswordToken = generateToken(user, "forgot password");
  const url = `${frontendURL}/reset-password/${forgetPasswordToken}`;
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: email,
    subject: "Reset Password for ChkOut", // Subject line
    html: `<div>
					<h2>Reset Password for your ChkOut account</h2>
					<br/>
					Forgot your password? No worries! Just click this link to 
					<a href="${url}">reset your password.</a>. 
					<br>
					Note that this link is valid for only the next 10 minutes.
				</div>
			`,
  };

  const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });

  if (mailSent) return Promise.resolve(1);
};

module.exports =  sendMail;

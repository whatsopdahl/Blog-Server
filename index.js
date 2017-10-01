const express = require("express");
const mailer = require("nodemailer");
const bodyParser = require("body-parser");
const api = express();

const transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    email : process.env.emailOut,
    password : process.env.passwordOut
  }
});

api.set('port', (process.env.port || 3000));

api.use(bodyParser.urlencoded({
  extended : true
}));
api.use(bodyParser.json());

api.post('/email', (req, resp) => {
  const { body } = req;
  const { email, firstName, lastName, subject, message, timestamp } = body;
  email = encodeURIComponent(email);
  firstName = encodeURIComponent(firstName);
  lastName = encodeURIComponent(lastName);
  subject = encodeURIComponent(subject);
  message = encodeURIComponent(message);
  timestamp = encodeURIComponent(timestamp);

  const mailOptions = {
    from: process.env.emailOut,
    to: process.env.emailTarget,
    subject: 'WHATSOPDAHL.COM@'+timestamp+" : "+subject,
    text: "From : "+firstName+" "+lastName+" <"+email+">\n"+message
  };
  transporter.sendEmail(mailOptions, (err, info) => {
      if (err) {
        console.error("An error occurred while trying to send an email", err);
      } else {
        console.log("Email successfully sent : "+info);
      }
  });
});

api.all("*", (req,res) => {
  console.error("ERROR: Invalid request", encodeURIComponent(req));
  res.status(405).send("Invalid request - the method you requested is not supported.");
});

api.listen(api.get('port'), () => {
  console.log("Server listenting at port "+api.get("port"));
});

const express = require("express");
const mailer = require("nodemailer");
const bodyParser = require("body-parser");
const api = express();

let transporter = mailer.createTransport({
 service: 'gmail',
 auth: {
        user: process.env.emailOut,
        pass: process.env.passwordOut
    }
});

api.set('port', (process.env.port || 3000));

api.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

api.use(bodyParser.urlencoded({
  extended : true
}));

api.use(bodyParser.json());

api.post('/email', (req, resp) => {
  const { body } = req;
  let email = replaceInjectedScriptTags(body.email);
  let firstName = replaceInjectedScriptTags(body.firstName);
  let lastName = replaceInjectedScriptTags(body.lastName);
  let subject = replaceInjectedScriptTags(body.subject);
  let message = replaceInjectedScriptTags(body.message);
  let timestamp = (new Date()).toString();

  const mailOptions = {
    from : process.env.emailOut,
    to: process.env.emailOut,
    replyTo: email,
    subject: `'WHATSOPDAHL.COM@${timestamp} : ${subject}'`,
    text: `From : ${firstName} ${lastName} -- ${email} \n ${message}`
  };
  transporter.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.error("Error sending email :", err);
      resp.status(500).send(`Error sending email : ${err}`);
      return;
    }
    console.log("Email successfully sent");
    resp.status(200).send("Email successfully sent");
  });
  const notifyOfMailOptions = {
    from : process.env.emailOut,
    to : process.env.emailTarget,
    subject : "New email from whatsopdahl.com",
    text : `Email send from whatsopdahl.com @ ${timestamp}`
  };
  transporter.sendMail(notifyOfMailOptions, (err, res) => {
    if (err) {
      console.error(`Error sending mail : ${err}`);
    }
    console.log("Notified of email");
  });
});

api.listen(api.get('port'), () => {
  console.log("Server listenting at port "+api.get("port"));
});

String.prototype.replaceAll =  function (search, replace) {
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
}

function replaceInjectedScriptTags(str) {
  str = str.replaceAll('<', '--less than--');
  str = str.replaceAll('>', '--greater than--');
  str = str.replaceAll('&', '--and--');
  str = str.replaceAll('/', '--forward slash--')
  return str;
}

/* eslint-disable no-undef */
// Require HTTPS module. Use http if your site is accessed via HTTP instead of HTTPS
const http = require("https");
const mailer = require("nodemailer");
const fs = require("fs");
const CircularJSON = require("circular-json");
require("dotenv").config();

// Function to request our site
let requestSite = function requestSite() {
  let options = {
    host: "delgaudiomike.com",
    method: "GET",
  };

  // Configure the mailer first
  let smtpTransport = mailer.createTransport({
    name: "delgaudiomike.com",
    host: "mail.delgaudiomike.com",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: "noreply@delgaudiomike.com",
      pass: process.env.MAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  function mail(response) {
    return {
      from: "noreply@delgaudiomike.com",
      to: "delgaudiomike@gmail.com",
      subject: `[HEALTHCHECK] - DELGAUDIOMIKE ERROR ${response.statusCode} ${response.statusMessage}`,
      text: "",
      html: `
        <h1 style="color:red">Warning: DELGAUDIOMIKE ERROR ${
          response.statusCode
        } ${response.statusMessage}</h1>
        <code>
        ${CircularJSON.stringify(response)}
        </code>
        `,
    };
  }

  // Initiate the HTTP GET request to access the site medium.com/til-js
  let request = http.request(options, function (response) {
    // Check the reponse code. If it is greater than 400, its an error
    if (parseInt(response.statusCode, 10) >= 400) {
      // Mail implementation
      // Send the mail
      smtpTransport.sendMail(mail(response), function (error) {
        // Useful for finding the error
        if (error) {
          console.error(error);
          fs.writeFile("errorLogs.txt", error, { flag: "wa" }, (err) => {
            // In case of a error throw err.
            if (err) throw err;
          });
        }
        smtpTransport.close();
      });
    } else {
      const today = new Date();
      console.log(
        "Status Normal at " +
          today.toLocaleString("en-US", { timeZone: "America/New_York" })
      );
    }
  });

  // Send mail on error
  request.on("error", function (e) {
    // Send the error object to mail body
    mail.html += "Error in get request. " + e;
    // Send mail.
    smtpTransport.sendMail(mail, function () {
      smtpTransport.close();
    });
  });

  request.end();
};
//requestSite();
console.log(process.env.MAIL_PASS);
setInterval(requestSite, 300000);

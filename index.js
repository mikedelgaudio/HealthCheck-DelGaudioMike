// Require HTTPS module. Use http if your site is accessed via HTTP instead of HTTPS
let http = require("https");
// Require node mailer for sending emails
let mailer = require("nodemailer");
// Function to request our site
let requestSite = function requestSite() {
  // We need to request the URL medium.com/til-js
  let options = {
    host: "delgaudiomike.com",
    // path: "/til-js",
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
      pass: "",
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  // Create a mail template with from, to and subject
  // To address can also be your email address
  let mail = {
    from: "noreply@delgaudiomike.com",
    to: "delgaudiomike@gmail.com",
    subject: "Message title",
    text: "Plaintext 2 version of the message",
    html: "<p>HTML version of the message</p>",
  };
  //   var message = {
  //     from: "noreply@delgaudiomike.com",
  //     to: "delgaudiomike@gmail.com",
  //     subject: "Message title",
  //     text: "Plaintext version of the message",
  //     html: "<p>HTML version of the message</p>",
  //   };

  //   smtpTransport.verify(function (error, success) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log("Server is ready to take our messages");
  //     }
  //   });
  smtpTransport.sendMail(mail, function (error, response) {
    // Useful for finding the error
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    smtpTransport.close();
  });

  // Initiate the HTTP GET request to access the site medium.com/til-js
  let request = http.request(options, function (response) {
    // Check the reponse code. If it is greater than 400, its an error
    if (parseInt(response.statusCode, 10) >= 400) {
      // Mail implementation
      // Send the mail
      smtpTransport.sendMail(mail, function (error, response) {
        // Useful for finding the error
        console.log("error is ", error);
        smtpTransport.close();
      });
    }
  });

  // Send mail on error
  request.on("error", function (e) {
    // Send the error object to mail body
    mail.html += "Error in get request. " + e;
    // Send mail.
    smtpTransport.sendMail(mail, function (e) {
      smtpTransport.close();
    });
  });
  request.end();
};
requestSite();

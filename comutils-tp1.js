var fs = require("fs"),
      nodemailer = require("nodemailer"),
      // create reusable transport method (opens pool of SMTP connections)
      smtpTransport = nodemailer.createTransport("SMTP", {
                // mail sent by Ideafy,
                host: "10.224.0.27",
                secureConnection : true,
                port : 465,
                auth : {
                        user : "ideafy-taiaut",
                        pass : fs.readFileSync(".password", "utf8").trim()
                }
});
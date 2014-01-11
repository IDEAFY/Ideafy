var nodemailer = require("nodemailer"),
      // create reusable transport method (opens pool of SMTP connections)
      smtpTransport = nodemailer.createTransport("SMTP", {
                // mail sent by Ideafy,
                host: "smtp.gmail.com",
                secureConnection : true,
                port : 465,
                auth : {
                        user : "vincent.weyl@gmail.com",
                        pass : "$Nor&Vin2012"
                }
        });
        
function ComUtils(){
 
        this.sendSignupEmail = function(login, pwd, lang){
                var mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
                        to : login
                };
                
                switch(lang){
                        case "en-us":
                                mailOptions.subject = "Ideafy confirmation";
                                mailOptions.text ="Thank you for registering to Ideafy. Your login is "+login+ " and your password is "+pwd+". We hope you will find the application enjoyable and useful.\nThe Ideafy team.";
                                break;
                        case "fr-fr":
                                mailOptions.subject = "Confirmation d'inscription à Ideafy";
                                mailOptions.text ="Merci de vous être enregistré sur Ideafy. Votre identifiant est "+login+ " et votre mot de passe "+pwd+". Nous espérons que vous prendrez plaisir à utiliser notre application.\nL'équipe Ideafy.";
                                break;
                        default:
                                mailOptions.subject = "Thank you for joining Ideafy";
                                mailOptions.text ="Thank you for registering to Ideafy. Your login is "+login+ " and your password is "+pwd+". We hope you will find the application enjoyable and useful.\nThe Ideafy team.";
                                break;
                }
                smtpTransport.sendMail(mailOptions, function(error, response) {
                        if (error) {
                                console.log(error, response, "it's right here");
                        }
                });        
           }; 
       
};

exports.ComUtils = ComUtils;

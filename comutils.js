/**
 * IDEAFY -- communication utilities
 * ===============================
 * 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2013-2014 TAIAUT
 * 
 */
        
function ComUtils(){
        
        var _smtpTransport, _supportEmail;
 
        this.setVar = function(smtpTransport, supportEmail){
                _smtpTransport = smtpTransport;
                _supportEmail = supportEmail;
        };
 
        /*
         * Sending signup confirmation email -- localized versions
         */
        
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
           
           /*
            * Send support requests to address defined in supportEmail variable
            */
            this.support = function(json, onEnd){
                        var   date = new Date(json.date),
                                mailOptions = {
                                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
                                        to : _supportEmail, // list of receivers
                                        replyTo : "", // recipient should reply to sender
                                        subject : "Support request from "+json.userid + " "+ date.toDateString(), // Subject line
                                        html : "Userid : "+json.userid+"\nDate : " + date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+ " "+date.getHours()+":"+date.getMinutes()+"\n\nRequest :\n"+ json.request // html body
                                };
                        
                        smtpTransport.sendMail(mailOptions, function(error, response) {
                                if (error) {
                                        onEnd(error);
                                }
                                else {
                                        onEnd("ok");
                                }
                        });        
             };
           
           
       
};

exports.ComUtils = ComUtils;

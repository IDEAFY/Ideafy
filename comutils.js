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
        
        // Sending email messages from Ideafy
        this.sendMail = function(json, onEnd) {

                var type = json.type,
                    mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
                        to : "", // list of receivers
                        cc : "", // automatic copy to sender
                        replyTo : "", // recipient should reply to sender
                        subject : "", // Subject line
                        html : "" // html body
                };

                if (type === "invite") {
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.subject = json.sender + " invites you to join the Ideafy community";
                        mailOptions.html = "<p style='background: whitesmoke; font-family=helvetica; font-size=24px; text-align=justify;'><b>Take advantage of this invitation! Get Ideafy now and join the fast growing online community of Ideafans. Compete for best idea, best mind and many other exciting challenges. Give your imagination and your ideas a new life.</b></p><p><a href='https://itunes.apple.com/us/app/ideafy/id605681593?mt=8&uo=4' target='itunes_store'style='display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/images/web/linkmaker/badge_appstore-lrg.png) no-repeat;width:135px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/images/web/linkmaker/badge_appstore-lrg.svg);}'></p>";
                }
                
                if (type === "doc") {
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.cc = json.cc;
                        mailOptions.replyTo = json.replyTo;
                        mailOptions.subject = json.subject;
                        mailOptions.html = "<p><b>"+json.header+"</b></p><p>"+json.body.replace(/\n/g, "<br>")+"</p><p>----------<br>"+ json.signature +"<div>"+json.attachHeader + json.attachBody+"</div>";
                        
                }
                
                if (type === "message"){
                        console.log("exporting message");                
                }
                
                if (type === "contact"){
                        console.log("exporting contact");        
                }
                
                _smtpTransport.sendMail(mailOptions, function(error, response) {
                        if (error) {
                                console.log(error, response);
                                onEnd({
                                        sendmail : "error",
                                        reason : error,
                                        response : response
                                });
                        } 
                        else {
                                onEnd({
                                        sendmail : "ok",
                                        recipient : json.recipient
                                });
                        }
                });
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
                _smtpTransport.sendMail(mailOptions, function(error, response) {
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
                        
                        _smtpTransport.sendMail(mailOptions, function(error, response) {
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

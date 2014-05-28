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

var follow = require('follow');
        
function ComUtils(){
        
        var _db, _smtpTransport, _supportEmail, _mailSender,
                _CouchDBDocument, _CouchDBView, _Store,
                _getDocAsAdmin, _updateDocAsAdmin, _updateUserIP, _getViewAsAdmin;
 
        this.setVar = function(db, smtpTransport, supportEmail, mailSender){
                _db = db;
                _smtpTransport = smtpTransport;
                _supportEmail = supportEmail;
                _mailSender = mailSender;
        };
        
        this.setConstructors = function(CouchDBDocument, CouchDBView, Store){
                _CouchDBDocument = CouchDBDocument;
                _CouchDBView = CouchDBView;
                _Store = Store;
        };
        
        this.setFunctions = function(CDBAdmin, checkInvited, addInvited){
                _getDocAsAdmin = CDBAdmin.getDoc;
                _updateDocAsAdmin = CDBAdmin.updateDoc;
                _getViewAsAdmin = CDBAdmin.getView;
                _updateUserIP = CDBAdmin.updateUserIP;        
                _checkInvited = checkInvited;
                _addInvited = addInvited;
        };
        
        // Sending email messages from Ideafy
        this.sendMail = function(json, onEnd) {

                var type = json.type,
                    mailOptions = {
                        from : _mailSender, // sender address
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
                
                if (type === "pwd"){
                        mailOptions.to = json.to;
                        mailOptions.subject = json.subject;
                        mailOptions.html = json.html;        
                }
                
                if (type === "pwdReset"){
                        mailOptions.to = json.to;
                        switch(json.lang){
                                case "fr-fr":
                                        mailOptions.subject = "Réinitialisation du mot de passe Ideafy";
                                        mailOptions.html = "Voici votre mot de passe temporaire, à changer lors de votre prochaine connexion : "+json.pwd;
                                        break;
                                default:
                                        mailOptions.subject = "Ideafy password reset";
                                        mailOptions.html = "Here is your temporary password : "+json.pwd+". Please change it as soon as you get connected." ;
                                        break;
                        }       
                }
                
                if (["invite", "doc", "message", "contact", "pwd", "pwdReset"].indexOf(type) > -1) {
                        _smtpTransport.sendMail(mailOptions, function(error, response) {
                                if (error) {
                                        onEnd && onEnd({
                                                sendmail : "error",
                                                reason : error,
                                                response : response
                                        });
                                } 
                                else {
                                        onEnd && onEnd({
                                                sendmail : "ok",
                                                recipient : json.recipient
                                        });
                                }
                        });
                }
        };
 
        /*
         * Sending signup confirmation email -- localized versions
         */
        
        this.sendSignupEmail = function(login, pwd, lang){
                var mailOptions = {
                        from : _mailSender, // sender address
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
                                        from : _mailSender, // sender address
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
           
                /*
                 * Ideafy notification system
                 */ 
                this.notify = function(json, onEnd) {
                        var dest = json.dest, sendResults = new _Store([]),
                        // build message
                        message = {
                                "type" : json.type,
                                "status" : "unread",
                                "date" : json.date,
                                "author" : json.author,
                                "username" : json.username,
                                "firstname" : json.firstname,
                                "toList" : json.toList,
                                "ccList" : json.ccList,
                                "object" : json.object,
                                "body" : json.body,
                                "signature" : json.signature
                        },

                        /**
                        * A function to push message to couchDB
                        * @param {Object} msg the message to deliver
                        * @param {String} userid the userid in couchDB to deliver the message to
                        */
                        sendMessage = function(msg, userid) {
                                var cdb = new _CouchDBDocument();
                                _getDocAsAdmin(userid, cdb)
                                .then(function() {
                                        var arr = [], empty = false;
                                        // retrieve notifications array
                                        if (cdb.get("notifications")[0]){arr = cdb.get("notifications");}
                                
                                        // add message
                                        arr.unshift(msg);
                                
                                        // update store and upload
                                        cdb.set("notifications", arr);
                                        return _updateDocAsAdmin(userid, cdb);
                                })
                                .then(function() {
                                        sendResults.alter("push", {
                                                res : "ok",
                                                id : userid
                                        });
                                });
                        },
                        /**
                        * A function to add message to sender's document in couchDB
                        * @param {Object} msg the message to deliver
                        */
                        addMessageToSent = function(msg){
                                var cdb = new _CouchDBDocument();
                                _getDocAsAdmin(msg.author, cdb)
                                .then(function(){
                                        var arr = cdb.get("sentMessages")||[];
                                        arr.unshift(msg);
                                        cdb.set('sentMessages', arr);
                                        return _updateDocAsAdmin(msg.author, cdb);
                                });
                        },
                        /*
                        * A function to insert contact in a user's connection list when a request was accepted
                        */
                        insertContact = function(userid, contact, onEnd){
                                var cdb = new _CouchDBDocument(), contacts = [], pos=0, news =[];
                                _getDocAsAdmin(userid, cdb)
                                .then(function(){
                                        var i;
                                        contacts = cdb.get("connections");
                                        news = cdb.get("news") || [];
                                        for (i=0,l=contacts.length;i<l;i++){
                                                // check if contact is of type user or group first
                                                if (contacts[i].type === "user"){
                                                        if (contacts[i].lastname < contact.lastname) {pos++;} 
                                                        if (contacts[i].lastname === contact.lastname){
                                                                if (contacts[i].firstname < contact.firstname) {pos++;} 
                                                        }
                                                }
                                                else {
                                                        if (contacts[i].username < contact.lastname)  {pos++;}
                                                }  
                                        }
                                        contacts.splice(pos, 0, contact);
                                        if (contact.type === "user") {
                                                news.unshift({"type": "CX+", "date": json.date, "content": {userid:json.author, username:contact.username}});
                                        }
                                        cdb.set("connections", contacts);
                                        cdb.set("news", news);
                                        return _updateDocAsAdmin(userid, cdb);
                                })
                                .then(function(){
                                        onEnd("ok");
                                });
                        },
                        /*
                        * A function to remove a contact in a user's connection list when a cancel request is sent
                        */
                        removeContact = function(userid, contact, onEnd){
                                var cdb = new _CouchDBDocument(), contacts = [], pos=0, news =[];
                                _getDocAsAdmin(userid, cdb)
                                .then(function(){
                                        var i,j, grp;
                                        contacts = cdb.get("connections");
                                        news = cdb.get("news") || [];
                                        for (i=contacts.length-1;i>=0;i--){
                                                // check if contact is of type user or group first
                                                if (contacts[i].type === "user"){
                                                        if (contacts[i].userid === contact.userid) {contacts.splice(i,1);}
                                                }
                                                else if ((contacts[i].type === "group")){
                                                        grp = contacts[i].contacts;
                                                        for (j=grp.length-1;j>=0; j--){
                                                                if (grp.userid === contact.userid) {grp.splice(j,1);}
                                                        }
                                                } 
                                        }
                                        if (contact.type === "user") {
                                                news.unshift({"type": "CX-", "date": json.date, "content": {userid:contact.userid, username:contact.username}});
                                        }
                                        cdb.set("connections", contacts);
                                        cdb.set("news", news);
                                        return _updateDocAsAdmin(userid, cdb);
                                })
                                .then(function(){
                                        onEnd("ok");
                                });
                        };
                
                         // add specificities depending on message type
                        if (json.type === "CXR") {
                                message.contactInfo = json.contactInfo;
                        }
                
                        if (json.type === "DOC") {
                                message.docId = json.docId;
                                message.docType = json.docType;
                                message.docTitle = json.docTitle;
                        }
                
                        if (json.type === "2Q+") {
                                message.docId = json.docId;
                                message.docType = json.type;
                        }
                
                        if (json.type === "INV" || (json.type.search("MU") >-1)) {
                                message.docId = json.docId;
                                message.docTitle = json.docTitle;
                                if (json.scheduled) message.scheduled = json.scheduled;
                        }

                        // send message to all recipients
                        for ( i = 0, l = dest.length; i < l; i++) {
                                sendMessage(message, dest[i]);
                        }
                
                        // add message to sent list
                        addMessageToSent(message);
                
                        // return sendResults if all messages have been delivered
                        sendResults.watch("added", function() {
                                if (sendResults.getNbItems() === dest.length) {
                                        //adding some post-treatment
                                        if (json.type === "CXRaccept"){
                                                insertContact(json.dest[0], json.contactInfo, function(result){
                                                        if (result){
                                                                // add to both users' score
                                                                _updateUserIP(json.dest[0], "CXR", 25, function(result){return result;});
                                                                _updateUserIP(json.author, "CXR", 25, function(result){
                                                                        onEnd(sendResults.toJSON());
                                                                });
                                                        }
                                                });
                                        }
                                        else if (json.type === "CXCancel"){
                                                removeContact(json.dest[0], json.contactInfo, function(result){
                                                        if (result){
                                                                // add to both users' score
                                                                _updateUserIP(json.dest[0], "CXC", -25, function(result){return result;});
                                                                _updateUserIP(json.author, "CXC", -25, function(result){
                                                                        onEnd(sendResults.toJSON());
                                                                });
                                                        }        
                                                });
                                        }
                                        else {onEnd(sendResults.toJSON());}
                                }
                        });
                };
                
                // Invite a user to join Ideafy
        this.invite = function(json, onEnd){
                var mailOptions = {
                        from : _mailSender, // sender address
                        to : json.id, // list of receivers
                        cc : json.senderid, // automatic copy to sender
                        replyTo : "", // recipient should reply to sender
                        subject : json.sendername + " invites you to join the Ideafy community",
                        html : json.body
                };
                
                // check if user has already been invited
                _checkInvited(json.id, function(result){
                        var cdb = new _CouchDBDocument();
                        // if not then create doc in database and send email
                        if (!result){
                                cdb.set("_id", json.id);
                                cdb.set("sender", [json.senderid]);
                                _addInvited(json.id, cdb)
                                .then(function(){
                                        _smtpTransport.sendMail(mailOptions, function(error, response) {
                                                if (error) {
                                                        onEnd({
                                                                sendmail : "error",
                                                                reason : error,
                                                                response : response
                                                        });
                                                } 
                                                else {
                                                        onEnd("ok");
                                                }
                                        });        
                                }); 
                        }
                        else{
                                cdb.reset(result);
                                // check if user has already been invited by this sender
                                if (cdb.get("sender").indexOf(json.senderid)>-1){
                                        onEnd("alreadyinvited");
                                }
                                else{
                                        cdb.set("sender", cdb.get("sender").push(json.senderid));
                                        _addInvited(json.id, cdb)
                                        .then(function(){
                                                _smtpTransport.sendMail(mailOptions, function(error, response) {
                                                        if (error) {
                                                                onEnd({
                                                                        sendmail : "error",
                                                                        reason : error,
                                                                        response : response
                                                                });
                                                        } 
                                                        else {
                                                                onEnd("ok");
                                                        }
                                                });        
                                        });
                                }      
                        }        
                });  
        };

        // get presence updates from couchdb
        this.sendPresenceUpdates = function(json, onEnd, onData){
                var options = {
                                method : "GET",
                                feed : "continuous",
                                heartbeat: 60000,
                                path:"/"+_db+"/_changes",
                                filter: "_view",
                                view: "users/online",
                                auth: _cdbAdminCredentials,
                                // agent: false,
                                headers: {
                                        "Content-Type": "application/json"
                                }
                        };
                _transport.request("CouchDB", options, function (changes) {
                        var json, cdb;
                        if (changes == "\n") {
                                return false;
                        }
                        else{
                                try{
                                        json = JSON.parse(changes);        
                                }
                                catch (e){
                                        json = null;
                                        console.error(e, "error parsing change feed -- presence update");
                                }
                                
                                if (json && json.id){
                                        cdb = new _CouchDBDocument();
                                        _getDocAsAdmin(json.id, cdb)
                                        .then(function(){
                                                // check if doc is of user type and if so emit presence status
                                                if (cdb.get("type") && cdb.get("type") === 7){
                                                        onData({id: json.id, online: json.online});
                                                }
                                        });
                                }
                        }
                });
                
                
                        
        };
};

exports.ComUtils = ComUtils;

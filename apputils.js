/**
 * IDEAFY -- application utilities
 * ===============================
 * 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2013-2014 TAIAUT
 * 
 */

var fs = require("fs");

function AppUtils(){
        var _CouchDBDocument, _CouchDBView, Promise,
            _updateUserIP, _updateDocAsAdmin, _getDocAsAdmin, _createDocAsAdmin, _getViewAsAdmin, _removeDocAsAdmin,
            _getBulkView, _updateCard, _deleteAttachment, _deleteCard,
            _transport, _db,_dbIP, _dbPort, _cdbAdminCredentials, _badges;
        
        this.setConstructors = function(CouchDBDocument, CouchDBView, Promise){
                _CouchDBDocument = CouchDBDocument;
                _CouchDBView = CouchDBView;
                _Promise = Promise;
        };
        
        this.setCDBAdmin = function(cdbAdmin){
                _updateUserIP = cdbAdmin.updateUserIP;
                _updateDocAsAdmin = cdbAdmin.updateDoc;
                _getDocAsAdmin = cdbAdmin.getDoc;
                _createDocAsAdmin = cdbAdmin.createDoc;
                _getViewAsAdmin = cdbAdmin.getView;
                _getBulkView = cdbAdmin.getBulkView;
                _removeDocAsAdmin = cdbAdmin.removeDoc;      
        };
        
        this.setVar = function(transport, db, dbIP, dbPort, credentials, badges){
                _transport = transport;
                _db = db;
                _dbIp = dbIp;
                _dbport = dbPort;
                _cdbAdminCredentials = credentials;
                _badges = badges || {
                        profile : true,
                        tutorial : false,
                        useascharacter : true,
                        ideaThresholds : [5, 25, 100, 250],
                        bronzeVotes : 100,
                        silverVotes : 500,
                        goldVotes : 1000,
                        bronzeRating : 3.5,
                        silverRating : 4,
                        goldRating : 4.5,
                        suSessionThresholds : [5, 20, 50],
                        muSessionThresholds : [5, 10, 25],
                        tqThresholds : [5, 15, 50],
                        tcThresholds : [10, 100, 1000, 5000]
                };
        };
        
        
        /*
         * Update a card after one of its deck container was removed from database
         */
        _updateCard = function(cardId, deckId){
                var cardCDB = new _CouchDBDocument(),
                    promise = new _Promise();
                
                _getDocAsAdmin(cardId, cardCDB)
                .then(function(){
                        var decks = cardCDB.get("deck");
                        
                        decks.splice(decks.indexOf(deckId), 1);
                        
                        cardCDB.set("deck", decks);
                        
                        if (decks.length){
                                _updateDocAsAdmin(cardId, cardCDB)
                                .then(function(){
                                        promise.fulfill();
                                });
                        }
                        
                        else {
                              _deleteCard(cardId)
                              .then(function(){
                                        promise.fulfill();        
                              });
                        }
               });
               return promise;        
        };
        
        /*
         * Delete a card document from database
         */
        _deleteCard = function(cardId){
                var cardCDB = new _CouchDBDocument(),
                    promise = new _Promise();
                
                _getDocAsAdmin(cardId, cardCDB)
                .then(function(){
                        // delete attachment if applicable
                        if (cardCDB.get("picture_file") === cardCDB.get("_id")){
                                _deleteAttachment("card", cardCDB.get("_id"));
                        }
                              
                        return _removeDocAsAdmin(cardId, cardCDB);        
                })
                .then(function(){
                        promise.fulfill();        
                });
                
                return promise;        
        };
        
        /*
         * Delete an attachment file from the server (/shared directory)
         */
        _deleteAttachment = function(type, filename, onEnd){
                var _path;
                switch(type){
                        case "deck":
                                _path = __dirname+'/attachments/decks/'+filename;
                                break;
                        case "card":
                                _path = __dirname+'/attachments/cards/'+filename;
                                break;
                        default:
                                break;
                }
                
                fs.exists(_path, function(exists){
                        if (exists){
                                fs.unlink(_path);
                                onEnd("ok");
                        }
                        else{
                                onEnd("File not found");
                        }
                });        
        };
        
        /*
         * HANDLERS
         */
        
        this.updateCard = _updateCard;
        this.deleteAttachment = _deleteAttachment;
        
        
        /*
         * Delete a card from database
         */
        this.removeCardsFromDatabase = function removeCardsFromDatabase(json, onEnd){
                var idList = json.idList || [],
                    details = [],
                    promise = new _Promise();
                
                idList.forEach(function(id){
                        _deleteCard(id)
                        .then(function(){
                                details.push(id);
                                if (details.length === idList.length){
                                        promise.fulfill();
                                }
                        },
                        function(){
                                promise.reject(id);
                        });      
                });
                
                promise.then(function(){
                        onEnd("ok");
                }, function(failed){
                        onEnd(failed);
                });
        };
        
        /*
         * Share a deck with a list of users
         */
        this.shareDeck = function shareDeck(json, onEnd){
                var idList = json.idList || [],
                    deckId = json.docId,
                    details = [],
                    promise = new _Promise();
                
                idList.forEach(function(id){
                        var cdb = new _CouchDBDocument();
                        _getDocAsAdmin(id, cdb)
                        .then(function(){
                                var decks = cdb.get("custom_decks").concat();
                                decks.push(deckId);
                                cdb.set("custom_decks", decks);
                                return _updateDocAsAdmin(id, cdb);
                        })
                        .then(function(){
                                details.push(id);
                                if (details.length === idList.length){
                                        promise.fulfill();
                                }
                        },
                        function(){
                                promise.reject(id);
                        });      
                });
                
                promise.then(function(){
                        onEnd("ok");
                }, function(failed){
                        onEnd(failed);
                });
        };
        
        /*
         * Delete a user deck from user's library (and/or remove entirely as applicable)
         */
        this.deleteDeck = function deleteDeck(json, onEnd){
                var deckId = json.id,
                    userId = json.userid,
                    deckView = new _CouchDBView(),
                    deckCDB = new _CouchDBDocument();
                
                _getViewAsAdmin("library", "decksinuse", {key: '"'+deckId+'"'}, deckView)
                .then(function(){
                        if (deckView.getNbItems()){
                                // simply remove deck from user document
                                onEnd("ok");     
                        }
                        else{
                                _getDocAsAdmin(deckId, deckCDB)
                                .then(function(){
                                        var allCards = [], content = deckCDB.get("content"), trans = deckCDB.get("translations") || {}, i;
                                        // check if deck has been shared with at least an other user
                                        if (deckCDB.get("sharedwith") && deckCDB.get("sharedwith").length){
                                                // simply remove deck from user document
                                                onEnd("ok");
                                        }               
                                        else{
                                                // remove deck from database and all cards attached only to this deck
                                
                                                // first get all cards (including translations if any...)
                                                ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                                        content[type].forEach(function(id){
                                                                if (id !== "newcard") allCards.push(id);        
                                                        }); 
                                                });
                                
                                                for (i in trans){
                                                        if (trans[i] && trans[i].content){
                                                                ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                                                        var arr = trans[i].content[type];
                                                                        arr.forEach(function(id){
                                                                                if (id !== "newcard") allCards.push(id);        
                                                                        });        
                                                                });
                                                        }          
                                                }
                                
                                                // remove deck reference in card document or card document altogether
                                                allCards.forEach(function(cardId){
                                                        _updateCard(cardId, deckId);
                                                });
                                
                                                // before removing deck, also remove its logo from the server
                                                if (deckCDB.get("picture_file") === "decklogo"){
                                                        _deleteAttachment("deck", deckCDB.get("_id"), function(result){
                                                                if (result !== "ok"){
                                                                        console.log("result");
                                                                }
                                                        });
                                                }
                                
                                                // finally update the user document and remove the deck document from the database
                                                _removeDocAsAdmin(deckId, deckCDB)
                                                .then(function(){
                                                        onEnd("ok");        
                                                });
                                        }
                                });        
                        }       
                });
        };

        /*
         * Retrieve a given list of favorite ideas
         */
        this.getFavList = function getFavList(json, onEnd){
                var cdbView = new _CouchDBView();
                _getBulkView("library", "allideas", json.idList, cdbView)
                .then(function(){
                        onEnd(cdbView.toJSON());
                });
        };
        
        /*
         * Check if a new user is registering after an invitation
         */
         this.checkInvited = function(id, onEnd){
                _transport.request("CouchDB", {
                        method : "GET",
                        path:"/ideafy_invites/"+id,
                        auth: _cdbAdminCredentials,
                        agent:false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json._id) {
                                onEnd(json);
                        }
                        else {
                                onEnd(false);
                        }
                });        
           };
           
           /*
            * Add a user to the invitation database
            */
           this.addInvited = function(id, cdbDoc){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "PUT",
                        path:"/ideafy_invites/"+id,
                        auth: _cdbAdminCredentials,
                        agent:false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        },
                        data: cdbDoc.toJSON()
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                promise.fulfill();
                        } else {
                                promise.reject();
                        }});
                
                return promise;        
           };
           
           /*
            * Retrieve avatar of a given user
            */
            this.getAvatar = function(json, onEnd){
                        var _file, _cdb = new _CouchDBView();
                        _cdb.setTransport(_transport);
                        
                        _getViewAsAdmin('users', 'short', {key:'"'+json.id+'"'}, _cdb).then(function(){
                                var _image = _cdb.get(0).value.picture_file;
                        
                                // if user avatar is one of the default choices then return path (available in local files)
                                if (_image.search("img/avatars/deedee")>-1){
                                        onEnd(_image);
                                }
                                // otherwise return file located in attachments directory (should already be base64)
                                else {
                                        _file = __dirname+"/attachments/avatars/"+_image;
                                        fs.readFile(_file, 'utf8', function (error, data){
                                                if (data){
                                                        onEnd(data);  
                                                }
                                                else {
                                                        console.log(error);
                                                        onEnd({"error": error});
                                                }        
                                        });      
                                }
                        });
        };
        
        /*
         * Retrieve a given user profile information
         */
        this.getUserDetails = function(json, onEnd){
                var cdb = new _CouchDBDocument();
                _getDocAsAdmin(json.userid, cdb).then(function(){
                        // check privacy settings
                        var privacy = 0, contacts = 0, i, l, result={};
                        if (cdb.get("settings") && cdb.get("settings").privacy_lvl) privacy = cdb.get("settings").privacy_lvl;
                        
                        // return user basic info, stats and score
                        result._id = cdb.get("_id");
                        result.privacy = privacy;
                        result.firstname = cdb.get("firstname");
                        result.lastname = cdb.get("lastname");
                        result.username = cdb.get("username");
                        result.intro = cdb.get("intro");
                        result.ip = cdb.get("ip");
                        result.achievements = cdb.get("achievements");
                        result.ideas_count = cdb.get("ideas_count");
                        result.su_sessions_count = cdb.get("su_sessions_count");
                        result.mu_sessions_count = cdb.get("mu_sessions_count");
                        result.twoquestions_count = cdb.get("twoquestions_count");
                        
                        for (i=0, l=cdb.get("connections").length; i<l; i++){
                                if (cdb.get("connections")[i].type === "user") contacts++;
                        }
                        result.contacts = contacts;
                        
                        if (privacy >= 1){
                        }
                        if (privacy >=2){
                                
                        }
                        onEnd(result);
                });
        };
        
        /*
         * Retrieve a user's grade information
         */
        this.getGrade = function(json, onEnd){
                var cdb = new _CouchDBDocument(), leadercdb = new _CouchDBView(), arr, dis, res={grade:null, distinction:null};
                _getDocAsAdmin("GRADES", cdb).then(function(){
                        arr = cdb.get(json.lang).grades;
                        dis = cdb.get(json.lang).distinctions;
                        for(i=0, l=arr.length; i<l; i++){
                                if (json.ip >= arr[i].min_score) res.grade=arr[i];        
                        }
                        // check ranking
                        return _getViewAsAdmin("users", "leaderboard", {descending:true, limit:100}, leadercdb);
                })
                .then(function(){
                        var leaders = JSON.parse(leadercdb.toJSON()), l = leaders.length, i = 0;
                        if (json.ip === leaders[0].key && json.ip >= arr[3].min_score) {
                                res.distinction = dis[5];
                        }
                        else if (json.ip == leaders[1].key && json.ip >= arr[3].min_score){
                                res.distinction = dis[4];
                        }
                        else if (json.ip == leaders[2].key && json.ip >= arr[3].min_score){
                                res.distinction = dis[3];
                        }
                        else {
                                i = Math.min(l-1,9);
                                if (json.ip >= leaders[i].key && json.ip >= arr[5].min_score){
                                        res.distinction = dis[2];
                                }
                                else{
                                        i = Math.min(l-1, 19);
                                        if (json.ip >= leaders[i].key && json.ip >= arr[4].min_score){
                                                res.distinction = dis[1];
                                        }
                                        else {
                                                i = Math.min(l-1, 99);
                                                if (json.ip >= leaders[i].key && json.ip >= arr[3].min_score) {
                                                        res.distinction = dis[0];
                                                }
                                        }
                                }
                        }
                        onEnd(res);
                }); 
        };
        
        // retrieve a user's achievements
        this.getAchievements = function(json, onEnd){
                // start by fecthing the user document
                var userCDB = new _CouchDBDocument(), // user doc
                    userIdeasCDB = new _CouchDBView(), // all public ideas crafted by user
                    ssCDB = new _CouchDBView(), // all single sessions completed by user
                    msCDB = new _CouchDBView(), // all multi-user sessions initiated by user
                    questionsCDB = new _CouchDBView(), // all twoquestions asked by user
                    userRewards = new _CouchDBDocument(), // user rewards doc
                    achievementsCDB = new _CouchDBDocument(), // all achievements available
                    user = {},
                    achievements = {},
                    result = [],
                    update = false,
                    now = new Date(),
                    date = [now.getFullYear(), now.getMonth(), now.getDate()];
                    
                _getDocAsAdmin(json.userid, userCDB).then(function(){
                        // set user
                        user = JSON.parse(userCDB.toJSON());
                        // get user rewards document
                        return _getDocAsAdmin(json.userid+"_rewards", userRewards);
                })
                .then(function(){
                        // get achievements and retrieve the appropriate language
                        return _getDocAsAdmin("ACHIEVEMENTS", achievementsCDB);
                })
                .then(function(){
                        achievements = achievementsCDB.get(json.lang);
                        // check completed achievements
                        //1. profile complete
                        if (user.profile_complete && _badges.profile) {
                                if (!userRewards.get("profilecomplete")){
                                        user.ip += achievements.profilecomplete.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.profilecomplete});
                                        userRewards.set("profilecomplete", 1);
                                        update = true;
                                }
                                result.push(achievements.profilecomplete);
                        }
                        //2. tutorial complete
                        if (user.tutorial_complete && _badges.tutorial){
                                if (!userRewards.get("tutorialcomplete")){
                                        user.ip += achievements.tutorialcomplete.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.tutorialcomplete});
                                        userRewards.set("tutorialcomplete", 1);
                                        update = true;
                                }
                                result.push(achievements.tutorialcomplete);
                        }
                        //3. use as character
                        if (user.settings.useascharacter && _badges.useascharacter){
                                if (!userRewards.get("playthegame")){
                                        user.ip += achievements.playthegame.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.playthegame});
                                        userRewards.set("playthegame", 1);
                                        update = true;
                                }
                                result.push(achievements.playthegame);
                        }//Check user ideas (public ones)
                        return _getViewAsAdmin("achievements", "publicideas", {key: '"'+json.userid+'"'}, userIdeasCDB);
                })
                .then(function(){
                        var idea_count = userIdeasCDB.getNbItems();
                        // update user doc if needed
                        if (user.ideas_count !== idea_count){
                                user.ideas_count = idea_count;
                                update = true;        
                        }
                                                
                        //4, 5, 6, 7. If user has published at least 5, 25, 100, 250 ideas
                        _badges.ideaThresholds.forEach(function(val){
                                if (idea_count >= val){
                                        if (!userRewards.get("ideas"+val)){
                                                user.ip += achievements["ideas"+val].reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements["ideas"+val]});
                                                userRewards.set("ideas"+val, 1);
                                                update = true;
                                        }
                                        result.push(achievements["ideas"+val]);
                                }        
                        });
                        // Check for hall of fame ideas
                        userIdeasCDB.loop(function(v,i){
                                var rating, vlength;
                                if (v.votes) {vlength = v.votes.length;}
                                //8. 100 votes and minimum grade of 3.5
                                if (vlength >= _badges.bronzeVotes){
                                        rating = Math.round(v.votes.reduce(function(x,y){return x+y;})/vlength*100)/100;
                                        if (rating >= _badges.bronzeRating){
                                                if (!userRewards.get("bronzeacorn")){
                                                        user.ip += achievements.bronzeacorn.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.bronzeacorn});
                                                        userRewards.set("bronzeacorn", 1);
                                                                update = true;
                                                }
                                                result.push(achievements.bronzeacorn);        
                                        } 
                                        //9. 500 votes and minimum grade of 4
                                        if (vlength >= _badges.silverVotes && rating >= _badges.silverRating){
                                                if (!userRewards.get("silveracorn")){
                                                        user.ip += achievements.silveracorn.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.silveracorn});
                                                        userRewards.set("silveracorn", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.silveracorn);        
                                        }     
                                        //10. 1000 votes and minimum grade of 4.5
                                        if (vlength >= _badges.goldVotes && rating >= _badges.goldRating){
                                                if (!userRewards.get("goldenacorn")){
                                                        user.ip += achievements.goldenacorn.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.goldenacorn});
                                                        userRewards.set("goldenacorn", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.goldenacorn);        
                                        }     
                                }
                        });
                        // check session achievements
                        return _getViewAsAdmin("achievements", "singlesessions", {key: '"'+json.userid+'"'}, ssCDB);
                })
                .then(function(){
                        var ss_count = ssCDB.getNbItems();
                        // update user doc if needed
                        if (user.su_sessions_count !== ss_count){
                                user.su_sessions_count = ss_count;
                                update = true;
                        }
                        //11. If user has completed at least 5 single user sessions
                        if (ss_count >= _badges.suSessionThresholds[0]){
                                if (!userRewards.get("easybrainstormer")){
                                        user.ip += achievements.easybrainstormer.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.easybrainstormer});
                                        userRewards.set("easybrainstormer", 1);
                                        update = true;
                                }
                                result.push(achievements.easybrainstormer);
                                //12. If user has completed at least 20 single user sessions
                                if (ss_count >= _badges.suSessionThresholds[1]){
                                        if (!userRewards.get("mindstormer")){
                                                user.ip += achievements.mindstormer.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.mindstormer});
                                                userRewards.set("mindstormer", 1);
                                                update = true;
                                        }
                                        result.push(achievements.mindstormer);
                                        //13. If user has completed at least 50 single user sessions
                                        if (ss_count >= _badges.suSessionThresholds[2]){
                                                if (!userRewards.get("mastermindstormer")){
                                                        user.ip += achievements.mastermindstormer.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.mastermindstormer});
                                                        userRewards.set("mastermindstormer", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.mastermindstormer);
                                        }
                                }
                        }
                       // do the same with multi-user sessions
                       return _getViewAsAdmin("achievements", "multisessions", {key: '"'+json.userid+'"'}, msCDB);
                })
                .then(function(){
                        var ms_count = msCDB.getNbItems();
                        // update user doc if needed
                        if (user.mu_sessions_count !== ms_count){
                                user.mu_sessions_count = ms_count;
                                update = true;
                        }
                        //14. If user has initiated and completed at least 5 multi user sessions
                        if (ms_count >= _badges.muSessionThresholds[0]){
                                if (!userRewards.get("guide")){
                                        user.ip += achievements.guide.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.guide});
                                        userRewards.set("guide", 1);
                                        update = true;
                                }
                                result.push(achievements.guide);
                                //15. If user has initiated and completed at least 10 multi user sessions
                                if (ms_count >= _badges.suSessionThresholds[1]){
                                        if (!userRewards.get("leader")){
                                                user.ip += achievements.leader.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.leader});
                                                userRewards.set("leader", 1);
                                                update = true;
                                        }
                                        result.push(achievements.leader);
                                        //16. If user has initiated and completed at least 25 multi user sessions
                                        if (ms_count >= _badges.suSessionThresholds[2]){
                                                if (!userRewards.get("mindweaver")){
                                                        user.ip += achievements.mindweaver.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.mindweaver});
                                                        userRewards.set("mindweaver", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.mindweaver);
                                        }
                                }
                        }                               
                        // check twoquestions achievements
                        return _getViewAsAdmin("achievements", "twoquestions", {key: '"'+json.userid+'"'}, questionsCDB);
                })
                .then(function(){
                        var tq_count = questionsCDB.getNbItems();
                         // update user doc if needed
                        if (user.twoquestions_count !== tq_count){
                                user.twoquestions_count = tq_count;
                                update = true;
                        }
                        //17. If user has asked at least 5 twoquestions
                        if (tq_count >= _badges.tqThresholds[0]){
                                if (!userRewards.get("curious")){
                                        user.ip += achievements.curious.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.curious});
                                        userRewards.set("curious", 1);
                                        update = true;
                                }
                                result.push(achievements.curious);
                                //18. If user has asked at least 15 twoquestions
                                if (tq_count >= _badges.tqThresholds[1]){
                                        if (!userRewards.get("puzzled")){
                                                user.ip += achievements.puzzled.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.puzzled});
                                                userRewards.set("puzzled", 1);
                                                update = true;
                                        }
                                        result.push(achievements.puzzled);
                                        //19. If user has asked at least 50 twoquestions
                                        if (tq_count >= _badges.tqThresholds[2]){
                                                if (!userRewards.get("whyarewehere")){
                                                        user.ip += achievements.whyarewehere.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.whyarewehere});
                                                        userRewards.set("whyarewehere", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.whyarewehere);
                                        }
                                }
                        }
                        // finally check user document for twocent counts
                        //20. If user has posted at least 10 twocents
                        if (user.twocents_count >= _badges.tcThresholds[0]){
                                if (!userRewards.get("opinionator")){
                                        user.ip += achievements.opinionator.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.opinionator});
                                        userRewards.set("opinionator", 1);
                                        update = true;
                                }
                                result.push(achievements.opinionator);
                                //21. If user has posted at least 100 twocents
                                if (user.twocents_count >= _badges.tcThresholds[1]){
                                        if (!userRewards.get("feedbackartist")){
                                                user.ip += achievements.feedbackartist.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.feedbackartist});
                                                userRewards.set("feedbackartist", 1);
                                                update = true;
                                        }
                                        result.push(achievements.feedbackartist);
                                       //22. If user has posted at least 1000 twocents
                                        if (user.twocents_count >= _badges.tcThresholds[2]){
                                                if (!userRewards.get("chatterbox")){
                                                        user.ip += achievements.chatterbox.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.chatterbox});
                                                        userRewards.set("chatterbox", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.chatterbox);
                                                //23. If user has posted at least 5000 twocents
                                                if (user.twocents_count >= _badges.tcThresholds[3]){
                                                        if (!userRewards.get("allday")){
                                                                user.ip += achievements.allday.reward;
                                                                user.news.unshift({type: "RWD", date: date, content: achievements.allday});
                                                                userRewards.set("allday", 1);
                                                                update = true;
                                                        }
                                                        result.push(achievements.allday);
                                                }
                                        }
                                }
                        }
                        if (update){
                                // update user rewards documents
                                _updateDocAsAdmin(userRewards.get("_id"), userRewards)
                                .then(function(){
                                        // update user doc (score and news) if necessary
                                        return _getDocAsAdmin(json.userid, userCDB);
                                })
                                .then(function(){
                                        userCDB.set("ip", user.ip);
                                        userCDB.set("ideas_count", user.ideas_count);
                                        userCDB.set("su_sessions_count", user.su_sessions_count);
                                        userCDB.set("mu_sessions_count", user.mu_sessions_count);
                                        userCDB.set("twoquestions_count", user.twoquestions_count);
                                        userCDB.set("news", user.news);
                                        userCDB.set("achievements", result);
                                        return _updateDocAsAdmin(json.userid, userCDB);
                                })
                                .then(function(){
                                        onEnd(result);
                                });
                        } 
                        else {onEnd(result);}      
                });      
        };
        
        // Bulk query to obtain user names from user ids
        this.getUserNames = function(json, onEnd) {

                var result = {}, list = json.list, options = {}, req, callback;

                /**
                 * Building a temporary solution before changes in couchDBStore (one bulk query of the view)
                 */

                // manually build the http request to couchDB
                options.hostname = _dbIP;
                options.port = _dbPort;
                options.method = "POST";
                options.auth = cdbAdminCredentials;
                options.path = "/"+_db+"/_design/users/_view/short";
                options.headers = {
                        "Content-Type" : "application/json"
                };
                options.data = JSON.stringify({
                        keys : list
                });

                /**
                * Http request callback, handles couchDB response
                * @param {Object} res the response
                */
                callback = function(res) {
                        var body = "";
                        res.on('data', function(chunk) {
                                body += chunk;
                        });

                        res.on('end', function() {
                                if (JSON.parse(body).rows.length === list.length){
                                        result = JSON.parse(body).rows;
                                        onEnd(result);
                                }
                                else {
                                        onEnd({error: "Error : one or more users not found in Ideafy"});
                                }
                        });
                };
                // emit the http request and the data
                req = http.request(options, callback);
                req.end(options.data, "utf8");
        };
};

exports.AppUtils = AppUtils;

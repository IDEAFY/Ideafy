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
            _transport, _db, _cdbAdminCredentials;
        
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
        
        this.setVar = function(transport, db, credentials){
                _transport = transport;
                _db = db;
                _cdbAdminCredentials = credentials;
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
        
};

exports.AppUtils = AppUtils;

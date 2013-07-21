/*
 * Application handlers
 */

var fs = require("fs");

function AppUtils(){
        var _Promise, _CouchDBDocument,
            _updateUserIP, _updateDocAsAdmin, _getDocAsAdmin, _createDocAsAdmin, _getViewAsAdmin, _removeDocAsAdmin;
        
        this.setConstructors = function(CouchDBDocument, Promise){
                _CouchDBDocument = CouchDBDocument;
                _Promise = Promise;
        }
        
        this.setCDBAdmin = function(cdbAdmin){
                _cdbAdmin = cdbAdmin;
                _updateUserIP = _cdbAdmin.updateUserIP;
                _updateDocAsAdmin = _cdbAdmin.updateDoc;
                _getDocAsAdmin = _cdbAdmin.getDoc;
                _createDocAsAdmin = _cdbAdmin.getDoc;
                _getViewAsAdmin = _cdbAdmin.getView;
                _removeDocAsAdmin = _cdbAdmin.removeDoc;      
        };
        
        
        /*
         * Update a card after one of its deck container was removed form database
         */
        this.updateCard = function(cardId, deckId){
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
                                }, this);
                        }
                        
                        else {
                              // delete card and attachment
                              if (cardCDB.get("picture_file") === cardCDB.get("_id")){
                                      this.deleteAttachment("card", cardCDB.get("_id"));
                              }
                              
                              _removeDocAsAdmin(cardId, cardCDB)
                              .then(function(){
                                        promise.fulfill();        
                              }, this)
                        }
               }, this);
                
                return promise;        
        };
        
        /*
         * Delete an attachment file from the server (/shared directory)
         */
        this.deleteAttachment = function(type, filename, onEnd){
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
         * Remove a deleted deck from a user document
         */
        this.removeDeckFromUserDoc = function(deckid, userid){
                var userCDB = new _CouchDBDocument(),
                    promise = new _Promise();
                
                _getDocAsAdmin(userid, userCDB)
                .then(function(){
                        var custom = userCDB.get("custom_decks");
                        custom.splice(custom.indexOf(deckid), 1);
                        userCDB.set("custom_decks", custom);
                        return _updateDocAsAdmin(userid, userCDB);
                }, this)
                .then(function(){
                        promise.fulfill();
                }, this)
                
                return promise;       
        };
        
        /*
         * HANDLERS
         */
        
        /*
         * Delete a user deck from user's library (and/or remove entirely as applicable)
         */
        this.deleteDeck = function(json, onEnd){
                var deckId = json.id,
                    userId = json.userid,
                    deckCDB = new _CouchDBDocument();
                
                _getDocAsAdmin(deckId, deckCDB)
                .then(function(){
                        var allCards = [], content = deckCDB.get("content"), trans = deckCDB.get("translations"), i;
                        // check if deck has been shared with at least an other user
                        if (deckCDB.get("sharedwith").length){
                                // simply remove deck from user document
                                this.removeDeckFromUserDoc(deckId, userId)
                                .then(function(){
                                        onEnd("ok");
                                }, this)
                        }
                        else{
                                // remove deck from database and all cards attached only to this deck
                                
                                // first get all cards (including translations if any...)
                                ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                        allCards = allCards.concat(content[type]);        
                                });
                                
                                for (i in trans){
                                        ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                                allCards = allCards.concat(trans[i].content[type]);        
                                        }, this);          
                                }
                                
                                // remove deck reference in card document or card document altogether
                                allCards.forEach(function(cardId){
                                        this.updateCard(cardId, deckId);
                                }, this);
                                
                                // before removing deck, also remove its logo from the server
                                if (deckCDB.get("picture_file") && deckCDB.get("picture_file") === "decklogo"){
                                        this.deleteAttachment("deck", deckCDB.get("_id"), function(result){
                                                if (result !== "ok"){
                                                        console.log("result");
                                                }
                                        });
                                }
                                
                                // finally update the user document and remove the deck document from the database
                                this.removeDeckFromUserDoc(deckId, userId)
                                .then(function(){
                                        return _removeDocAsAdmin(deckId, deckCDB)
                                }, this)
                                .then(function(){
                                        onEnd("ok");        
                                }, this);
                        }
                }, this);
        };
}

exports.AppUtils = AppUtils;

/*
 * Application handlers
 */

var fs = require("fs");

function AppUtils(){
        var _Promise, _CouchDBDocument,
            _updateUserIP, _updateDocAsAdmin, _getDocAsAdmin, _createDocAsAdmin, _getViewAsAdmin, _removeDocAsAdmin,
            _getBulkView, _updateCard, _deleteAttachment, _deleteCard;
        
        this.setConstructors = function(CouchDBDocument, CouchDBView, Promise){
                _CouchDBDocument = CouchDBDocument;
                _CouchDBView = CouchDBView;
                _Promise = Promise;
        };
        
        this.setCDBAdmin = function(cdbAdmin){
                _cdbAdmin = cdbAdmin;
                _updateUserIP = _cdbAdmin.updateUserIP;
                _updateDocAsAdmin = _cdbAdmin.updateDoc;
                _getDocAsAdmin = _cdbAdmin.getDoc;
                _createDocAsAdmin = _cdbAdmin.getDoc;
                _getViewAsAdmin = _cdbAdmin.getView;
                _getBulkView = _cdbAdmin.getBulkView;
                _removeDocAsAdmin = _cdbAdmin.removeDoc;      
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
};

exports.AppUtils = AppUtils;

/*
 * Application handlers
 */

var fs = require("fs");

function AppUtils(){
        var _Promise, _CouchDBDocument,
            _updateUserIP, _updateDocAsAdmin, _getDocAsAdmin, _createDocAsAdmin, _getViewAsAdmin;
        
        this.setCDBAdmin = function(cdbAdmin){
                _cdbAdmin = cdbAdmin;
                _CouchDBDocument = _cdbAdmin._CouchDBDocument;
                _updateUserIP = _cdbAdmin.updateUserIP,
                _updateDocAsAdmin = _cdbAdmin.updateDoc,
                _getDocAsAdmin = _cdbAdmin.getDoc,
                _createDocAsAdmin = _cdbAdmin.getDoc,
                _getViewAsAdmin = _cdbAdmin.getView        
        };
        
        this.deleteCard = function(cardId){
                
        };
        
        this.deleteAttachment = function(type, filename, onEnd){
                var _path;
                (type === "deck") ? _path = __dirname+'/attachments/decks/'+filename : _path = __dirname+'/attachments/cards/'+filename;
                
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

        this.deleteDeck = function(json, onEnd){
                var deckId = json.id,
                    userId = json.userid,
                    deckCDB = new _CouchDBDocument();
                
                _getDocAsAdmin(deckId, deckCDB)
                .then(function(){
                        console.log("delete function", deckCDB.toJSON());
                })
                        
        };
}

exports.AppUtils = AppUtils;

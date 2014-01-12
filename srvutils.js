/**
 * IDEAFY -- server-side utilities
 * ===============================
 * 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2013-2014 TAIAUT
 * 
 */

var fs = require("fs");

function SrvUtils(){

        this.setVar = function (contentPath, currentVersion) {
                _contentPath = contentPath;
                _currentVersion = currentVersion;
        };
        
        /*
        * CheckVersion handler : to test if client version is the most current one
        */
        this.checkVersion = function(json, onEnd){
                if (json.version < _currentVersion){
                        onEnd("outdated");
                }
                if (json.version > _currentVersion){
                        console.log("test version");
                }
        };

        /*
        * GetFile : used to retrieve avatar pictures or attachments such as session postits or deck pictures
        */

        this.getFile = function(json, onEnd){
                var dir = json.dir || json.sid,
                    _filename =  _contentPath+'/attachments/'+ dir+'/'+json.filename;
                    
                fs.readFile(_filename, 'utf8', function(error, data){
                        if (data){
                                onEnd(data);
                        }
                        else {
                                console.log(error);
                                onEnd({"error": error});
                        }                
                });
        };        

        /*
        * GetLabels : used to read a localization file on the server
        */

        this.getLabels = function(json, onEnd){
                var _path = __dirname+'/i8n/'+json.lang+'.json';
                fs.exists(_path, function(exists){
                        if (exists){
                                var labels=fs.readFile(_path, 'utf8', function(err, data){
                                        onEnd(JSON.parse(data));        
                                });
                        }
                        else{
                                onEnd("nok");
                        }    
                });
        };
        
        /*
         * GetLanguages : check all available languages
         */
        
        this.getLanguages = function(json, onEnd){
                fs.readdir(__dirname+'/i8n/', function(err, list){
                        var res = [];
                        if (err) {onEnd(err);}
                        else {
                                list.forEach(function(file){
                                        res.push(file.substr(0,5));        
                                });
                                onEnd(res);
                        }
                });
        };
        
        /*
         * Clean up attachments from drive when user deletes a session
         */
        this.cleanUpSession = function(id, onEnd){
                var _path = _contentPath+'/attachments/'+id;
                
                fs.exists(_path, function(exists){
                        if (exists){
                                // need to delete all files first
                                fs.readdirSync(_path).forEach(function(file){
                                        fs.unlink(path.join(_path, file));
                                });
                                fs.rmdirSync(_path); 
                        }
                        onEnd("ok");
                });        
        };
        
        /*
         * Delete attachment from drive
         */
        this.deleteAttachment = function(json, onEnd){
                var _path = _contentPath+'/attachments/';
                
                switch(json.type){
                        case "card":
                                _path += "cards/";
                                break;
                        default:
                                break;
                };
                _path += json.file;
                fs.exists(_path, function(exists){
                        if (exists){
                                // need to delete all files first
                                fs.unlink(_path, function(err){
                                        i(err) ? onEnd(err) : onEnd("ok");
                                });
                        }
                        else onEnd("file not found");
                });
         };

}
        
exports.SrvUtils = SrvUtils;

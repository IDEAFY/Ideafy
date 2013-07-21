/*
 * Utility handlers
 */

var fs = require("fs");

function SrvUtils(){ 
        
        this.setCurrentVersion = function (currentVersion) {
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

        this.getFile  = function(json, onEnd){
                var dir = json.dir || json.sid,
                     _filename =  '/shared/attachments/'+ dir+'/'+json.filename;
                    
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
}
        
exports.SrvUtils = SrvUtils;

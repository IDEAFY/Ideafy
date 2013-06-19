/*
 * Utility handlers
 */

var fs = require("fs");


/*
 * CheckVersion handler : to test if client version is the most current one
 */
function CheckVersion() {
        this.setCurrentVersion = function (currentVersion) {
                _currentVersion = currentVersion;
        };
        
        this.handler = function(json, onEnd){
                if (json.version < _currentVersion){
                        onEnd("outdated");
                }
                if (json.version > _currentVersion){
                        console.log("test version");
                }
        };
}

exports.CheckVersion = CheckVersion;

/*
 * GetFile : used to retrieve avatar pictures or attachments such as session postits or deck pictures
 */

function GetFile() {
        this.handler = function(json, onEnd){
                var dir = json.dir || json.sid,
                    _filename =  __dirname+'/attachments/'+ dir+'/'+json.filename;
                    
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
}

exports.GetFile = GetFile;

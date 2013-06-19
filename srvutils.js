/*
 * Utility handlers
 */


/*
 * CheckVersion handler : to test if client version is the most current one
 */
function CheckVersion() {
        this.setCurrentVersion = function (currentVersion) {
                _currentVersion = currentVersion;
        };
        
        this.handler = function(json, onEnd){
                if (json.version < currentVersion){
                        onEnd("outdated");
                }
                if (json.version > currentVersion){
                        console.log("test version");
                }
        };
}

exports.CheckVersion = CheckVersion;

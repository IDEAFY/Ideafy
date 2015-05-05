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

var fs = require("fs"),
      qs = require("querystring"),
      mime = require("mime");

function SrvUtils(){

        this.setVar = function (contentPath, currentVersion) {
                _contentPath = contentPath;
                _currentVersion = currentVersion;
        };
        
        /*
         * Upload function for avatars and various attachments
         */
        this.uploadFunc = function(req, res){
                var type = req.body.type,
                      _path = _contentPath+'/attachments/',
                      filename, // final name of the file on server
                      tempname, // temp name after file upload
                      dataurl, ins, outs,
                      dir;
                if (type === 'postit' || type === 'deckpic' || type === 'cardpic'){
                        dir = req.body.dir;
                        filename = _path+dir+'/'+req.body.filename;
                        dataurl = req.body.dataString;
                                
                        fs.exists(_path+dir, function(exists){
                                if (!exists) {
                                        fs.mkdir(_path+dir, 0777, function(err){
                                                if (err) {throw(err);}
                                                fs.writeFile(filename, dataurl, function(err){
                                                        if (err) {throw(err);}
                                                        res.write("ok");
                                                        res.end();
                                                });
                                        });
                                }
                                else {
                                        fs.exists(filename, function(exists){
                                                if (exists) fs.unlinkSync(filename);
                                                fs.writeFile(filename, dataurl, function(err){
                                                        if (err) {throw(err);}
                                                                res.write("ok");
                                                                res.end();
                                                });   
                                        });
                                }       
                        });
                }
                if (type === 'afile'){
                        dir = req.body.dir;
                        filename = _path+dir+'/'+req.body.filename;
                        fs.exists(_path+dir, function(exists){
                                if (!exists) {
                                        fs.mkdir(_path+dir, 0777, function(err){
                                                if (err) {throw(err);}
                                                ins = fs.createReadStream(req.files.userfile.path);
                                                outs = fs.createWriteStream(filename);
                                                ins.pipe(outs);
                                               
                                               // delete tmp file when done
                                                ins.once('end', function(){
                                                        fs.unlink(req.files.userfile.path, function(err){
                                                                console.log(err);
                                                        });
                                                        res.write("ok");
                                                        res.end(); 
                                                });
                                        });
                                }
                                else {
                                        fs.exists(filename, function(exists){
                                                if (exists) fs.unlinkSync(filename);
                                                ins = fs.createReadStream(req.files.userfile.path);
                                                outs = fs.createWriteStream(filename);
                                                ins.pipe(outs);
                                                
                                                // delete tmp file when done
                                                ins.once('end', function(){
                                                        fs.unlink(req.files.userfile.path, function(err){
                                                                if (err) console.log(err);
                                                        });
                                                        res.write("ok");
                                                        res.end(); 
                                                });
                                        });
                                }       
                        });
                }
                if (type === 'avatar'){
                        filename = _path+'avatars/'+req.body.filename;
                        dataurl = req.body.img;
												fs.exists(filename, function(exists){
                                if (exists) {
                                        fs.unlinkSync(filename);
                                }
                                fs.writeFile(filename, dataurl, function(err){
                                        if (err) {
                                                throw(err);
                                        }
                                        else{
                                                res.write("ok");
                                                res.end();
                                        }
                                });
                        });
                }
        };

        /*
         * Upload function for avatars and various attachments
         */
        this.downloadFunc = function(req, res){
                var query = req.url.replace('/?', ""),
                      file = qs.parse(query),
                      path = _contentPath+"/attachments/",
                      rs, mimetype;
                 
                 switch(file.atype){
                        case "idea":
                                path += "ideas/";
                                break;
                        default:
                                break;        
                 };
                 
                 path += file.docid + "/" + file.file;
                 fs.exists(path, function(exists){
                        if (exists){
                                mimetype = mime.lookup(file.file);
                                res.setHeader('Content-disposition', 'attachment; filename=' + file.file);
                                res.setHeader('Content-type', mimetype);
                                rs = fs.createReadStream(path);
                                rs.pipe(res);   
                        }        
                 });
                       
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
                                /*
                                var labels=fs.readFile(_path, 'utf8', function(err, data){
                                        onEnd(JSON.parse(data));        
                                });
                                */
                               var data="";
                               var stream = fs.createReadStream(_path, {
                                        'flags': 'r',
                                        'encoding': 'utf8',
                                        'mode': 0666,
                                        'bufferSize': 4 * 1024
                                });
                                stream.on( "data", function(chunk) {
                                        data+=chunk;
                                });
                                stream.on( "close",function() {
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
                var _path = _contentPath+'/attachments/',
                      _dir;
                
                switch(json.type){
                        case "card":
                                _path += "cards/";
                                _dir = "";
                                break;
                        case "idea":
                                _dir = _path + "ideas/"+ json.docId ;
                                _path = _dir + "/";
                        default:
                                break;
                };
                _path += json.file;
                fs.exists(_path, function(exists){
                        if (exists){
                                // delete file first
                                fs.unlink(_path, function(err){
                                       if (err) onEnd(err);
                                       else{
                                               // if directory is empty, delete directory as well
                                               if (_dir && !fs.readdirSync(_dir).length){
                                                       fs.rmdirSync(_dir);
                                               }
                                               onEnd("ok");
                                       } 
                                });
                        }
                        else onEnd("file not found");
                });
         };
         
         /*
         * Retrieve attachment from drive
         */
        this.getAttachment = function(json, onEnd){
                var _path = _contentPath+'/attachments/',
                      _dir, _data;
                
                switch(json.type){
                        case "idea":
                                _dir = _path + "ideas/"+ json.docId ;
                                _path = _dir + "/";
                        default:
                                break;
                };
                _path += json.file;
                fs.exists(_path, function(exists){
                        var dest = __dirname + "/downloads/";
                        if (exists){
                                var rs = fs.createReadStream(path);
                                
                                 rs.on('data', function(chunk){
                                        data += chunk;        
                                });
                                
                                rs.on('close', function(){
                                        onEnd(data);
                                });
                        }
                        else onEnd("file not found");
                });
         };

}
        
exports.SrvUtils = SrvUtils;

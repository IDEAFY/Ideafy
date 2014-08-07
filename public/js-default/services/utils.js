/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("./emily"),
      CouchDBTools = require("../libs/CouchDBTools"),
      Config =require("./config"),
      Observable =emily.Observable,
      Promise = emily.Promise,
      LocalStore = olives.LocalStore,
      Transport = olives.SocketIOTransport,
      Store = CouchDBTools.CouchDBDocument;

var _utils = {},
      user = Config.get("user"),
      transport = Config.get("transport"),
      socket = Config.get("socket");
	
_utils.formatDate = function(array){
        var month = array[1] + 1;
	       
        if (user.get("lang").search("en") === 0){
	       return month + "/" + array[2] + "/" + array[0];
        }
        else {
	       if(month < 10) {
                        month = "0" + month;
                }
	       return array[2] + "/" + month + "/" + array[0];
        }
};
                
_utils.formatDateStamp = function(stamp){
        var date=new Date(stamp),
              array = [date.getFullYear(), date.getMonth()+1, date.getDate()];
                        
        return _utils.formatDate(array);
},

/*
* A function used to format a duration in days, hours, min and secs from a number of milliseconds
*/
_utils.formatDuration = function(duration){
        var d, days, hrs, min, sec, res;
                        
        if (duration){
                d = Math.round(duration/1000);
                days = Math.floor(d / 86400);
                hrs = Math.floor(d % 86400 / 3600);
                min = Math.floor(d % 86400 % 3600 / 60);
                sec =  Math.floor(d % 86400 % 3600 % 60);
                            
                days>0 ? res = days+"d ": res="";
                hrs>0 ? res += hrs+":" : res+="";
                min>0 ? res += (hrs>0 && min<10 ? "0":"")+min+":" : res+="0:";
                sec<10 ? res += "0"+sec : res+= sec;
        }
        else {
                res = "";
        }
        return res;
};
                
_utils.formatTime = function(time){
        var date = new Date(time),
              hrs = date.getHours(),
              min = date.getMinutes(),
              sec =  date.getSeconds(),
              res = "";
                           
        res += hrs+":";
        min>0 ? res += (hrs>0 && min<10 ? "0":"")+min+":" : res+="00:";
        sec<10 ? res += "0"+sec : res+= sec;
                                                
        return res;
};
        
/*
* Compute a time stamp from a date and/or time, adding time zone offset
*/
_utils.computeTimeStamp = function(date, time){
        var now = new Date(),
              offSet = now.getTimezoneOffset(),
              d = date ||now.getTime(),
              t = time || 0,
              stamp;
        stamp = d+t+offSet;
        return stamp;
};
		
/* 
* A function to display an abtract in a list, stopping at the end of the first sentence or truncating it if it
* goes beyond 140 characters
*/
_utils.displayFirstSentence = function(elementid, desc){
        var sentences = [];
        sentences = desc.split("."[0], 1);
        if (sentences[0].length > 140) {
	       elementid.innerHTML = sentences[0].substr(0,139).replace(/\w*\s(\S)*$/, ' ...');					
        }
        return elementid.innerHTML;
};

/*
* A function that truncates text (stops at a full word and adds ...)
*/
_utils.truncate = function(elementid, desc) {
        elementid.innerHTML = desc;
        while (elementid.scrollHeight > elementid.offsetHeight) {
	       var text = elementid.innerHTML;
	       elementid.innerHTML= text.replace(/\W*\s(\S)*$/, '...');
        }
        return elementid.innerHTML;
};

/*
* A function to display the rating
*/
_utils.setRating = function(node, rating){
        var img0 = "<img src = 'img/wall/disableIdeaVote.png'>",
              img05 = "<img src = 'img/wall/semi-activeIdeaVote.png'>",
              img1 = "<img src = 'img/wall/activeIdeaVote.png'>",
              res = "",
              i;
				
        if (!rating){
	       for (i=0; i<5; i++){
		      res = res + img0;
	       }
        }
        else {
	       i=0;
	       while (i<Math.floor(rating)){
		      res = res +img1;
		      i++;
	       }
	       if (i<5) {
		      Math.round(rating-Math.floor(rating)) ? res = res+img05 : res = res+img0;
		      i++;
	       }
	       while(i<5){
		      res = res +img0;
		      i++;
	       }
        }
        node.innerHTML = res;
};
        
/*
* A function to search string in an array and return array of matching value(s)
*/	
_utils.searchArray = function(array, s){
        var _keywords = s.toLowerCase().split(" "),
              _res = [], i, j, _s, _match;
			         
        for (i=0, l=array.length; i<l; i++){
	       // convert array item into string
	       _s = JSON.stringify(array[i]).toLowerCase();
	       _match = 0;
	       for (j=0; j<_keywords.length; j++){
		      if (_s.search(_keywords[j]) > -1) {_match++;}
		      else {break;}
	       }
	       if (_match === _keywords.length){
		      _res.push(array[i]);
	       }   
        }
        return _res;
};
        
/*
* A function to sort an array of objects according to a property
*/       
_utils.sortByProperty = function(array, prop, descending){
        // need a special treatment for certain properties
        switch(prop){
	       case "idea":
		      // sort array by ideas title (idea is an array of objects [{"title": "..", ..}, {"title": "..", ..}])
		      array.sort(function(x,y){
			     var _x = x[prop], _y = y[prop],
			           a,b;  // variables used for actual comparison
			     if (descending){    
			             if (!_x || !(_x instanceof Array) || !_x.length) {a="";}
			             else {
			                     // sort _x array by title
			                     _utils.sortByProperty(_x, "title", true);
			                     // use the first idea title for comparison
			                     a = _x[0].title;
			             }
			             if (!_y || !(_y instanceof Array) || !_y.length) {b="";}
			             else {
			                     _utils.sortByProperty(_y, "title", true);
			                     b = _y[0].title;
			             }
			             if (a<b) {return 1;}
			             if (a>b) {return -1;}
			             return 0;
                                }
                                else{
                                        if (!_x || !(_x instanceof Array) || !_x.length) {a="";}
                                        else {
                                                // sort _x array by title
                                                _utils.sortByProperty(_x, "title", false);
                                                // concatenate all idea titles into a string
                                                a = _x[0].title;
                                        }
                                        if (!_y || !(_y instanceof Array) || !_y.length) {b="";}
                                        else {
                                                _utils.sortByProperty(_y, "title", false);
                                                b = _y[0].title;
                                        }    
                                        if (a<b) {return -1;}
                                        if (a>b) {return 1;}
                                        return 0;        
                                }
                        });
                        break;
	       case "date":
		      array.sort(function(x,y){
			     var _dx = x[prop], _dy = y[prop],
			           d1 = new Date(_dx[0], _dx[1], _dx[2]),
			           d2 = new Date(_dy[0], _dy[1], _dy[2]);
			                             
			     if (descending){
			             if (d1<d2) {return 1;}
			             if (d1>d2) {return -1;}
			             return 0;
			     }
			     else {
			             if (d1<d2) {return -1;}
			             if (d1>d2) {return 1;}
			             return 0;
			     }
		      });
		      break;
	       default:
		      array.sort(function(x, y){
                                var _x = x[prop], _y=y[prop];
                                // should work even if the property is not defined or null for one of the array elements
                                if (typeof _x === "string" || typeof _y === "string"){
                                        if (_x && _x.toLowerCase) {_x=_x.toLowerCase();}
                                        if(_y && _y.toLowerCase) {_y=_y.toLowerCase();}
                                        if (descending){
                                                if (_x<_y) {return 1;}
                                                if (_x>_y) {return -1;}
                                                return 0;
                                        }
                                        else{
                                                if (_x<_y) {return -1;}
                                                if (_x>_y) {return 1;}
                                                return 0;        
                                        }  
                                }			             
			     else{
                                        if (descending){    
                                                if (_x<_y) {return 1;}
                                                if (_x>_y) {return -1;}
                                                return 0;
                                        }
                                        else{
                                                if (_x<_y) {return -1;}
                                                if (_x>_y) {return 1;}
                                                return 0;        
                                        }         
                                }
		      });
	               break;
        }
};
		
/**
* A function to upload a file on the server
* @Param {String} url the URL to send the file ot
* @Param {Object} body the data to upload
* @Param {Store} progress a store used to display upload progress
* @Param {function} onEnd the callback when the request is complete
*/
_utils.uploadFile = function(url, body, progress, onEnd){
        var req = new XMLHttpRequest();
                             
        req.open('POST', Config.get("location")+url);
        req.onreadystatechange = function(){
                if(req.readyState === 4 && onEnd){
                        onEnd(req);
                }
        };
        req.upload.onprogress = function(e){
                if(e.lengthComputable && progress){
                        progress.set("status", Math.round(e.loaded/e.total*100));
                }
        };
                             
        if (body.type === "afile"){
                req.setRequestHeader('content-type', 'multipart/form-data; boundary="--=====Ideafy=====--"');
                req.sendAsBinary(body);
        }
        else{
                req.send(body);
        }
                
        return req;
};
                  
/**
* A function to check the status of the server
* @Param none
* @Returns {Promise} promise 
*/
_utils.checkServerStatus = function(){
        var promise = new Promise(),
              req = new XMLHttpRequest();
        req.open('GET', Config.get("location"));
        req.onreadystatechange = function(){
                if(req.readyState === 4){
                        (req.status === 200) ? promise.fulfill() : promise.reject();
                }
        };
        req.send();
        return promise;
};	
		
/*
* Check socket status and reconnect if needed
*/
_utils.checkSocketStatus = function(){
        var sock = Config.get("socket"),
              obs = Config.get("observer");
        // reconnect socket if not connected
        if (!sock.socket.connected){
                sock.socket.connect(Config.get("location"));
                obs.notify("reconnect", "all");
        }
        // if socket is ok but user is offline reconnect user
        else if (!user.get("online")) obs.notify("reconnect", "user");              
};
                
/*
* Disconnect the socket
*/
_utils.disconnectSocket = function(){
        Config.get("socket").socket.disconnect();
        Config.get("observer").notify("disconnect");
};
                
/**
* A function to retrieve the labels in the desired language
* @Param {String} lang the desired language (ab-cd)
* @Returns {Promise} promise 
*/
_utils.updateLabels = function(lang) {
        var json = {"lang" : lang},
              local = new LocalStore(),
              labels = Config.get("labels"),
              promise = new Promise();
                   
        // retrieve ideafy-data
        local.sync("ideafy-data");
        transport.request("Lang", json, function(result) {
                if (result === "nok") {
                        local.set("labels", Config.get("defaultLabels"));
                        Config.set("lang", "en-us");
                }
                else {
                        local.set("labels", result);
                        Config.set("lang", result.language);
                }
                // save labels to local storage
                local.sync("ideafy-data");
                // apply language
                labels.reset(local.get("labels"));
                promise.fulfill();
        });
        return promise;
};
                
_utils.getAvatarById = function(id){
        var promise = new Promise,
              local = new LocalStore(),
              avatars = Config.get("avatars");
		      
        if (avatars.get(id) && (avatars.get(id) !== "in progress")){
	       promise.fulfill(avatars.get(id));
        }
        // prevent multiple requests to fetch the same avatar
        else if (avatars.get(id) === "in progress"){
	       avatars.watchValue(id, function(val){
		      if (val && val !== "in progress"){
		              promise.fulfill(val);
		      }        
	       });
        }
        else {
	       avatars.set(id, "in progress");
	       transport.request("GetAvatar", {id: id}, function(result){
	               if (result.error){
		              promise.reject();
	               }
	               else{
		              if (avatars.count() < 100){
		                      avatars.set(id, result);
		              }
		              else {
		                      var obj = avatars.toJSON(),
		                            arr = obj.keys();
		                      avatars.del(arr[0]);
		                      avatars.set(id, result);
		              }
		              promise.fulfill(result);
	               }      
	       });
        }
        return promise;
};
                 
_utils.getAvatarByFileName = function(filename, onEnd){
        transport.request("GetAvatar", {file: filename}, function(result){
                onEnd(result);    
        });         
};
	
/**
* A function to obtain grade information from the server based on user's score
* @Param {Number} ip the user's score
* @Param {Function} onEnd the callback
* @Returns {Object} result the grade information in the user's language
*/
_utils.getGrade = function(ip, onEnd){
        transport.request("GetGrade", {ip: ip, lang: user.get("lang")}, function(res){
	       onEnd(res);        
        });
};
        
/**
* A function to obtain a user's achievements from the server based on user's id
* @Param {String} userid the user's score
* @Param {Function} onEnd the callback
* @Returns {Object} result the grade information in the user's language
*/
_utils.getAchievements = function(userid, onEnd){
        transport.request("GetAchievements", {userid: userid, lang: user.get("lang")}, function(res){
                onEnd(res);
        });
};
                
/**
* A function to obtain details of a given user
* @Param {String} userid the user's score
* @Param {Function} onEnd the callback
* @Returns {Object} result the user information (based on user privacy settings)
*/
_utils.getUserDetails = function(userid, onEnd){
        transport.request("GetUserDetails", {userid: userid}, function(res){
                onEnd(res);
        });
};
                
/*
*  A function that extracts a list of all user contact ids from a user document
*/
_utils.getUserContactIds = function(){
        var res = [], contacts = user.get("connections").concat();
        contacts.forEach(function(contact){
                if (contact.type === "user") {res.push(contact.userid);}        
        });
        return res;
};
        
/*
*  A function that extracts a list of all contact usernames from a user document
*/
_utils.getContactUsernames = function(){
        var res = [], contacts = user.get("connections").concat();
        contacts.forEach(function(contact){
                if (contact.type === "user") {res.push(contact.username);}        
        });
        return res;
};
                
/*
* A function to check if user profile is completed
* @Param
* @Returns {Object} percentage and if applicable an array of string with the items that are missing
*/
_utils.checkProfileCompletion = function(){
        var labels = Config.get("labels"), res = {"percentage": 0, "missing":[]};
        if (user.get("firstname") && user.get("lastname")){ res.percentage += 10; }
        if (user.get("birthdate").length === 3){ res.percentage += 10; }
        else { res.missing.push(labels.get("enterbirthdate")); }
        if (user.get("family").couple !== null && user.get("family").children !== null) { res.percentage += 10 ;}
        else { res.missing.push(labels.get("enterfamily")); }
        if (user.get("address").city && user.get("address").country ) { res.percentage += 10; }
        else { res.missing.push(labels.get("enteraddress")); }
        if (user.get("intro") && user.get("intro") !== "Ideafyer") { res.percentage +=10; }
        else { res.missing.push(labels.get("enterintro")); }
        if (user.get("occupation").situation >= 0 && user.get("occupation").job && user.get("occupation").organization) { res.percentage +=10; }
        else { res.missing.push(labels.get("enteroccupation")); }
        if (user.get("leisure_activities")[0].name && user.get("leisure_activities")[1].name) {  res.percentage += 10; }
        else { res.missing.push(labels.get("enterleisure")); }
        if (user.get("interests")[0].name && user.get("interests")[1].name) { res.percentage += 10; }
        else { res.missing.push(labels.get("enterinterest")); }
        if (user.get("twitter") || user.get("facebook") || user.get("gplus") || user.get("linkedin")) { res.percentage += 10; }
        else { res.missing.push(labels.get("entersocialnw")); }
        if (user.get("picture_file").search("img/avatars/deedee") <0) { res.percentage += 10;}
        else { res.missing.push(labels.get("enterownpic")); }
        return res;
};
        
/*
* A function to convert a binary string to bytes
*/
_utils.stringToBytes = function( str ) {
        var ch, st, re = [], i, j=0, k;
        for (i = 0; i < str.length; i++ ) {
                ch = str.charCodeAt(i);  // get char 
                if (ch<127) re[j++] = ch & 0xFF;
                else{
                        st = [];                 // set up "stack"
                        do {
                                st.unshift( ch & 0xFF );  // push byte to stack
                                ch = ch >> 8;          // shift value down by 1 byte
                        }  
                        while ( ch );
                        // add stack contents to result
                        // done because chars have "wrong" endianness
                        for (k=0; k<st.length; k++) re[j++] = st[k];
                }
        }
        // return an array of bytes
        return re;
};
        
/*
* A function to change the style
*/
_utils.changeStyle = function(newStyle){
        var styleNode = document.querySelector(".currentStyle"),
              currentStyle = styleNode.getAttribute("href");
                        
        if (currentStyle !== "css/"+newStyle) styleNode.setAttribute("href", "css/"+newStyle);
};
        
/**
 * A function that listens to click/touches outside specified element
* @Param id the element id
* @Param callback a callback function
* returns
*/
_utils.exitListener = function(id, callback){
        var listener = function(e){
                var element;
                for (element = e.target; element; element = element.parentNode) {
                        if (element.id && element.id === id) {
                                return;
                        }
                }
                        
                // else allow touch events to display/close the notification list and do nothing if event target is an empty place in the dock
                 if (e.target.classList.contains("deedee") || e.target.classList.contains("notify-header") || e.target.classList.contains("exit-brainstorm") || e.target.classList.contains("dock-item")){
                        e.stopPropagation();
                        callback(e.target);        
                }       
        };
                
        document.addEventListener("mousedown", listener, true);
        return listener;      
};
        
/*
* A function that deletes an attachment file from the server
*/
_utils.deleteAttachmentFile = function(docId, fileName){
        var json={},
              promise = new Promise();
                
        if (docId.search("I:") === 0) json.type = "idea";
                
        json.docId = docId;
        json.file = fileName;
        transport.request("DeleteAttachment", json, function(res){
                (res === "ok") ? promise.fulfill() : promise.reject() ;     
        });
        return promise;       
};
        
/*
* A function that deletes an attachment document from the database
*/
_utils.deleteAttachmentDoc = function(docId){
        var promise = new Promise(),
              cdb = new Store();
        cdb.setTransport(transport);
        cdb.sync(Config.get("db"), docId)
        .then(function(){
                var type = "", id = cdb.get("docId");
                if (id.search("I:") === 0) type = "idea";
                return _utils.deleteAttachmentFile(type, id, cdb.get("fileName"));       
        })
        .then(function(){
                return cdb.remove();
        })
        .then(function(){
                promise.fulfill();
        });
        return promise;        
};
      
module.exports = _utils;
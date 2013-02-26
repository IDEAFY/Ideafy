/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */ 

define(["service/config", "Observable", "Promise", "Olives/LocalStore"], function(Config, Observable, Promise, LocalStore){
	return {
		formatDate : function(array){
			var month = array[1] + 1;
			if(month < 10) {
				month = "0" + month;
			}
			return array[2] + "/" + month + "/" + array[0];
		},


		/*
                 * A function used to format a duration in days, hours, min and secs from a number of milliseconds
                 */
                        
                formatDuration : function(duration){
                        var d = Math.round(duration/1000),
                            days = Math.floor(d / 86400),
                            hrs = Math.floor(d % 86400 / 3600),
                            min = Math.floor(d % 86400 % 3600 / 60),
                            sec =  Math.floor(d % 86400 % 3600 % 60),
                            res;
                            
                            days>0 ? res = days+"d ": res="";
                            hrs>0 ? res += hrs+":" : res+="";
                            min>0 ? res += (hrs>0 && min<10 ? "0":"")+min+":" : res+="0:";
                            sec<10 ? res += "0"+sec : res+= sec;
                                                
                            return res;
                },
		
		/* 
                * A function to display an abtract in a list, stopping at the end of the first sentence or truncating it if it
		* goes beyond 140 characters
		*/
		displayFirstSentence : function(elementid, desc){
			var sentences = [];
			sentences = desc.split("."[0], 1);
			if (sentences[0].length > 140) {
				elementid.innerHTML = sentences[0].substr(0,139).replace(/\w*\s(\S)*$/, ' ...');					
			}
			else 
			return elementid.innerHTML;elementid.innerHTML = sentences[0]+'...';
		},

		/*
		 * A function that truncates text (stops at a full word and adds ...)
		 */
		 truncate : function(elementid, desc) {

		 	elementid.innerHTML = desc;

		 	while (elementid.scrollHeight > elementid.offsetHeight) {
		 		var text = elementid.innerHTML;
		 		elementid.innerHTML= text.replace(/\W*\s(\S)*$/, '...');
		 	}
		 	return elementid.innerHTML;
		 },

		 setRating : function(node, rating){
				
				var img0 = "<img src = 'img/wall/disableIdeaVote.png'>";
				var img05 = "<img src = 'img/wall/semi-activeIdeaVote.png'>";
				var img1 = "<img src = 'img/wall/activeIdeaVote.png'>";
				var res = "";
				
				if (!rating){
					
					for (i=0; i<5; i++){
						res = res + img0;
					};
					
				}
				
				else {
					var i=0;
					while (i<Math.floor(rating)){
						res = res +img1;
						i++;
					};
					if (i<5) {
						Math.round(rating-Math.floor(rating)) ? res = res+img05 : res = res+img0;
						i++;
					};
					while(i<5){
						res = res +img0;
						i++
					};
				}
				
				node.innerHTML = res;
				
				
			},
	         searchArray : function searchArray(array, s){
			     var _keywords = s.toLowerCase().split(" "),
			         _res = [];
			         
			     for (i=0, l=array.length; i<l; i++){
			             // convert array item into string
			             var _s = JSON.stringify(array[i]).toLowerCase(), _match = 0;
			             for (j=0; j<_keywords.length; j++){
			                     if (_s.search(_keywords[j]) > -1) _match++;
			                     else break;
			             }
			             if (_match === _keywords.length){
			                     _res.push(array[i]);
			             }   
			     }
			     return _res;
			             
			},
	         sortByProperty : function sortByProperty(array, prop, descending){
			        // need a special treatment for certain properties
			        switch(prop){
			             case "idea":
			                     // sort array by ideas title (idea is an array of objects [{"title": "..", ..}, {"title": "..", ..}])
			                     array.sort(function(x,y){
			                             var _x = x[prop], _y = y[prop],
			                                 a,b;  // variables used for actual comparison
			                             if (descending){    
			                                     if (!_x || !(_x instanceof Array) || !_x.length) a=""
			                                     else {
			                                             // sort _x array by title
			                                             sortByProperty(_x, "title", true);
			                                             // use the first idea title for comparison
			                                             a = _x[0].title;
			                                     }
			                                     
			                                     if (!_y || !(_y instanceof Array) || !_y.length) b=""
                                                             else {
                                                                     sortByProperty(_y, "title", true);
                                                                     b = _y[0].title;
                                                             }    
                                                             if (a<b) return 1;
                                                             if (a>b) return -1;
                                                             return 0;
                                                        }
                                                        else{
                                                             if (!_x || !(_x instanceof Array) || !_x.length) a=""
                                                             else {
                                                                     // sort _x array by title
                                                                     sortByProperty(_x, "title", false);
                                                                     // concatenate all idea titles into a string
                                                                     a = _x[0].title;
                                                             }
                                                             
                                                             if (!_y || !(_y instanceof Array) || !_y.length) b=""
                                                             else {
                                                                     sortByProperty(_y, "title", false);
                                                                     b = _y[0].title;
                                                             }    
                                                             if (a<b) return -1;
                                                             if (a>b) return 1;
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
			                                     if (d1<d2) return 1;
			                                     if (d1>d2) return -1;
			                                     return 0;
			                             }
			                             else {
			                                     if (d1<d2) return -1;
			                                     if (d1>d2) return 1;
			                                     return 0;
			                             }
			                     });
			                     break;
			             default:
			                     array.sort(function(x, y){
			                        var _x = x[prop], _y=y[prop];
			                        // should work even if the property is not defined or null for one of the array elements
			                        if (typeof _x == "string" || typeof _y == "string")   {
                                                        if (_x && _x.toLowerCase) _x=_x.toLowerCase();
                                                        if(_y && _y.toLowerCase) _y=_y.toLowerCase();
                                                        if (descending){    
                                                                if (_x<_y) return 1;
                                                                if (_x>_y) return -1;
                                                                return 0;
                                                        }
                                                        else{
                                                                if (_x<_y) return -1;
                                                                if (_x>_y) return 1;
                                                                return 0;        
                                                        }  
                                                }			             
			                        else{
                                                        if (descending){    
                                                                if (_x<_y) return 1;
                                                                if (_x>_y) return -1;
                                                                return 0;
                                                        }
                                                        else{
                                                                if (_x<_y) return -1;
                                                                if (_x>_y) return 1;
                                                                return 0;        
                                                        }         
                                                }
			                     });
			                     break;
			     }
			        
		},
		
		/**
                * A function to upload a file on the server
                * @Param {String} url the URL to send the file ot
                * @Param {Object} body the data to upload
                * @Param {Store} progress a store used to display upload progress
                * @Param {function} onEnd the callback when the request is complete
                */
                uploadFile : function(url, body, progress, onEnd){
                             var req = new XMLHttpRequest();
                             req.open('POST', Config.get("location")+url);
                             req.onreadystatechange = function(){
                                     if(req.readyState === 4 && onEnd){
                                             onEnd(req);
                                     }
                             };
                             req.upload.onprogress = function(e){
                                     if(e.lengthComputable){
                                             progress.set("status", Math.round(e.loaded/e.total*100));
                                     }
                             };
                             req.send(body);
                  },	
		
		/**
                 * A function to check the status of the server
                 * @Param none
                 * @Returns {Promise} promise 
                 */
                checkServerStatus : function(){
                        var promise = new Promise(),
                            req = new XMLHttpRequest();
                        
                        req.open('GET', Config.get("location"));
                        req.onreadystatechange = function(){
                                     if(req.readyState === 4){
                                             (req.status === 200) ? promise.resolve() : promise.reject();
                                     }
                             };
                        req.send();
                        
                        return promise;
                },
                
			
                /**
                 * A function to retrieve the labels in the desired language
                 * @Param {String} lang the desired language (ab-cd)
                 * @Returns {Promise} promise 
                 */
                updateLabels : function(lang) {
                        var json = {"lang" : lang},
                            local = new LocalStore(),
                            labels = Config.get("labels"),
                            promise = new Promise();
                   
                        // retrieve ideafy-data
                        local.sync("ideafy-data");
                        Config.get("transport").request("Lang", json, function(result) {
                                if (result === "nok") {
                                        local.set("labels", Config.get("defaultLabels"));
                                        Config.set("language", "en-us");
                                }
                                else {
                                        local.set("labels", result);
                                        Config.set("language", result.language);
                                }
                                // save labels to local storage
                                local.sync("ideafy-data");
                                // apply language
                                labels.reset(local.get("labels"));
                                promise.resolve();
                        });
                        return promise;
                },
                
                getAvatarById : function(id){
		      var promise = new Promise,
		          avatars = Config.get("avatars");
		      
		      if (id === Config.get("user").get("_id")) {
		              Config.get("transport").request("GetFile", {sid: "avatars", "filename":id+"_@v@t@r"}, function(result){
		                      Config.set("avatar", result);
		                      promise.resolve()
		              });
		      }
		      else {
		              Config.get("transport").request("GetAvatar", {id: id}, function(result){
		              if (result.error){
		                      promise.reject();
		              }
		              else{
		                      if (avatars.getNbItems() < 100){
		                              avatars.set(id, result);
		                      }
		                      else {
		                          var obj = avatars.toJSON(),
		                              arr = obj.keys();
		                          avatars.del(arr[0]);
		                          avatars.set(id, result);
		                      }
		                      promise.resolve();
		              }      
		              });
		              return promise;
		      }      
                 },
                 
                 getAvatarByFileName : function(filename, onEnd){
                      Config.get("transport").request("GetAvatar", {file: filename}, function(result){
                              onEnd(result);    
                      });         
                 },
	
	        /*
	         * A function to obtain grade information from the server based on user's score
	         * @Param {Number} ip the user's score
	         * @Param {Function} onEnd the callback
	         * @Returns {Object} result the grade information in the user's language
	         */
	        getGrade : function(ip, onEnd){
	               var transport = Config.get("transport"),
	                   user = Config.get("user"); 
	               
	               transport.request("GetGrade", {ip: ip, lang: user.get("lang")}, function(res){
	                       onEnd(res);        
	               });
	        },
	        /*
                 * A function to obtain a user's achievements from the server based on user's id
                 * @Param {String} userid the user's score
                 * @Param {Function} onEnd the callback
                 * @Returns {Object} result the grade information in the user's language
                 */
                getAchievements : function(userid, onEnd){
                       var transport = Config.get("transport"),
                           user = Config.get("user");
                       
                       transport.request("GetAchievements", {userid: userid, lang: user.get("lang")}, function(res){
                               onEnd(res);
                               /* if (res.length){
                                        user.unsync();
                                        user.sync(Config.get("db"), userid).then(function(){
                                                onEnd(res);         
                                        });        
                               }*/
                       });
                },
                
                /*
                 * A function to obtain details of a given user
                 * @Param {String} userid the user's score
                 * @Param {Function} onEnd the callback
                 * @Returns {Object} result the user information (based on user privacy settings)
                 */
                getUserDetails : function(userid, onEnd){
                       var transport = Config.get("transport");
                       
                       transport.request("GetUserDetails", {userid: userid}, function(res){
                               onEnd(res);
                       });
                },
                /*
                 * A function to check if user profile is completed
                 * @Param
                 * @Returns {Object} percentage and if applicable an array of string with the items that are missing
                 */
                checkProfileCompletion : function(){
                        var user = Config.get("user"), labels = Config.get("labels"), res = {"percentage": 0, "missing":[]};
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
                },
                /*
                 * A function to convert a binary string to bytes
                 */
                stringToBytes : function( str ) {
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
                },
                /*
                 * A function to change the style
                 */
                changeStyle : function(newStyle){
                        var styleNode = document.querySelector(".currentStyle"),
                            currentStyle = styleNode.getAttribute("href");
                        
                        if (currentStyle !== "css/"+newStyle) styleNode.setAttribute("href", "css/"+newStyle);
                }
	}
});
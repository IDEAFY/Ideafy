define("Ideafy/Utils", ["Config", "Observable", "Promise", "Olives/LocalStore"], function(Config, Observable, Promise, LocalStore){
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
                            min>0 ? res += (hrs>0 && min<10 ? "0":"")+min+":" : "0:";
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
                                                        if (_x) _x=_x.toLowerCase();
                                                        if(_y) _y=_y.toLowerCase();
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
                             req.open('POST', url);
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
			
                getAvatarById : function(id){
		      var promise = new Promise,
		          avatars = Config.get("avatars");
		      
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
	};
});
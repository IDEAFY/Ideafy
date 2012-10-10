define("Ideafy/Utils", ["Config", "Observable"], function(Config, Observable){
	return {
		formatDate : function(array){
			var month = array[1] + 1;
			if(month < 10) {
				month = "0" + month;
			}
			return array[2] + "/" + month + "/" + array[0];
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

			getAvatar : function(uid, filename){
		              var _request = new XMLHttpRequest(),
				  _url = "attachments/"+filename,
				  _avatars = Config.get("avatars"),
				  _image,
				  _dlOk = new Observable();

                                // if avatar already exists in the store no need to do anything
                                if (!_avatars.get(uid)){
                                        // if no avatar is defined assign deedee0 by default
                                        if (!filename || filename.length<2){
                                                _image = "../img/avatars/deedee0.png";
                                                _avatars.set(uid, _image);       
                                        }
                                        // if user is using one of the default avatars, then keep image reference as is
                                        else if (filename.search("img/avatars")>-1){
                                                _avatars.set(uid, filename);
                                        }
                                        // else check if filename is appropriate and attempt to retrieve file from server
                                        else if (typeof filename === "string"){                                
                                                _request.open("GET", _url);
                                                _request.onreadystatechange = function(){
                                                if (_request.readyState === 4){
                                                        if (_request.status === 200){
                                 	                      _image = _request.responseText;
                                                        }
                                                        else {
                                                        // fallback in case of network error or download failure
                                                        _image = "../img/avatars/deedee0.png";
                                                        }
                                                        _dlOk.notify("avatar-loaded", uid);
                                                }
                                                };
                                                _request.send(null);
                                        }
                                        else {
                                                // filename should be a number > 0
                                                _image = "../img/avatars/deedee"+filename+".png";
                                                _avatars.set(uid, _image); 
                                        }

                                        _dlOk.watch("avatar-loaded", function(uid){
                                     	  _avatars.set(uid, _image);
                                        });
                                }
                }
	};
});
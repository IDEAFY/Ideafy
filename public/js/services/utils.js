define("Ideafy/Utils", ["Observable", "Config", "CouchDBStore"], function(Observable, Config, CouchDBStore){
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
		 
		 getUserAvatar : function(uid, store){
		      var cdb = new CouchDBStore();
		      
		      cdb.setTransport(Config.get("transport"));
		      cdb.sync("ideafy", "users", "_view/short", {key: '"'+uid+'"'}).then(function(){
		              var file = cdb.get(0).value.picture_file;
		              if (file === ""){
		                      store.set(uid, {"img": "img/userpics/deedee2.png", "status": "ready"});
		              }
		              else if (file.search("img/userpics")>-1){
		                      store.set(uid, {"img": file, "status": "ready"});
		              }
		              else{
		                      var request = new XMLHttpRequest(),
		                          image,
                                          url = "attachments/"+file;
                                      
                                      request.open("GET", url);
                                      request.onreadystatechange = function(){
                                        if (request.readyState === 4){
                                                if (request.status === 200){
                                                     image = request.responseText;
                                                }
                                                else {
                                                     // fallback in case of network error or download failure
                                                     image = "img/userpics/deedee0.png";
                                                }
                                                store.set(uid, {"img": image, "status": "ready"});
                                         }
                                       };
                                      request.send(null);                    
		              }
		      });      
		 },
		 
		 /**
                         * A function to retrieve images from the server
                         * @Param {String} url the URL of the picture to retrieve
                         * @Returns data base 64 encoded data
                         */
                        getAvatar : function(uid, filename){
                                 var request = new XMLHttpRequest(),
                                     url = "attachments/"+filename,
                                     image,
                                     dlOk = new Observable();
                                     
                                 // if no avatar is defined assign deedee0 by default
                                 if (!filename || filename.length<2){
                                     image = "img/userpics/deedee0.png";
                                     Config.get("avatars").set(uid, image);       
                                 }
                                 // if user is using one of the default avatars, then keep image reference as is
                                 else if (filename.search("img/userpics")>-1){
                                         Config.get("avatars").set(uid, filename);
                                 }
                                 // else check if filename is appropriate and attempt to retrieve file from server
                                 else if (typeof filename === "string"){                                 
                                     request.open("GET", url);
                                     request.onreadystatechange = function(){
                                         if (request.readyState === 4){
                                             if (request.status === 200){
                                                     image = request.responseText;
                                             }
                                             else {
                                                     // fallback in case of network error or download failure
                                                     image = "img/userpics/deedee0.png";
                                             }
                                             dlOk.notify("avatar-loaded", uid);
                                         }
                                     };
                                     request.send(null);
                                 }
                                 else {
                                         // filename should be a number > 0
                                         image = "img/userpics/deedee"+filename+".png";
                                         Config.get("avatars").set(uid, image); 
                                 }
                                 
                                 dlOk.watch("avatar-loaded", function(uid){
                                         Config.get("avatars").set(uid, image);
                                         Config.get("observer").notify("avatar-loaded", uid);
                                });
                                  
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
				
				
			}
	};
});
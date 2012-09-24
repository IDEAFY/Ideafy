define("DBUtils", ["Config", "CouchDBStore", "Utils"], function(Config, CouchDBStore, Utils){
		
	return function DBUtilsConstructor(uid, observer){
			
		/*
		 * This function assigns an authornames string to ideas in the database if it was not generated at creation
		 */
		
		var buildAuthorNames = function() {	
			var ideas = new CouchDBStore();
			
			ideas.setTransport(Config.get("Transport"));
			
			ideas.sync("taiaut", "ideas", "_view/all").then(function(store){
			        
			        store.loop(function(v, i){
			           
			           if (!v.value.authornames || v.value.authornames === "undefined"){
			              
			              var ideaCDB = new CouchDBStore();
			              ideaCDB.setTransport(Config.get("Transport"));
			              
			              ideaCDB.sync("taiaut", v.id).then(function(doc){
			                 
			                 var userCDB = new CouchDBStore();
			                 userCDB.setTransport(Config.get("Transport"));
			                 
			                 userCDB.sync("taiaut", {keys: doc.get("authors")}).then(function(store){
			                    
			                    var authorString = "";
			                    store.loop(function(value, idx){
			                            authorString = authorString + value.doc.username+", ";
			                    });
			                    // remove the last two characters
			                    authorString = authorString.substring(0, authorString.length-2);
			                    
			                    ideaCDB.set("authornames", authorString);
			                    ideaCDB.upload();
			                 });
			                      
			              });
			                   
			           }            
                              });
			        
			});
			
		},
		
		setUserProperty = function(name, defaultValue){
		  
		      var users = new CouchDBStore();
		      users.setTransport(Config.get("Transport"));
		      
		      users.sync("taiaut", "users", "_view/login").then(function(store){
		              
		              store.loop(function(v,i){
		                 var userCDB = new CouchDBStore();
		                 userCDB.setTransport(Config.get("Transport")); 
		                 userCDB.sync("taiaut", v.id).then(function(){
		                         if (!userCDB.get(name))
		                              {
		                                      userCDB.set(name, defaultValue);
		                                      userCDB.upload();
		                                      console.log(userCDB.toJSON(), "value ", name, " updated");
		                              } 
		                         else {
		                              console.log("value already present", userCDB.get("_id"));
		                      }  
		                 });
		              });
		              
		      });
		        
		},
		
		template = {
                                "lastname": "",
                                "firstname": "",
                                "address": {"street1": "", "street2": "", "zip code": null, "city": "", "country": ""},
                                "gender": 1,
                                "lang": "US",
                                "birthdate": [],
                                "connections": [],
                                "taiaut_decks": ["INT"],
                                "custom_decks": [],
                                "occupation": { "description": "", "details": {"situation": "", "job": "", "organization": ""}},
                                "family": {"couple": null, "children": null},
                                "leisure_activities": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""} ],
                                "interests": [{"name": "", "comment": ""}, {"name": "", "comment": "" }],
                                "useascharacter": 0,
                                "type": 7,
                                "notifications": [],
                                "facebook": "",
                                "twitter": "",
                                "username": "",
                                "sessionInProgress": {},
                                "organization": "",
                                "groups": [],
                                "rated": [],
                                "rated_ideas": [],
                                "favorites": [],
                                "ip": 0,
                                "picture_file": "images/userpics/deedee0.png",
                                "rank": "",
                                "title": null,
                                "achievements": [],
                                "ideas_count": 0,
                                "su_sessions_count": 0,
                                "twocents_count": 0,
                                "twoquestions_count": 0,
                                "tutorial_complete": false,
                                "profile_complete": true,
                                "news": [],
                                "twocents": [],
                                "twoquestions": []
              },
              
              allUsers = new CouchDBStore([]),
              property;
		
	       // perform db actions
	       
	       // apply user template to existing users
	       
	       allUsers.setTransport(Config.get("Transport"));
	       
	       allUsers.sync("taiaut", "users", "_view/login").then(function(store){
                              
                              store.loop(function(v,i){
                                 var userCDB = new CouchDBStore();
                                 userCDB.setTransport(Config.get("Transport")); 
                                 
                                 userCDB.sync("taiaut", v.id).then(function(){
                                         
                                         for (property in template){
                                                if (!userCDB.get(property)){
                                                      userCDB.set(property, template[property]);
                                                      console.log(userCDB.toJSON(), "property ", property, " updated");
                                                } 
                                                else {
                                                console.log("property already present", userCDB.get("_id"), property);
                                                }
                                         }
                                         userCDB.upload();  
                                 });
                              });                              
                      });
     
        };
});

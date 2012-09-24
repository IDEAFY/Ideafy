/*
 * A set of functions that query the database for different views of ideas (private/public, sorted by name or by date) or a subset thereof
 * based on a search string.
 * Note that standard serach is done directly in couchdb and the design document emits the doc rating (amp function does the calculation)
 * This is not available when searching via couchdb-lucene so the rating is computed by the client based on the votes present in the idea
 * 
 */


define("UserByDate", ["Olives/OObject", "CouchDBStore", "Store", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map"],
	function(OObject, CouchDBStore, Store, Transport, ModelPlugin, EventPlugin, Config, Utils, Map){
		
		return function UserByDateConstructor(observer){
			
			var cdbUBD = new CouchDBStore([]);
			var userByDate = new OObject(cdbUBD);
			var currentPosition = -1;
			
			cdbUBD.setTransport(Config.get("Transport"));
			
			userByDate.plugins.addAll({
				"ideas": new ModelPlugin(cdbUBD, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					setRating : function(rating){
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(userByDate)
			});
			
			cdbUBD.sync("taiaut", "library", "_view/ideas", {
				key: Config.get("uid"),
				descending: true
			});	
			
			userByDate.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				observer.notify("display-idea", cdbUBD.get(pos).id);
			};
			
			observer.watch("displayList", function(type, view){
					if ((type == "byDate") && (view == "userIdeas")) {
						currentPosition = 0;
						(cdbUBD.get(currentPosition)) ? observer.notify("display-idea", cdbUBD.get(currentPosition).id, cdbUBD.get(currentPosition).value.votes, cdbUBD.get(currentPosition).value.rating) : observer.notify("display-new");
					}
			});

			userByDate.alive(Map.get("userbydate"));
			
			return userByDate;
		};
	});
	
define ("UserByName", ["Olives/OObject", "CouchDBStore", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map"],
	function(OObject, CouchDBStore, Transport, ModelPlugin, EventPlugin, Config, Utils, Map){
		
		return function UserByNameConstructor(observer){
			
			var cdbUBN = new CouchDBStore([]);
			var userByName = new OObject(cdbUBN);
			var uid = Config.get("user").get("_id");
			var currentPosition = -1;
			
			cdbUBN.setTransport(Config.get("Transport"));
			
			userByName.plugins.addAll({
				"ideas": new ModelPlugin(cdbUBN, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					setRating : function(rating){
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(userByName)
			});

			cdbUBN.sync("taiaut", "library", "_view/ideasbyname", {
						startkey: '["' + uid + '"]',
						endkey: '["'+ uid + '", {}]'
			});		

			userByName.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				observer.notify("display-idea", cdbUBN.get(pos).id);
			};
			
			observer.watch("displayList", function(type, view){
					if ((type == "byName") && (view == "userIdeas")) {
						currentPosition = 0;
						(cdbUBN.get(currentPosition)) ? observer.notify("display-idea", cdbUBN.get(currentPosition).id, cdbUBN.get(currentPosition).value.votes, cdbUBN.get(currentPosition).value.rating) : observer.notify("display-new");
					}
			});
			
			userByName.alive(Map.get("userbyname"));
	
			return userByName;
		};
	});

define ("SearchUserByDate", ["Olives/OObject", "CouchDBStore", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map", "Store"],
	function(OObject, CouchDBStore, Transport, ModelPlugin, EventPlugin, Config, Utils, Map, Store){
		
		return function SearchUserByDate(observer){
			
			var searchUserByDate = new OObject();
			var results = new Store([]);
			var uid = Config.get("user").get("_id");
			
			searchUserByDate.plugins.addAll({
				"ideas": new ModelPlugin(results, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					computeRating : function(array){
						var rating = 0;
						if (array && array.length>0) rating = array.reduce(function(x,y){return(x+y)})/array.length;
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(searchUserByDate)
			});
			
			var extractRatingData = function(doc){
				var rating = 0;
				var votes = 0;
				var arr = doc.votes;
				if (arr && arr.length>0){
					votes = arr.length;
					rating = (arr.reduce(function(x,y){return(x+y)})/votes);
				};
				return {"rating": rating, "votes": votes};
			};
			
			searchUserByDate.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				var data = extractRatingData(results.get(pos).doc);
				observer.notify("display-idea", results.get(pos).id, data.votes, data.rating);
			};
			
			observer.watch("searchuserbydate", function(searchText){
				
				results.reset([]); //  could be replaced by a searching message
				var cdbSUD = new CouchDBStore([]);
				cdbSUD.setTransport(Config.get("Transport"));
				var queryString = searchText+' AND authors:'+uid+' OR sharedwith:'+uid;
				console.log(queryString, encodeURIComponent(queryString));
				cdbSUD.sync("_fti/local/taiaut", "indexedideas", "userbyname", {
					q: queryString,
					sort: '\\creation_date<date>', // search by date descending
					include_docs: true
				}).then(function(){
					results.reset(JSON.parse(cdbSUD.toJSON()));
					if (results.getNbItems() >0) {
						var data = extractRatingData(results.get(0).doc);
						observer.notify("display-idea", results.get(0).id);
					}
					else alert("no matching result");
					cdbSUD.unsync();
				});
				
			});
			
			searchUserByDate.alive(Map.get("searchuserbydate"));
			
			return searchUserByDate;
			
		};
		
	});
	
define ("SearchUserByName", ["Olives/OObject", "CouchDBStore", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map", "Store"],
	function(OObject, CouchDBStore, Transport, ModelPlugin, EventPlugin, Config, Utils, Map, Store){
		
		return function SearchUserByNameConstructor(observer){
			
			var searchUserByName = new OObject();
			var results = new Store([]);
			var uid = Config.get("user").get("_id");
			
			searchUserByName.plugins.addAll({
				"ideas": new ModelPlugin(results, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					computeRating : function(array){
						var rating = 0;
						if (array && array.length>0) rating = array.reduce(function(x,y){return(x+y)})/array.length;
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(searchUserByName)
			});
			
			var extractRatingData = function(doc){
				var rating = 0;
				var votes = 0;
				var arr = doc.votes;
				if (arr && arr.length>0){
					votes = arr.length;
					rating = (arr.reduce(function(x,y){return(x+y)})/votes);
				};
				return {"rating": rating, "votes": votes};
			};
			
			searchUserByName.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				var data = extractRatingData(results.get(pos).doc);
				observer.notify("display-idea", results.get(pos).id);
			};
			
			observer.watch("searchuserbyname", function(searchText){
				
				results.reset([]); //  could be replaced by a searching message
				var cdbSUN = new CouchDBStore([]);
				cdbSUN.setTransport(Config.get("Transport"));
				var queryString = searchText+' AND authors:'+uid+' OR sharedwith:'+uid;
				console.log(queryString);
				cdbSUN.sync("_fti/local/taiaut", "indexedideas", "userbyname", {
					q: queryString,
					sort: 'title',
					include_docs: true
				}).then(function(){
					results.reset(JSON.parse(cdbSUN.toJSON()));
					console.log(cdbSUN.toJSON());
					if (results.getNbItems() >0) {
						var data = extractRatingData(results.get(0).doc);
						observer.notify("display-idea", results.get(0).id);
					}
					else alert("no matching result");
					cdbSUN.unsync();
				});
				
			});
			
			searchUserByName.alive(Map.get("searchuserbyname"));
			
			return searchUserByName;
			
		};
		
	});

define ("BrowseByDate", ["Olives/OObject", "CouchDBStore", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map"],
	function(OObject, CouchDBStore, Transport, ModelPlugin, EventPlugin, Config, Utils, Map){
		
		return function BrowseByDateConstructor(observer){

			var cdbBBD = new CouchDBStore([]);
			var browseByDate = new OObject(cdbBBD);
			var currentPosition = -1;
			
			cdbBBD.setTransport(Config.get("Transport"));
			
			browseByDate.plugins.addAll({
				"ideas": new ModelPlugin(cdbBBD, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					setRating : function(rating){
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(browseByDate)
			});
			
			cdbBBD.sync("taiaut", "library", "_view/publicideas", {
				descending: true
			});

			browseByDate.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				observer.notify("display-idea", cdbBBD.get(pos).id);
			};
			
			observer.watch("displayList", function(type, view){
					if ((type == "byDate") && (view == "publicIdeas")) {
						currentPosition = 0;
						(cdbBBD.get(currentPosition)) ? observer.notify("display-idea", cdbBBD.get(currentPosition).id) : observer.notify("display-new");
					}
			});

			browseByDate.alive(Map.get("browsebydate"));
			
			return browseByDate;
		};
	});
	
define ("BrowseByName", ["Olives/OObject", "CouchDBStore", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map"],
	function(OObject, CouchDBStore, Transport, ModelPlugin, EventPlugin, Config, Utils, Map){
		
		return function BrowseByNameConstructor(observer){

			var cdbBBN = new CouchDBStore([]);
			var browseByName = new OObject(cdbBBN);
			var currentPosition = -1;
			
			cdbBBN.setTransport(Config.get("Transport"));
			
			browseByName.plugins.addAll({
				"ideas": new ModelPlugin(cdbBBN, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					setRating : function(rating){
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(browseByName)
			});
			

			cdbBBN.reset([]);
				cdbBBN.sync("taiaut", "library", "_view/publicideasbyname", {
				descending: false
			});	

			browseByName.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				observer.notify("display-idea", cdbBBN.get(pos).id);
			};
			
			observer.watch("displayList", function(type, view){
					if ((type == "byDate") && (view == "publicIdeas")) {
						currentPosition = 0;
						(cdbBBN.get(currentPosition)) ? observer.notify("display-idea", cdbBBN.get(currentPosition).id) : observer.notify("display-new");
					}
			});
			
			browseByName.alive(Map.get("browsebyname"));
			
			return browseByName;

		};
		
	});
	
define ("SearchPublicByDate", ["Olives/OObject", "CouchDBStore", "Store", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map"],
	function(OObject, CouchDBStore, Store, Transport, ModelPlugin, EventPlugin, Config, Utils, Map){
		
		return function SearchPublicByDateConstructor(observer){
			
			var searchPublicByDate = new OObject();
			var results = new Store([]);
			
			searchPublicByDate.plugins.addAll({
				"ideas": new ModelPlugin(results, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					computeRating : function(array){
						var rating = 0;
						if (array && array.length>0) rating = array.reduce(function(x,y){return(x+y)})/array.length;
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(searchPublicByDate)
			});
			
			var extractRatingData = function(doc){
				var rating = 0;
				var votes = 0;
				var arr = doc.votes;
				if (arr && arr.length>0){
					votes = arr.length;
					rating = (arr.reduce(function(x,y){return(x+y)})/votes);
				};
				return {"rating": rating, "votes": votes};
			};
			
			searchPublicByDate.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				var data = extractRatingData(results.get(pos).doc);
				observer.notify("display-idea", results.get(pos).id);
			};
			
			observer.watch("searchpublicbydate", function(searchText){
				
				results.reset([]); //  could be replaced by a searching message
				var cdbSPD = new CouchDBStore([]);
				cdbSPD.setTransport(Config.get("Transport"));
				cdbSPD.sync("_fti/local/taiaut", "indexedideas", "publicbyname", {
					q: searchText,
					sort: '\\creation_date<date>', // search by date descending
					include_docs: true
				}).then(function(){
					results.reset(JSON.parse(cdbSPD.toJSON()));
					if (results.getNbItems() >0) {
						var data = extractRatingData(results.get(0).doc);
						observer.notify("display-idea", results.get(0).id);
					}
					else alert("no matching result");
					cdbSPD.unsync();
				});
				
			});
			
			searchPublicByDate.alive(Map.get("searchpublicbydate"));
			
			return searchPublicByDate;
			
		};
		
	});
	
define ("SearchPublicByName", ["Olives/OObject", "CouchDBStore", "Olives/Transport", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Utils", "Map", "Store"],
	function(OObject, CouchDBStore, Transport, ModelPlugin, EventPlugin, Config, Utils, Map, Store){
		
		return function SearchPublicByNameConstructor(observer){
			
			var searchPublicByName = new OObject();
			var results = new Store([]);
			
			searchPublicByName.plugins.addAll({
				"ideas": new ModelPlugin(results, {
					formatDate: function (date) {
						if (date) this.innerHTML = new Date(date[0], date[1] , date[2]).toDateString(); //.toLocaleDateString();	
					},
					truncate : function displayFirstSentence(desc) {					
						// this will truncate the description at first sentence.					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					computeRating : function(array){
						var rating = 0;
						if (array && array.length>0) rating = array.reduce(function(x,y){return(x+y)})/array.length;
						Utils.setRating(this, rating);
					}
				}),
				"event": new EventPlugin(searchPublicByName)
			});
			
			var extractRatingData = function(doc){
				var rating = 0;
				var votes = 0;
				var arr = doc.votes;
				if (arr && arr.length>0){
					votes = arr.length;
					rating = (arr.reduce(function(x,y){return(x+y)})/votes);
				};
				return {"rating": rating, "votes": votes};
			};
			
			searchPublicByName.select = function(event, node){
				var pos = node.getAttribute("data-ideas_id");
				var data = extractRatingData(results.get(pos).doc);
				observer.notify("display-idea", results.get(pos).id);
			};
			
			observer.watch("searchpublicbyname", function(searchText){
				
				results.reset([]); //  could be replaced by a searching message
				var cdbSPN = new CouchDBStore([]);
				cdbSPN.setTransport(Config.get("Transport"));
				cdbSPN.sync("_fti/local/taiaut", "indexedideas", "publicbyname", {
					q: searchText,
					sort: 'title',
					include_docs: true
				}).then(function(){
					results.reset(JSON.parse(cdbSPN.toJSON()));
					if (results.getNbItems() >0) {
						var data = extractRatingData(results.get(0).doc);
						observer.notify("display-idea", results.get(0).id);
					}
					else alert("no matching result");
					cdbSPN.unsync();
				});
				
			});
			
			searchPublicByName.alive(Map.get("searchpublicbyname"));
			
			return searchPublicByName;
			
		};
	});

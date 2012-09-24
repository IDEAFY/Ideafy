define("CardPopup", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "CouchDBStore", "Olives/Transport"],
	function(OObject, Map, Config, ModelPlugin, CouchDBStore, Transport){
		
		return function CardPopupConstructor(){
			
			var cardPopup = new OObject();
			var cardCDB = new CouchDBStore({});
			var dom = Map.get("cardpopup");
			var domCard = dom.querySelector(".largecardpopup");
			var domTitle = dom.querySelector(".largecardtitle");
			var domDYK = dom.querySelector(".didyouknow");
			cardCDB.setTransport(Config.get("Transport"));
			
			cardPopup.plugins.add(
				"model", new ModelPlugin(cardCDB, {
					formatSources : function(array){
						var res="";
						if (array) {
							for (i=0, length=array.length; i<length; i++){
								(i == 0) ? res = array[0] : res = res + ", " + array[i];
							}
						}
						this.innerHTML = res;
					}
				})
			);
			
			var displayCard = function(id){
				cardCDB.reset({});
				cardCDB.sync("taiaut", id);
			};
			
			var resetClassList = function(){
				domCard.classList.remove("largecontextcard");
				domCard.classList.remove("largeproblemcard");
				domCard.classList.remove("largetechnocard");
				domTitle.classList.remove("contexttitle");
				domTitle.classList.remove("problemtitle");
				domTitle.classList.remove("technotitle");
				domDYK.classList.remove("largecontextcarddyk");
				domDYK.classList.remove("largeproblemcarddyk");
				domDYK.classList.remove("largetechnocarddyk");
			};
			
			Config.get("observer").watch("display-popup", function(origin, type, param){
				cardCDB.unsync();
				displayCard(param);
				resetClassList();
				switch(type){
					case "context":
						domCard.classList.add("largecontextcard");
						domTitle.classList.add("contexttitle");
						domDYK.classList.add("largecontextcarddyk");
						break;
					case "problem":
						domCard.classList.add("largeproblemcard");
						domTitle.classList.add("problemtitle");
						domDYK.classList.add("largeproblemcarddyk");
						break;
					case "techno":
						domCard.classList.add("largetechnocard");
						domTitle.classList.add("technotitle");
						domDYK.classList.add("largetechnocarddyk");
						break;
				}
			});
			
			cardPopup.alive(dom);
			return cardPopup;
			
		};
		
	});

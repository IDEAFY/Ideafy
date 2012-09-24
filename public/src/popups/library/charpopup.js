define("CharPopup", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "CouchDBStore", "Olives/Transport"],
	function(OObject, Map, Config, ModelPlugin, CouchDBStore, Transport){
		
		return function CharPopupConstructor(){
			
			var charPopup = new OObject();
			var charCDB = new CouchDBStore({});
			charCDB.setTransport(Config.get("Transport"));
			
			charPopup.plugins.add(
				"model", new ModelPlugin(charCDB, {
					displayInfo: function(array){
						var res="";
						if (array) for (var i=0, length=array.length; i<length; i++){
							if (i < length-1) res = res + array[i].name + " (" + array[i].comment + ")<br/>"
							else res = res + array[i].name + " (" + array[i].comment + ")";
						};
						this.innerHTML = res;
					}
				})
			);
			
			var displayChar = function(id){
				charCDB.reset({});
				charCDB.sync("taiaut", id);
			};
			
			Config.get("observer").watch("display-popup", function(origin, type, param){
				charCDB.unsync();
				if (type == "char") displayChar(param);
			});
			
			charPopup.alive(Map.get("charpopup"));
			return charPopup;
			
		};
		
	});

define("Ideafy/Public/Edit", ["Olives/OObject", "Map", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Config"], 
	function(Widget, Map, Store, Model, Event, Config){
		return function PublicEditConstructor($obs){
		//declaration
			var _widget = new Widget(),
			    _store = new Store(),  // the idea
			    _labels = Config.get("labels"),
			    _error = new Store({"error": ""});
		//setup
	               
                        _store.setTransport(Config.get("transport"));
                        
			_widget.plugins.addAll({
			        "editidea" : new Model(_store),
			        "editevent" : new Event(_widget),
			        "errormsg" : new Model(_error,{
			                setError : function(error){
			                        switch (error){
			                                case "notitle":
			                                     this.innerHTML = _labels.get("titlefield")+ _labels.get("emptyfielderror");
			                                     break;
			                                case "nodesc":
			                                     this.innerHTML = _labels.get("descriptionfield")+ _labels.get("emptyfielderror");
			                                     break;
			                                case "nosol":
			                                     this.innerHTML = _labels.get("solutionfield")+ _labels.get("emptyfielderror");
			                                     break;
			                                default:
			                                     this.innerHTML = "";
			                        }
			                }
			        })
			});
			
			_widget.alive(Map.get("public-edit"));


                        _widget.reset = function reset(id){
                                _store.unsync();
                                _store.reset();
                                _store.sync(Config.get("db"), id);        
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    modDate = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                    
                                if (_store.get("title") === "") {
                                        _error.set("error", "notitle");
                                }
                                else if (_store.get("description") === ""){
                                        _error.set("error", "nodesc");        
                                }
                                else if (_store.get("solution") === ""){
                                        _error.set("error", "nosol");        
                                }
                                else{
                                        _store.set("modification_date", modDate);
                                        _store.upload().then(function(){
                                                // close window
                                                _widget.place(document.createDocumentFragment());
                                                $obs.notify("hide");
                                        });
                               }
                               nide.classList.remove("pressed");     
                        };
                        
                        _widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                $obs.notify("hide");       
                        };
                        
		//return
			return _widget;
		};
	}
);
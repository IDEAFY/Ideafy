define("Ideafy/Public/Sendmail", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"], 
	function(Widget, Map, Config, Model, Event, Store){
		return function PublicSendmailConstructor($obs){
		//declaration
			var _widget = new Widget(),
			    _store = new Store(),
			    _error = new Store(),
			    _labels = Config.get("labels");
		//setup
		        _widget.plugins.addAll({
                                "sendlabel": new Model(_labels),
                                "senddoc" : new Model(_store),
                                "sendevent" : new Event(_widget),
                                "errormsg" : new Model(_error,{
                                        setError : function(error){
                                                switch (error){}
                                        }
                                })
                        });
		        
			_widget.alive(Map.get("public-sendmail"));
			
			_widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                $obs.notify("hide");       
                        };

		//return
			return _widget;
		};
	}
);
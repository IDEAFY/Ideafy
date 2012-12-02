define("Ideafy/Public/Sendmail", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"], 
	function(Widget, Map, Config, Model, Event, Store){
		return function PublicSendmailConstructor($obs){
		//declaration
			var _widget = new Widget(),
			    _mail = new Store({"toField":"", "from": "", "subject":"", "body": "", "attachment": ""}),
			    _error = new Store({"errormsg": ""}),
			    _user = Config.get("user"),
			    _transport = Config.get("transport"),
			    _labels = Config.get("labels");
		//setup
		        _widget.plugins.addAll({
                                "labels": new Model(_labels),
                                "mail" : new Model(_mail),
                                "mailevent" : new Event(_widget),
                                "errormsg" : new Model(_error,{
                                        setError : function(error){
                                                switch (error){}
                                        }
                                })
                        });
		        
			_widget.alive(Map.get("public-sendmail"));
			
			_widget.reset = function reset(idea){
			     console.log(idea);
			};
			
			_widget.validateAddress = function(event, node){
			        
			};
			
			_widget.validateMessage = function validateMessage(){
			     
			     return (_error.get("errormsg") === "");       
			};
			
			_widget.sendMail = function sendMail(){
			     console.log("send message now");             
			};
			
			_widget.press = function(event, node){
			     node.classList.add("pressed");        
			};
			
			_widget.send = function(event, node){
			     if (_widget.validateMessage()) _widget.sendMail();            
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
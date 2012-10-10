define("Ideafy/Brainstorm", ["Olives/OObject", "Map", "Ideafy/SubMenu", "Amy/Stack-plugin", "Olives/Model-plugin", "Config", "Store", "Ideafy/Utils", "Ideafy/Brainstorm/Menu"], 
	function(Widget, Map, Menu, Stack, Model, Config, Store, Utils, IdeafyMenu){
		return function BrainstormConstructor(){
		//declaration
			var _widget = new Widget(),
			    _menu = new Menu(Map.get("brainstorm-menu")),
			    _store = new Store();
			    _stack = new Stack();
			
		//setup
		        _widget.plugins.addAll({
		                "brainstormstack": _stack,
		                "header": new Model(_store, {
		                      setDate: function(date){
		                              if (date){
		                                      // this.innerHTML = Utils.formatDate([date.getFullYear(), date.getMonth(), date.getDate()]);
		                                      this.innerHTML = date.toLocaleDateString();
		                              }       
		                      },
		                      setTime: function(date){
		                                      this.innerHTML = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
		                              
		                      } 
		                })
		        });
		                
                        _widget.alive(Map.get("brainstorm"));
                        
                        _widget.showMenu = function showMenu(){
                             _menu.toggleActive(true);        
                        };
                        _widget.hideMenu = function hideMenu(){
                             _menu.toggleActive(false);
                        };
                
                // init
                       _menu.toggleActive(false);
                       _store.set("headertitle", Config.get("labels").get("brainstormheadertitle"));
                       setInterval(function(){
                               var now = new Date();
                               _store.set("date", now);
                       },1000);
                       _stack.getStack().add("menu", new IdeafyMenu());
                       _stack.getStack().show("menu");
                       BSTACK = _stack;
                       
		//return
			return _widget;
		};
	}
);
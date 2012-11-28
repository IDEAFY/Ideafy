define("Ideafy/Dock",["Olives/OObject", "Amy/Stack-plugin", "Amy/Control-plugin", 
	"Ideafy/Public", "Ideafy/Library", "Ideafy/Brainstorm", "Ideafy/Connect", "Ideafy/Dashboard",
	"Map", "Config"], 
	function(Widget, Stack, Control, Public, Library, Brainstorm, Connect, Dashboard, Map, Config){
		return function DockConstructor(){

		//declaration
			var _widget = new Widget(),
				_control = new Control(this),
				_stack = new Stack();

		//setup
			//labels have to configurable
			_widget.plugins.addAll({
				"dockstack" : _stack,
				"dockcontrol" : _control
			});
			_widget.alive(Map.get("dock"));

		//logic
			_widget.init = function(){
			        
				_stack.getStack().add("#public", new Public());
				console.log("publicok");
				_stack.getStack().add("#library", new Library());
				console.log("libraryok");
				_stack.getStack().add("#brainstorm", new Brainstorm());
				console.log("brainstormok");
				_stack.getStack().add("#connect", new Connect());
				console.log("connectok");
				_stack.getStack().add("#dashboard", new Dashboard());
				console.log("dashboardok");
				//set current stack view
				_stack.getStack().show("#public");
			};
			
			_widget.reset = function(){
			     _stack = new Stack();
			     _widget.init();      
			};

			this.setCurrentWidget = function(event){
				var href = event.target.getAttribute("href"), timeout= 3000;
				if(href !== _stack.getStack().getCurrentName()){
				        //hide current submenu if present
                                        _stack.getStack().getCurrentScreen().hideMenu();
                                        
                                        //we show stack widgets this way to reduce listener
					_stack.getStack().show(href);
					//display new submenu for a short duration <3s
					_stack.getStack().getCurrentScreen().showMenu();
					setTimeout(function(){_stack.getStack().getCurrentScreen().hideMenu();}, timeout);
				}
				else{
				        //display submenu
				        _stack.getStack().getCurrentScreen().showMenu();
				}
			};
			
	       
               /*
                * Watch for view changing events
                */
                        
                        // replay session
                        Config.get("observer").watch("replay-session", function(sid, mode){
                                _stack.getStack().show("#brainstorm");
                                document.querySelector(".dock-item.selected").classList.remove("selected");
                                document.querySelector(".dock-item[href='#brainstorm']").classList.add("selected");              
                        });

		//return
			return _widget;

		};
});
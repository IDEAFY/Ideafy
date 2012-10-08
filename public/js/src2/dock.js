define("Ideafy/Dock",["Olives/OObject", "Amy/Stack-plugin", "Amy/Control-plugin", 
	"Ideafy/Public", "Ideafy/Library", "Ideafy/Brainstorm", "Ideafy/Connect", "Ideafy/Dashboard",
	"Map"], 
	function(Widget, Stack, Control, Public, Library, Brainstorm, Connect, Dashboard, Map){
		return function DockConstructor(){

		//declaration
			var _widget = new Widget(),
				_control = new Control(this),
				_stack = new Stack();
				//refactor stack-service
				/*_stack = new Stack({
					"#public" :_public,
					//replace with modules
					"#library" : new Library(),
					"#brainstorm" : new Brainstorm(),
					"#connect" : new Connect(),
					"#dashboard" : new Dashboard()
				});*/

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
				STACK = _stack;
			};

			this.setCurrentWidget = function(event){
				var href = event.target.getAttribute("href");
				if(href !== _stack.getStack().getCurrentName()){
				        //hide current submenu if present
                                        _stack.getStack().getCurrentScreen().hideMenu();
                                        //we show stack widgets this way to reduce listener
					_stack.getStack().show(href);
				}
				else{
				        //display submenu
				        _stack.getStack().getCurrentScreen().showMenu();
				}
				
			};

		//return
			return _widget;

		};
});
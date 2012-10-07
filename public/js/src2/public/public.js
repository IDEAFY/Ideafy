define("Ideafy/Public", ["Olives/OObject", "Amy/Control-plugin" ,
	"Olives/Model-plugin", "Amy/Delegate-plugin", "CouchDBStore", "Map", "Config",
	"Ideafy/Public/Idea-detail", "Ideafy/Utils", "Ideafy/Public/List", "Amy/Stack-plugin"], 
	function(Widget, Control, Model, Delegate, Store, Map, 
		Config, Detail, Utils, List, Stack){
		return function PublicConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom = Map.get("public"),
				_radio = new Control(this),
				_detail = new Detail(),

				_stack = new Stack();

		//setup
			_widget.plugins.addAll({
				"liststack" : _stack,

				/* mays be have event plugin in control*/
				"publicevent" : new Delegate(this),
				"publiccontrol" :_radio
			});

			this.selectStart = function(event){
				//_detail.reset(_ideas.get(event.target.getAttribute("data-publicideas_id")));
				//please don't do that
				_detail.reset(_stack.getStack().getCurrentScreen().getModel().get(event.target.getAttribute("data-listideas_id")));
			};

			this.selectEnd = function(event){
				//_detail.reset(_ideas.get(event.target.getAttribute("data-publicideas_id")));
			};

			this.mosaic = function(){
				_dom.classList.toggle("mosaic");
			};

			//may be set the list dom (not the public dom)
			_widget.alive(_dom);
			_stack.getStack().add("#list-date", new List("ideafy", "library", "_view/publicideas"));
			_stack.getStack().add("#list-rating", new List("ideafy", "ideas", "_view/ideasbyvotes"));
			_stack.getStack().show("#list-date");

			/*then(function(){
			//select first item
			var li = _dom.querySelector("li");
			if(li){
				_radio.init(li);
				li.classList.add("selected");
				_detail.reset(_ideas.get(0));
			}
		});*/


		//return
			return _widget;
		};
	}
);

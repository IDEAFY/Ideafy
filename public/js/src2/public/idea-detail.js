//may be change the moduule id to have somethinh nicer
define("Ideafy/Public/Idea-detail", 
	["Olives/OObject", "Store", "Olives/Model-plugin", "Map", "Ideafy/Utils",
	 "Ideafy/TwoCents", "Amy/Stack-plugin", "Ideafy/Public/Edit", "Ideafy/Public/Sendmail"], 
	function(Widget, Store, Model, Map, Utils, TwoCents, Stack, Edit, Sendmail){
		return function IdeaDetailConstructor(){
		//declaration
			var _widget = new Widget(),
				_twocents = new TwoCents(),
				_store = new Store(),
				_stack = new Stack();

		//setup
			_stack.getStack().add("#public-edit", new Edit());
			_stack.getStack().add("#public-sendmail", new Sendmail());
			_widget.plugins.addAll({
				"publicdetail" : new Model(_store, {
					date : function date(date){
						this.innerHTML = Utils.formatDate(date);
					}
				}),
				"detailstack" : _stack
			});
			_widget.alive(Map.get("public-detail"));
			_twocents.place(Map.get("public-twocents"));

		//public
			_widget.reset = function(model){
			        console.log(model);
				_store.reset(model);
				_twocents.reset(model._id);
			};

		//return
			return _widget;
		};
	}
);
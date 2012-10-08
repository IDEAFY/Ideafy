define("Ideafy/Public", ["Olives/OObject", "Amy/Control-plugin" ,
	"Olives/Model-plugin", "Amy/Delegate-plugin", "CouchDBStore", "Map", "Config",
	"Ideafy/Public/Idea-detail", "Ideafy/Utils", "Ideafy/Public/List", "Amy/Stack-plugin", "Ideafy/SubMenu"], 
	function(Widget, Control, Model, Delegate, Store, Map, 
		Config, Detail, Utils, List, Stack, Menu){
		return function PublicConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom = Map.get("public"),
				_radio = new Control(this),
				_detail = new Detail(),
                                _menu = new Menu(Map.get("public-menu")),
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
				_detail.reset(_stack.getStack().getCurrentScreen().getModel().get(event.target.getAttribute("data-listideas_id")).doc);
			};

			this.selectEnd = function(event){
				//_detail.reset(_ideas.get(event.target.getAttribute("data-publicideas_id")));
			};

			this.mosaic = function(){
				_dom.classList.toggle("mosaic");
			};
			
			this.search = function(event, node){
			        if (event.keyCode === 13){
			             if (node.value === ""){
			                     _stack.getStack().show("#list-date");
			             }
			             else{
			                     console.log(node.value);
			                     listSearch.resetQuery({q: node.value, sort: '\\creation_date<date>', include_docs: true});
			                     _stack.getStack().show("#list-search");
			             }
			        }
			};
			
			//may be set the list dom (not the public dom)
                        _widget.alive(_dom);

			// not sure we need a submenu for public but it may be useful
			_widget.showMenu = function showMenu(){
			        _menu.toggleActive(true);
			};
			_widget.hideMenu = function hideMenu(){
			        _menu.toggleActive(false);
			};
			// init
                       _menu.toggleActive(false);
			
			var listDate = new List("ideafy", "library", "_view/publicideas"),
			    listRating = new List("ideafy", "ideas", "_view/ideasbyvotes"),
			    listSearch = new List("_fti/local/ideafy", "indexedideas", "publicbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
			_stack.getStack().add("#list-date", listDate);
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			// show public ideas sorted by most recent
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

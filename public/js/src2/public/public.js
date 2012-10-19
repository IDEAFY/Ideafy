define("Ideafy/Public", ["Olives/OObject", "Amy/Control-plugin" ,
	"Olives/Model-plugin", "Amy/Delegate-plugin", "CouchDBStore", "Map", "Config",
	"Ideafy/Public/Idea-detail", "Ideafy/Utils", "Ideafy/Public/List", "Amy/Stack-plugin", "Ideafy/SubMenu"], 
	function(Widget, Control, Model, Delegate, Store, Map, 
		Config, Detail, Utils, List, Stack, Menu){
		return function PublicConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom = Map.get("public"),
				byDate = _dom.querySelector(".bydate"),             // header buttons need to be declared
                                byRating =  _dom.querySelector(".byrating"),        // disabled if search is active
				_db = Config.get("db"),
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
				var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
				    _id = event.target.getAttribute("data-listideas_id");
				_detail.reset(_ideaList, _id);
				
			};
			
			// this piece can be considerable simplified --> using stack & control plugins (when I am not brain dead)
			this.show = function(event, node){
			     var byDate = _dom.querySelector(".bydate"),
			         byRating =  _dom.querySelector(".byrating"),
			         name = node.getAttribute("name");
			     if (name !== _stack.getStack().getCurrentName){
			             _stack.getStack().show(name);
			             if (name == "#list-date"){
			                     _detail.reset(listDate.getModel(), 0);
			                     byRating.classList.remove("pushed");
			                     byDate.classList.add("pushed");
			             }
			             else{
			                     _detail.reset(listRating.getModel(), 0);
			                     byRating.classList.add("pushed");
                                             byDate.classList.remove("pushed"); 
			             }
			     }    
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
			                     byDate.setAttribute("style", "display: inline-block;");
                                             byRating.setAttribute("style", "display: inline-block;");
			                     // default list viewed by date
			                     _stack.getStack().show("#list-date");
			                     byDate.classList.add("pushed");
			             }
			             else{
			                     // hide sorting buttons (not available for the time being in search mode)
			                     byDate.setAttribute("style", "display: none;");
			                     byRating.setAttribute("style", "display: none;");
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
			
			var listDate = new List(_db, "library", "_view/publicideas"),
			    listRating = new List(_db, "ideas", "_view/ideasbyvotes"),
			    listSearch = new List("_fti/local/"+_db, "indexedideas", "publicbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
			_stack.getStack().add("#list-date", listDate);
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			// show public ideas sorted by most recent
		        listDate.init(_detail.reset);
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

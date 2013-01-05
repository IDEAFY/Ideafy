define("Ideafy/Library/Ideas", ["Olives/OObject", "Amy/Control-plugin" ,
	"Olives/Model-plugin", "Amy/Delegate-plugin", "CouchDBStore", "Map", "Config",
	"Ideafy/Library/IdeaStack", "Ideafy/Utils", "Ideafy/Library/IdeaList", "Amy/Stack-plugin", "Ideafy/SubMenu"], 
	function(Widget, Control, Model, Delegate, Store, Map, 
		Config, Detail, Utils, List, Stack, Menu){
		return function IdeasConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom = Map.get("ideas"),
				byDate = _dom.querySelector(".bydate"),             // header buttons need to be declared
                                byRating =  _dom.querySelector(".byrating"),        // disabled if search is active
				_db = Config.get("db"),
				_observer = Config.get("observer"),
				_radio = new Control(this),
				_detail = new Detail(),
                                _menu = new Menu(Map.get("library-menu")),
				_stack = new Stack();

		//setup
			_widget.plugins.addAll({
				"idealiststack" : _stack,

				/* mays be have event plugin in control*/
				"ideasevent" : new Delegate(this),
				"ideascontrol" :_radio
			});

			this.selectStart = function(event){
				//_detail.reset(_ideas.get(event.target.getAttribute("data-publicideas_id")));
				//please don't do that
				var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
				    _id = event.target.getAttribute("data-listideas_id");
				_detail.reset(_ideaList, _id);
				
			};
			
			// this piece can be considerably simplified --> using stack & control plugins
			this.show = function(event, node){
			     var byDate = _dom.querySelector(".bydate"),
			         byRating =  _dom.querySelector(".byrating"),
			         name = node.getAttribute("name");
			     if (name !== _stack.getStack().getCurrentName){
			             _stack.getStack().show(name);
			             if (name === "#list-date"){
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
			        var domDetail = document.getElementById("ideas-detail");
				_dom.classList.toggle("mosaic");
				if (domDetail.classList.contains("invisible")) {
				        domDetail.classList.remove("invisible");
				        _detail.reset(listDate.getModel(), 0);
				}
			};
			
			this.plus = function(){
			        Map.get("newidea-popup").classList.add("appear");
			        Map.get("cache").classList.add("appear");        
			};
			
			this.search = function (event, node){
			        if (event.keyCode === 13){
			             if (node.value === ""){
			                     byDate.setAttribute("style", "display: inline-block;");
                                             byRating.setAttribute("style", "display: inline-block;");
			                     // default list viewed by date
			                     _stack.getStack().show("#list-date");
			                     byDate.classList.add("pushed");
			             }
			             else{
			                     _widget.searchIdea(node.value);
			             }
			        }
			};
			
			_widget.searchIdea = function searchIdea(query){
			     // hide sorting buttons (not available for the time being in search mode)
                                byDate.setAttribute("style", "display: none;");
                                byRating.setAttribute("style", "display: none;");
                                listSearch.resetQuery({q: query, sort: '\\creation_date<date>', include_docs: true}).then(function(){
                                        _stack.getStack().show("#list-search");
                                        LS=listSearch.getModel();
                                        _detail.reset(listSearch.getModel(), 0);        
                                });
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
			
			// for library for the time being only propose list by date or serach tool
			// additional options (rating/favorites etc. may be offered in the future)
			
			var listDate = new List(_db, "library", "_view/ideas", {key: Config.get("uid"), descending: true, include_docs:true}),
			   listSearch = new List("_fti/local/"+_db, "indexedideas", "userbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
			
			_stack.getStack().add("#list-date", listDate);
			
			_stack.getStack().add("#list-search", listSearch);
			
			// show private ideas sorted by most recent
		        //listRating.init(_detail.reset);
		        
		        listDate.init().then(function(){
		              _stack.getStack().show("#list-date");        
		        });
			
			//_stack.getStack().show("#list-date");
                        
                        //return
			return _widget;
		};
	}
);

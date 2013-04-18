/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Control-plugin" ,
	"Bind.plugin", "Amy/Delegate-plugin", "CouchDBStore", "service/map", "service/config",
	"./idea-stack", "./lists/idealist", "Amy/Stack-plugin"], 
	function(Widget, Control, Model, Delegate, Store, Map, 
		Config, Detail, List, Stack){
		return function IdeasConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom = Map.get("ideas"),
				byDate = _dom.querySelector(".bydate"),             // header buttons need to be declared
                                byRating =  _dom.querySelector(".byrating"),        // disabled if search is active
				_searchInput = new Store({"search": ""}),
				_db = Config.get("db"),
				_observer = Config.get("observer"),
				_radio = new Control(this),
				_detail = new Detail(),
				_stack = new Stack();

		//setup
			_widget.plugins.addAll({
				"idealiststack" : _stack,
				"search" : new Model(_searchInput),

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
				// clear search field
				_searchInput.set("search", "");
				
			};
			
			// function used to retrieve the currently highlighted idea in a list and display its details
                       _widget.displayHighlightedIdea = function displayHighlightedIdea(){
                             var ideaList = _stack.getStack().getCurrentScreen(),
                                 ideaNode = ideaList.dom.querySelector(".list-item.selected") || ideaList.dom.querySelector("li[data-listideas_id='0']"); 
                                 id = ideaNode.getAttribute("data-listideas_id");
                             
                             ideaNode.classList.add("selected");
                             ideaNode.scrollIntoView();
                             _radio.init(ideaNode);        
                             _detail.reset(ideaList.getModel(), id);            
                        };

			// this piece can be considerably simplified --> using stack & control plugins
			this.show = function(event, node){
			     var byDate = _dom.querySelector(".bydate"),
			         byRating =  _dom.querySelector(".byrating"),
			         name = node.getAttribute("name");
			     if (name !== _stack.getStack().getCurrentName){
			             _stack.getStack().show(name);
			             if (name === "#list-date"){
			                     byRating.classList.remove("pushed");
			                     byDate.classList.add("pushed");
			             }
			             else{
			                     byRating.classList.add("pushed");
                                             byDate.classList.remove("pushed"); 
			             }
			             _widget.displayHighlightedIdea();
			     }    
			};

			this.mosaic = function(){
			        var domDetail = document.getElementById("ideas-detail");
				_dom.classList.toggle("mosaic");
				if (domDetail.classList.contains("invisible")) {
				        domDetail.classList.remove("invisible");
				        _detail.reset(listDate.getModel(), 0);
				}
				else domDetail.classList.add("invisible");
			};
			
			this.plus = function(){
			        Map.get("newidea-popup").classList.add("appear");
			        Map.get("cache").classList.add("appear");        
			};
			
			this.search = function (event, node){
			        var usr;
			        if (event.keyCode === 13){
			             if (node.value === ""){
			                     byDate.setAttribute("style", "display: inline-block;");
                                             byRating.setAttribute("style", "display: inline-block;");
			                     // default list viewed by date
			                     _stack.getStack().show("#list-date");
			                     byDate.classList.add("pushed");
			                     byRating.classList.remove("pushed");
                                             _widget.displayHighlightedIdea();
			             }
			             else{
			                     usr = Config.get("user").get("_id").replace(/@/, "at");
			                     _widget.searchIdea("users:"+usr+ " AND "+node.value);
			             }
			             node.blur();
			        }
			};
			
			_widget.searchIdea = function searchIdea(query){
			      // hide sorting buttons (not available for the time being in search mode)
                                byDate.setAttribute("style", "display: none;");
                                byRating.setAttribute("style", "display: none;");
                                listSearch.resetQuery({q: query, sort: '\\creation_date<date>', include_docs: true}).then(function(){
                                        // display search list and fill search field with idea title if applicable
                                        _stack.getStack().show("#list-search");
                                        if (listSearch.getModel().getNbItems() >0){
                                                _searchInput.set("search", listSearch.getModel().get(0).doc.title);
                                                document.getElementById("noresult").classList.add("invisible");
                                                _widget.displayHighlightedIdea();
                                        }
                                        else {
                                                document.getElementById("noresult").classList.remove("invisible");
                                        }        
                                });
                        };
			
			//may be set the list dom
                        _widget.alive(_dom);

			// init
			
			// for library for the time being only propose list by date or search tool
			// additional options (rating/favorites etc. may be offered in the future)
			
			var listDate = new List(_db, "library", "_view/ideas", {key: Config.get("uid"), descending: true, include_docs:true}),
			   listSearch = new List("_fti/local/"+_db, "indexedideas", "userbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true}),
			   listRating = new List(_db, "ideas", "_view/privatebyvotes", {startkey: '["'+Config.get("user").get("_id")+'",{}]', endkey: '["'+Config.get("user").get("_id")+'"]', descending: true, include_docs:true});
			
			_stack.getStack().add("#list-date", listDate);
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			
			listRating.init();
			listDate.init().then(function(){
		              var initLI; // used to initialize list selection
                              _stack.getStack().show("#list-date");
                              _widget.displayHighlightedIdea();         
		        });
                        
                        //return
			return _widget;
		};
	});

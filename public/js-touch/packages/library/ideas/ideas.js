/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Control-plugin" ,
	"Bind.plugin", "Place.plugin", "Amy/Delegate-plugin", "Store", "service/map", "service/config",
	"./idea-stack", "./lists/idealist", "Amy/Stack-plugin"], 
	function(Widget, Control, Model, Place, Delegate, Store, Map, 
		Config, Detail, List, Stack){
		return function IdeasConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom, byDate, byRating,        // disabled if search is active
				_searchInput = new Store({"search": ""}),
				_db = Config.get("db"),
				_observer = Config.get("observer"),
				_radio = new Control(_widget),
				_detail = new Detail(),
				listDate, listRating, listSearch,
				_stack = new Stack();

		//setup
		       _widget.template='<div id = "ideas"><div id="idea-list" class="list"><div class="header blue-light"><div class="option left" data-ideascontrol="toggle:.option.left,mosaic,touchstart,mosaic"></div><span data-label="bind: innerHTML, idealistheadertitle">My Ideas</span><div class="option right" data-ideasevent="listen: touchstart, plus"></div></div><div class="overflow" data-idealiststack="destination" data-ideascontrol="radio:li,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-search="bind: value, search" data-label="bind: placeholder, searchprivateplaceholder" data-ideasevent="listen: keypress, search"><div name="#list-date" class="tools-button bydate pushed" data-ideasevent="listen:touchstart,show"></div><div name="#list-rating" class="tools-button byrating" data-ideasevent="listen:touchstart,show"></div></div></div></div><div id="ideas-detail" class="details" data-ideaplace="place:details"></div></div>';
		       
			_widget.plugins.addAll({
				"idealiststack" : _stack,
				"search" : new Model(_searchInput),

				/* mays be have event plugin in control*/
				"ideasevent" : new Delegate(_widget),
                                "ideaplace" : new Place({"details": _detail}),
				"ideascontrol" :_radio
			});
			
			_widget.place(Map.get("ideas"));

			_widget.selectStart = function(event){
				//_detail.reset(_ideas.get(event.target.getAttribute("data-publicideas_id")));
				//please don't do that
				var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
				    _id = event.target.getAttribute("data-listideas_id");
				    console.log(id);
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
			_widget.show = function(event, node){
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

			_widget.mosaic = function(){
			        var domDetail = document.getElementById("ideas-detail");
				_dom.classList.toggle("mosaic");
				if (domDetail.classList.contains("invisible")) {
				        domDetail.classList.remove("invisible");
				        _detail.reset(listDate.getModel(), 0);
				}
				else domDetail.classList.add("invisible");
			};
			
			_widget.plus = function(){
			        Map.get("newidea-popup").classList.add("appear");
			        Map.get("cache").classList.add("appear");        
			};
			
			_widget.search = function (event, node){
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
			
			// reset function
                        _widget.reset = function reset(){
                                _searchInput.set("search", "");
                                listSearch.resetQuery({q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
                                listRating.resetQuery({startkey: '["'+Config.get("user").get("_id")+'",{}]', endkey: '["'+Config.get("user").get("_id")+'"]', descending: true, include_docs:true}) ;
                                listDate.resetQuery({key: Config.get("uid"), descending: true, include_docs:true})
                                .then(function(){
                                        _stack.getStack().show("#list-date");
                                        _widget.displayHighlightedIdea();         
                                });       
                        };
                        
			// INIT
			
			// dom items
                        _dom = _widget.dom;
                        byDate = _dom.querySelector(".bydate");
                        byRating =  _dom.querySelector(".byrating");
			
			// for library for the time being only propose list by date or search tool
			// additional options (rating/favorites etc. may be offered in the future)
			
			listDate = new List(_db, "library", "_view/ideas", {key: Config.get("uid"), descending: true});
			listSearch = new List("_fti/local/"+_db, "indexedideas", "userbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
			listRating = new List(_db, "ideas", "_view/privatebyvotes", {startkey: '["'+Config.get("user").get("_id")+'",{}]', endkey: '["'+Config.get("user").get("_id")+'"]', descending: true});
			
			_stack.getStack().add("#list-date", listDate);
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			
			listRating.init();
			listDate.init().then(function(){
                              _stack.getStack().show("#list-date");
                              _widget.displayHighlightedIdea();         
		        });
                        
                        //return
			return _widget;
		};
	});

/*
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Control-plugin" ,
	"Bind.plugin", "Place.plugin", "Amy/Delegate-plugin", "service/map", "service/config",
	"./public-stack", "service/utils", "./lists/list-public", "./lists/list-polling", "Amy/Stack-plugin", "service/submenu", "Promise"], 
	function(Widget, Control, Model, Place, Delegate, Map, 
		Config, Detail, Utils, List, Polling, Stack, Menu){
		return function PublicConstructor(){
		//declaration
			var _widget = new Widget(),
			    _dom, byDate, byRating,
				/*_dom = Map.get("public"),
				byDate = _dom.querySelector(".bydate"),             // header buttons need to be declared
                                byRating =  _dom.querySelector(".byrating"), */       // disabled if search is active
				_db = Config.get("db"),
				_radio = new Control(_widget),
				_detail= new Detail(),
                                _menu = new Menu(Map.get("public-menu")),
				_stack = new Stack();

		//setup
		      _widget.template='<div id="public"><div id = "public-menu"></div><div id="public-list" class="list"><div class="header blue-light"><div class="option left" data-publiccontrol="toggle:.option.left,mosaic,touchstart,mosaic"></div><span data-label="bind: innerHTML, publicideasheadertitle"></span><div class="option right" data-publicevent="listen: touchstart, plus"></div></div><div data-liststack="destination" data-publiccontrol="radio:li,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-label="bind: placeholder, searchpublicplaceholder" data-publicevent="listen: keypress, search"><div name="#list-date" class="tools-button bydate pushed" data-publicevent="listen:touchstart,show"></div><div name="#list-rating" class="tools-button byrating" data-publicevent="listen:touchstart,show"></div></div></div></div><div id="public-detail" class="details" data-place="place:details"></div></div>';
		
		      _widget.plugins.addAll({
				"liststack" : _stack,
				"label" : new Model(Config.get("labels")),

				/* mays be have event plugin in control*/
				"publicevent" : new Delegate(_widget),
				"place" : new Place({"details" : _detail}),
				"publiccontrol" :_radio
			});

			_widget.selectStart = function(event){
				var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
				    _id = event.target.getAttribute("data-listideas_id");
				_detail.reset(_ideaList, _id);
				
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
			     console.log(id, ideaNode, ideaList.getModel().get(id));            
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
				var domDetail = document.getElementById("public-detail");
                                _dom.classList.toggle("mosaic");
                                if (domDetail.classList.contains("invisible")) {
                                        domDetail.classList.remove("invisible");
                                        _detail.reset(listDate.getModel(), 0);
                                }
			};
			
			_widget.plus = function(){
			        Map.get("newidea-popup").classList.add("appear");
			        Map.get("cache").classList.add("appear");        
			};
			
			_widget.search = function(event, node){
			        if (event.keyCode === 13){
			             if (node.value === ""){
			                     listDate.resetQuery().then(function(){
			                             byDate.setAttribute("style", "display: inline-block;");
                                                     byRating.setAttribute("style", "display: inline-block;");
                                                     // default list viewed by date
                                                     _stack.getStack().show("#list-date");
                                                      byDate.classList.add("pushed");
                                                      byRating.classList.remove("pushed");
                                                      _widget.displayHighlightedIdea();        
			                     });
			             }
			             else{
			                     _widget.searchIdea(node.value);
			             }
			             node.blur();
			        }
			};
			
			_widget.searchIdea = function searchIdea(query){
                             // hide sorting buttons (not available for the time being in search mode)
                                byDate.setAttribute("style", "display: none;");
                                byRating.setAttribute("style", "display: none;");
                                listSearch.resetQuery({q: query, sort: '\\creation_date<date>', include_docs: true})
                                .then(function(){
                                        _stack.getStack().show("#list-search");
                                        if (listSearch.getModel().getNbItems() >0){
                                                document.getElementById("noresult").classList.add("invisible");
                                                _widget.displayHighlightedIdea();
                                        }
                                        else {
                                                document.getElementById("noresult").classList.remove("invisible");
                                        }      
                                });
                        };
                        
                        //may be set the list dom (not the public dom)
                        // _widget.alive(_dom);

                        // reset function
                        _widget.reset = function reset(){
                                listRating.init(_detail.reset);
                                listDate.init(_detail.reset).then(function(){
                                        _stack.getStack().show("#list-date");
                                        _detail.reset(listDate.getModel(), 0);        
                                });        
                        };
                        
			// not sure we need a submenu for public but it may be useful
			_widget.showMenu = function showMenu(){
			        _menu.toggleActive(true);
			};
			_widget.hideMenu = function hideMenu(){
			        _menu.toggleActive(false);
			};
			
			// init
                       _menu.toggleActive(false);
                       _dom = _widget.dom;
                       byDate = _dom.querySelector(".bydate");             // header buttons need to be declared
                       byRating =  _dom.querySelector(".byrating");
                       
			
			var listDate = new Polling(_db, "library", "_view/publicideas"),
			     // list date needs to be in polling mode with a polling_interval defined in Config to avoid traffic overload
			    listRating = new List(_db, "ideas", "_view/ideasbyvotes"),
			    listSearch = new List("_fti/local/"+_db, "indexedideas", "publicbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:60, include_docs: true});
			 
			    
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			_stack.getStack().add("#list-date", listDate);
			
			// show public ideas sorted by most recent
		        listRating.init();
		        
		        listDate.init().then(function(){
		              _stack.getStack().show("#list-date");
		              _widget.displayHighlightedIdea();      
		        });
		        

			//return
			return _widget;
		};
	});

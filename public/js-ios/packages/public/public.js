/*
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Control-plugin" ,
	"Bind.plugin", "Place.plugin", "Amy/Delegate-plugin", "service/map", "service/config",
	"./public-stack", "service/utils", "./lists/list-public", "./lists/list-polling", "Amy/Stack-plugin", "service/submenu", "Store", "lib/spin.min"], 
	function(Widget, Control, Model, Place, Delegate, Map, 
		Config, Detail, Utils, List, Polling, Stack, Menu, Store, Spinner){
		return function PublicConstructor(){
		//declaration
			var _widget = new Widget(),
				_db = Config.get("db"),
				_observer = Config.get("observer"),
				_radio = new Control(_widget),
				_detail= new Detail(),
                                _menu, listDate, listRating, listFav, listSearch,
                                initQuery,
                                _user = Config.get("user"),
                                _labels = Config.get("labels"),
                                _currentLang = _user.get("lang").substring(0,2),
                                _btns = new Store([
                                        {name:"#list-fav", css:"byfav", pushed: false, lang:null},
                                        {name:"#list-date", css:"bydate", pushed: true, lang:null},
                                        {name:"#list-rating", css:"byrating", pushed: false, lang:null},
                                        {name:"#lang", css:"bylang", pushed: false, lang: _currentLang}
                                ]),
                                _languages = new Store([{name:"*"}]),
                                _usrLg = Config.get("userLanguages"),
				_stack = new Stack(),
				_listSpinner = new Spinner({color:"#808080", lines:10, length: 12, width: 6, radius:10, top: 328}).spin();

		//setup
		      // build languages & flags
		      _usrLg.forEach(function(val){
		              _languages.alter("push", val);
		      });
		
		      _widget.template='<div id="public"><div id = "public-menu"></div><div id="public-list" class="list"><div class="header blue-light"><div class="option left" data-publiccontrol="toggle:.option.left,mosaic,touchstart,mosaic"></div><span data-label="bind: innerHTML, publicideasheadertitle"></span><div class="option right" data-publicevent="listen: touchstart, plus"></div></div><div data-liststack="destination" data-publiccontrol="radio:li.list-item,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-label="bind: placeholder, searchpublicplaceholder" data-publicevent="listen: keypress, search"><ul class="listbtns" data-listbtns="foreach"><li class="tools-button" data-listbtns="bind:setName, name; bind:setClass, css; bind:setPushed, pushed; bind:setLang, lang" data-publicevent="listen:touchstart,show"></li></ul><ul class="langlist invisible" data-select="foreach"><li data-select="bind: setBg, name" data-publicevent="listen: touchstart, setLang; listen:touchend, stopPropagation"></li></ul></div></div></div><div id="public-detail" class="details" data-publicplace="place:details"></div></div>';
		
		      _widget.plugins.addAll({
				"liststack" : _stack,
				"listbtns" : new Model(_btns,{
				        setPushed : function(pushed){
				                (pushed)?this.classList.add("pushed"):this.classList.remove("pushed");
				        },
				        setLang : function(lang){
				                if (lang && lang !=="*") {
				                        this.setAttribute("style", "background-image:url('img/flags/"+lang+".png');");
				                        this.innerHTML = "";
				                }
				                if (lang === "*") {
				                        this.setAttribute("style","background-image: none;");
				                        this.innerHTML = "*";
				                }
				        },
				        setClass : function(css){
				                css && this.classList.add(css);
				        },
				        setName : function(name){
				                name && this.setAttribute("name", name);
				        }
				}),
				"select" : new Model (_languages, {
                                        setBg : function(name){
                                                if (name === "*"){
                                                        this.setAttribute('style', "background-image: none;background: whitesmoke;");
                                                        this.innerHTML="*";
                                                }
                                                else{
                                                        this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                                }
                                        } 
                                }),
				"label" : new Model(_labels),

				/* mays be have event plugin in control*/
				"publicevent" : new Delegate(_widget),
				"publicplace" : new Place({"details": _detail}),
				"publiccontrol" :_radio
			});
			
			_widget.place(Map.get("public"));

			_widget.selectStart = function(event){
				var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
				    _id = event.target.getAttribute("data-listideas_id");
				
				_detail.reset(_ideaList,_id);
			};
			
			// function used to retrieve the currently highlighted idea in a list and display its details
	               _widget.displayHighlightedIdea = function displayHighlightedIdea(){
			     var ideaList, ideaNode, id;
			     ideaList = _stack.getStack().getCurrentScreen(),
			     ideaNode = ideaList.dom.querySelector(".list-item.selected") || ideaList.dom.querySelector("li[data-listideas_id='0']"), 
			     id = 0;
			     
			     if (ideaNode) id = ideaNode.getAttribute("data-listideas_id");
			     
			     ideaNode.classList.add("selected");
			     ideaNode.scrollIntoView();
                             _radio.init(ideaNode);        
			     _detail.reset(ideaList.getModel(),id);            
			};
			
			// this piece can be considerably simplified --> using stack & control plugins
			
			_widget.show = function(event, node){
			     var id = parseInt(node.getAttribute("data-listbtns_id"), 10),
			         name = _btns.get(id).name,
			         st = _stack.getStack();
			         
			     if (name === "#lang"){
			             _widget.dom.querySelector(".langlist").classList.remove("invisible");
			     }
			     else {
			             _btns.loop(function(v,i){
                                                (i === id) ? _btns.update(i, "pushed", true) : _btns.update(i, "pushed", false);        
                                     });
                                     if (name !== st.getCurrentName){
			                     st.show(name);
			                     if (st.get(name).getModel().getNbItems()){
			                             _widget.displayHighlightedIdea();
			                     }
			                     else{
			                             _detail.displayEmpty(name);
			                     }
			             }
			     }  
			};
			
			_widget.setLang = function(event, node){
                                var id, lang;
                                event.stopPropagation();
                                event.preventDefault();
                                id = node.getAttribute("data-select_id");
                                lang = _languages.get(id).name;
                                _currentLang = lang;
                                
                                // set Spinner
                                _listSpinner.spin(document.getElementById("public-list"));
                                
                                // set flag in filter button
                                _btns.loop(function(v,i){
                                        if (v.name === "#lang") _btns.update(i, "lang", lang);
                                });
                                // remove flag list
                                _widget.dom.querySelector(".langlist").classList.add("invisible");
                                // apply language filter
                                ["#list-rating", "#list-fav", "#list-date"].forEach(function(name){
                                        var st = _stack.getStack();
                                        st.get(name).setLang(lang)
                                        .then(function(){
                                                if (st.getCurrentName() === name) _listSpinner.stop();
                                                if (st.getCurrentName() === name && st.get(name).getModel().getNbItems() === 0){
                                                        _detail.displayEmpty(name);
                                                }
                                                else _widget.displayHighlightedIdea();         
                                        });     
                                });
                        };
                        
                        _widget.stopPropagation = function(event,node){
                                event.stopPropagation();
                                event.preventDefault();       
                        };

			_widget.mosaic = function(){
				var domDetail = document.getElementById("public-detail");
                                _widget.dom.classList.toggle("mosaic");
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
			                             _widget.dom.querySelector(".listbtns").classList.remove("invisible");
                                                     // default list viewed by date
                                                     _stack.getStack().show("#list-date");
                                                     _btns.loop(function(v,i){
                                                                (v.name === "#list-date") ? _btns.update(i, "pushed", true) : _btns.update(i, "pushed", false);        
                                                     });
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
                                _widget.dom.querySelector(".listbtns").classList.add("invisible");
                                listSearch.resetQuery({q: query, sort: '\\creation_date<date>', include_docs: true})
                                .then(function(){
                                        _stack.getStack().show("#list-search");
                                        if (listSearch.getModel().getNbItems() >0){
                                                _widget.displayHighlightedIdea();
                                        }
                                        else {
                                                _detail.displayEmpty("search");
                                        }      
                                });
                        };

                        // reset function
                        _widget.reset = function reset(){
                                listRating.init();
                                listDate.init().then(function(){
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
			
			// INIT
			
			// menu UI
			_menu  = new Menu(_widget.dom.querySelector("#public-menu"));
                        _menu.toggleActive(false);
                        
                        // create db queries based on default language
                        if (_user.get("settings").contentLang) {
                                _currentLang = _user.get("settings").contentLang;
                                if (_currentLang === "all") _currentLang = "*";
                                _btns.loop(function(v,i){
                                        if (v.name==="#lang") _btns.update(i, "lang", _currentLang);
                                });
                        }
                        
                        if (_currentLang === "*"){
                                initQuery = {startkey:'[0,{}]', endkey:'[0]', descending: true, limit:50};
                        }
                        else{
                                initQuery = {startkey:'[1,"'+_currentLang+'", {}]', endkey:'[1,"'+_currentLang+'"]', descending: true, limit: 50};       
                        }
                        
                        //initialize list UIs
			listDate = new Polling(_db, "library", "_view/publicideasbylang", initQuery);
		        // list date needs to be in polling mode with a polling_interval defined in Config to avoid traffic overload
		        listRating = new List(_db, "ideas", "_view/ideasbyvotes", initQuery);
		        listFav = new List(_db, "library", "_view/publicideas", "fav");
			listSearch = new List("_fti/local/"+_db, "indexedideas", "publicbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:60, include_docs: true});
			 
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			_stack.getStack().add("#list-fav", listFav);
			_stack.getStack().add("#list-date", listDate);
			
			// init public ideas sorted by rating
			listRating.init();
			
			// init public ideas sorted by most recent then init public favorites
		        listDate.init()
		        .then(function(){
		                var lang;
		              _stack.getStack().show("#list-date");
		              (listDate.getModel().getNbItems()) ? _widget.displayHighlightedIdea() : _detail.displayEmpty("#list-date");
		              // apply default language to the list of favorites
		              return listFav.setLang(_currentLang);     
		        })
		        .then(function(){
		                // Watch for favorites changes in user document and update list accordingly
                                _user.watchValue("public-favorites", function(val){
                                        if (val.length !== listFav.getModel().getNbItems()) {
                                                listFav.resetQuery(_currentLang)
                                                .then(function(){
                                                        if (_stack.getStack().getCurrentName() === "#list-fav"){
                                                                (listFav.getModel().getNbItems()) ? _widget.displayHighlightedIdea() : _detail.displayEmpty("#list-fav");
                                                        }
                                                });
                                        }       
                                });
                                
                                // watch for default language filter changes
                                _user.watchValue("settings", function(s){
                                        if(!s.contentLang)  _currentLang = _user.get("lang").substring(0,2);
                                        else if (s.contentLang === "all"){
                                                _currentLang = "*";
                                        }
                                        else{
                                                _currentLang = s.contentLang;
                                        }
                                
                                        _btns.loop(function(v,i){
                                                if (v.name==="#lang") _btns.update(i, "lang", _currentLang);
                                        });
                                        ["#list-date", "#list-rating", "#list-fav"].forEach(function(ui){
                                                _stack.getStack().get(ui).setLang(_currentLang);        
                                        });
                                });
		        });

                        /*
                        * Manage idea related events
                        */
                       
                       // When an idea is deleted by the author
                       ["#list-date", "#list-rating", "#list-fav"].forEach(function(ui){
                                var wid =_stack.getStack().get(ui),
                                     _ideaList = wid.getModel(),
                                     _ideaNode, _id;
                                  
                                  // only do it for the current UI
                                  /*
                                 _ideaList.watch("deleted", function(){
                                         console.log("deleted");
                                         if (wid === _stack.getStack().getCurrentScreen()){
                                                _ideaNode = wid.dom.querySelector(".list-item.selected") || wid.dom.querySelector("li[data-listideas_id='0']");
                                                if (_ideaNode) _id = _ideaNode.getAttribute("data-listideas_id");
                                                (_ideaList.getNbItems()) ? _detail.reset(_ideaList, _id) :_detail.displayEmpty(_stack.getStack().getCurrentName());
                                        } 
                                 });
                                 */
                        });
		        
		        // when a new idea is created by the user 
                       _observer.watch("NewIdea", function(id, public){
                               var _ideaList = listDate.getModel(),
                                     _ideaNode, _id, idx, ideaElem;
                               
                               if (public){
                                       
                                       // display list of ideas by date and adjust filter buttons accordingly
                                       if (_stack.getStack().getCurrentName() !== "#list-date") _stack.getStack().show("#list-date");
                                       _btns.loop(function(v,i){
                                                (v.name === "#list-date") ? _btns.update(i, "pushed", true) : _btns.update(i, "pushed", false);        
                                     });
                                       
                                       // display spinner
                                       _listSpinner.spin(document.getElementById("public-list"));            
                                        
                                        listDate.resetQuery()
                                        .then(function(){             
                                                // get index of newly created idea in current list
                                                _ideaList.loop(function(v,i){
                                                        if (v.id === id) idx = i;
                                                });
                                        
                                                // remove current highlight
                                                _ideaNode = listDate.dom.querySelector(".list-item.selected");
                                                if (_ideaNode) _ideaNode.classList.remove("selected");
                                        
                                                // focus on new idea
                                                ideaElem = listDate.dom.querySelector("li[data-listideas_id='"+idx+"']");
                                                ideaElem.classList.add("selected");
                                                _radio.init(idx);
                                                        
                                                // display idea in the list and in the detail-view
                                                ideaElem.scrollIntoView();
                                                _detail.reset(_ideaList, idx);
                                        
                                                // stop the spinner
                                                _listSpinner.stop();
                                        });
                                }        
                        });
		        
                        //return
			return _widget;
		};
	});

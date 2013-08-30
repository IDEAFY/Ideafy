/*
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Control-plugin" ,
	"Bind.plugin", "Place.plugin", "Amy/Delegate-plugin", "service/map", "service/config",
	"./public-stack", "service/utils", "./lists/list-public", "./lists/list-polling", "Amy/Stack-plugin", "service/submenu", "Store"], 
	function(Widget, Control, Model, Place, Delegate, Map, 
		Config, Detail, Utils, List, Polling, Stack, Menu, Store){
		return function PublicConstructor(){
		//declaration
			var _widget = new Widget(),
				_dom, byDate, byRating,
				_db = Config.get("db"),
				_radio = new Control(_widget),
				_detail= new Detail(),
                                _menu, listDate, listRating, listFav, listSearch,
                                _user = Config.get("user"),
                                _btns = new Store([
                                        {name:"#list-fav", css:"byfav", pushed: false, lang:null},
                                        {name:"#list-date", css:"bydate", pushed: true, lang:null},
                                        {name:"#list-rating", css:"byrating", pushed: false, lang:null},
                                        {name:"#lang", css:"bylang", pushed: false, lang: "*"}
                                ]),
                                _languages = new Store([{name:"*"}]),
                                _usrLg = Config.get("userLanguages"),
				_stack = new Stack();

		//setup
		      // build languages & flags
		      _usrLg.forEach(function(val){
		              _languages.alter("push", val);
		      });
		
		      _widget.template='<div id="public"><div id = "public-menu"></div><div id="public-list" class="list"><div class="header blue-light"><div class="option left" data-publiccontrol="toggle:.option.left,mosaic,touchstart,mosaic"></div><span data-label="bind: innerHTML, publicideasheadertitle"></span><div class="option right" data-publicevent="listen: touchstart, plus"></div></div><div data-liststack="destination" data-publiccontrol="radio:li.list-item,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-label="bind: placeholder, searchpublicplaceholder" data-publicevent="listen: keypress, search"><ul class="listbtns" data-listbtns="foreach"><li class="tools-button" data-listbtns="bind:setName, name; bind:setClass, css; bind:setPushed, pushed; bind:setLang, lang" data-publicevent="listen:touchstart,show"></li></ul><ul class="langlist invisible" data-select="foreach"><li data-select="bind: setBg, name" data-publicevent="listen: touchstart, selectFlag; listen: touchend, setLang"></li></ul></div></div></div><div id="public-detail" class="details" data-publicplace="place:details"></div></div>';
		
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
                                                        this.setAttribute('sytle', "background-image: none;");
                                                        this.innerHTML="*";
                                                }
                                                else{
                                                        this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                                }
                                        } 
                                }),
				"label" : new Model(Config.get("labels")),

				/* mays be have event plugin in control*/
				"publicevent" : new Delegate(_widget),
				"publicplace" : new Place({"details": _detail}),
				"publiccontrol" :_radio
			});
			
			
                        _widget.place(Map.get("public"));

			_widget.selectStart = function(event){
				var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
				    _id = event.target.getAttribute("data-listideas_id");
				
				_detail.reset(_ideaList.get(_id).id);
				
			};
			
			// function used to retrieve the currently highlighted idea in a list and display its details
	               _widget.displayHighlightedIdea = function displayHighlightedIdea(){
			     var ideaList = _stack.getStack().getCurrentScreen(),
			         ideaNode = ideaList.dom.querySelector(".list-item.selected") || ideaList.dom.querySelector("li[data-listideas_id='0']"); 
			         id = ideaNode.getAttribute("data-listideas_id");
			     ideaNode.classList.add("selected");
			     ideaNode.scrollIntoView();
                             _radio.init(ideaNode);        
			     _detail.reset(ideaList.getModel().get(id).id);            
			};
			
			// this piece can be considerably simplified --> using stack & control plugins
			
			_widget.show = function(event, node){
			     var id = parseInt(node.getAttribute("data-listbtns_id"), 10),
			         name = _btns.get(id).name;
			         
			     _btns.loop(function(v,i){
			             (i === id) ? _btns.update(i, "pushed", true) : _btns.update(i, "pushed", false);        
			     });
			     
			     console.log(name);
			     
			     if (name === "#lang"){
			             
			             _widget.dom.querySelector(".langlist").classList.remove("invisible");
			     }
			     else if (name !== _stack.getStack().getCurrentName){
			             _stack.getStack().show(name);
			             _widget.displayHighlightedIdea();
			     }  
			};
			
			_widget.selectFlag = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = parseInt(node.getAttribute("data-select_id"), 10);
                                _languages.loop(function(v,i){
                                        (id === i) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);
                                })                
                        };
                        
                        _widget.setLang = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = node.getAttribute("data-select_id");
                                _btns.loop(function(v,i){
                                        if (v.name === "#lang") _btns.update(i, "lang", _languages.get(id).name);
                                });
                                _widget.dom.querySelector(".langlist").classList.add("invisible");        
                        };

			_widget.mosaic = function(){
				var domDetail = document.getElementById("public-detail");
                                _dom.classList.toggle("mosaic");
                                if (domDetail.classList.contains("invisible")) {
                                        domDetail.classList.remove("invisible");
                                        _detail.reset(listDate.get(0).id);
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
                                listRating.init();
                                listDate.init().then(function(){
                                        _stack.getStack().show("#list-date");
                                        _detail.reset(listDate.get(0).id);        
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
                        
                        // language
                        _user.watchValue("lang", function(lang){
                                _btns.loop(function(v,i){
                                        if (v.name==="#lang" && lang) _btns.update("lang", lang.substring(0,2));
                                });
                        });
                        
                        // dom items
                        _dom = _widget.dom;
                        byDate = _dom.querySelector(".bydate");
                        byRating =  _dom.querySelector(".byrating");
                        
                        //initialize list UIs
			listDate = new Polling(_db, "library", "_view/publicideas");
		        // list date needs to be in polling mode with a polling_interval defined in Config to avoid traffic overload
		        listRating = new List(_db, "ideas", "_view/ideasbyvotes");
		        listFav = new ListFav();
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

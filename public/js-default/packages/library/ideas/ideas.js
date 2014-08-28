/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      amy = require("../../../libs/amy2"),
      Widget = olives.OObject,
      Control = amy.ControlPlugin,
      Model = olives["Bind.plugin"],
      Delegate = amy.DelegatePlugin,
      Place = olives["Place.plugin"],
      Store = emily.Store,
      Map = require("../../../services/map"),
      Config = require("../../../services/config"),
      Detail = require("./idea-stack"),
      List = require("./lists/idealist"),
      Stack = amy.StackPlugin,
      Spinner = require("../../../libs/spin.min"),
      NewIdea = require("../../../services/newidea");

module.exports = function IdeasConstructor(){
		//declaration
			var _widget = new Widget(),
                              _searchInput = new Store({"search": ""}),
                              _db = Config.get("db"),
                              _observer = Config.get("observer"),
                              _radio = new Control(_widget),
                              _detail = new Detail(),
                              listDate, listRating, listSearch, listFav,
                              initldQuery, initlrQuery,
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
                        
                        // build languages & flags
                        _usrLg.forEach(function(val){
                                _languages.alter("push", val);
                        });
                
                       _widget.template='<div id = "ideas"><div id="idea-list" class="list"><div class="header blue-light"><div class="option left" data-ideascontrol="toggle:.option.left,mosaic,mousedown,mosaic"></div><span data-label="bind: innerHTML, idealistheadertitle">My Ideas</span><div class="option right" data-ideasevent="listen: mousedown, plus"></div></div><div data-idealiststack="destination" data-ideascontrol="radio:li.list-item,selected,mousedown,selectStart"><div class="tools"><input class="search" type="text" data-search="bind: value, search" data-label="bind: placeholder, searchprivateplaceholder" data-ideasevent="listen: keypress, search"><ul class="listbtns" data-listbtns="foreach"><li class="tools-button" data-listbtns="bind:setName, name; bind:setClass, css; bind:setPushed, pushed; bind:setLang, lang" data-ideasevent="listen:mouseup,show"></li></ul><ul class="langlist invisible" data-select="foreach"><li data-select="bind: setBg, name" data-ideasevent="listen: mousedown, setLang; listen:touchend, mouseup"></li></ul></div></div></div><div id="ideas-detail" class="details" data-ideaplace="place:details"></div></div>';
		       
			_widget.seam.addAll({
				"idealiststack" : _stack,
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
				"search" : new Model(_searchInput),

				/* mays be have event plugin in control*/
				"ideasevent" : new Delegate(_widget),
                                "ideaplace" : new Place({"details": _detail}),
				"ideascontrol" :_radio
			});
			
			_widget.place(Map.get("ideas"));

			_widget.selectStart = function(event){
                                var _ideaList = _stack.getStack().getCurrentScreen().getModel(),
                                      _id = event.target.getAttribute("data-listideas_id");
				    
				_detail.reset(_ideaList, _id);
				
				// clear search field
				_searchInput.set("search", "");
			};
			
			// function used to retrieve the currently highlighted idea in a list and display its details
                       _widget.displayHighlightedIdea = function displayHighlightedIdea(){
                             var ideaList = _stack.getStack().getCurrentScreen(),
                                 ideaNode = ideaList.dom.querySelector(".list-item.selected") || ideaList.dom.querySelector("li[data-listideas_id='0']"), 
                                 id;
                             
                             if (ideaNode){
                                        id = ideaNode.getAttribute("data-listideas_id");
                                        ideaNode.classList.add("selected");
                                        ideaNode.scrollIntoView();
                                        _radio.init(ideaNode);        
                                        _detail.reset(ideaList.getModel(), id);
                             }
                             else{
                                     _detail.displayEmpty(_stack.getStack().getCurrentName());
                             }             
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
                                             if (st.get(name).getModel().count()){
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
                                _listSpinner.spin(_widget.dom.querySelector("#idea-list"));
                                
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
                                                _listSpinner.stop();
                                                if (st.getCurrentName() === name && st.get(name).getModel().count() === 0){
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
			        var domDetail = document.getElementById("ideas-detail");
				_widget.dom.classList.toggle("mosaic");
				if (domDetail.classList.contains("invisible")) {
				        domDetail.classList.remove("invisible");
				        _detail.reset(listDate.getModel(), 0);
				}
				// else domDetail.classList.add("invisible");
				
				// enable specific presentation treatment in mosaic view
				if (_widget.dom.classList.contains("mosaic")){
				        ["#list-date", "#list-rating", "#list-fav", "#list-search"].forEach(function(ui){
                                                _stack.getStack().get(ui).setMosaic(true);        
                                        });
				}
				else{
				        ["#list-date", "#list-rating", "#list-fav", "#list-search"].forEach(function(ui){
                                                _stack.getStack().get(ui).setMosaic(false);        
                                        });        
				}
				
			};
			
			_widget.plus = function(){
			        NewIdea.reset();       
			};
			
			_widget.search = function (event, node){
			        var usr;
                                if (event.keyCode === 13){
                                     if (node.value === ""){
                                             _widget.dom.querySelector(".listbtns").classList.remove("invisible");
                                             // default list viewed by date
                                             _stack.getStack().show("#list-date");
                                             _btns.loop(function(v,i){
                                                (v.name === "#list-date") ? _btns.update(i, "pushed", true) : _btns.update(i, "pushed", false);        
                                             });
                                             _widget.displayHighlightedIdea();
                                     }
                                     else{
                                             usr = _user.get("_id").replace(/@/, "at");
                                             _widget.searchIdea("users:"+usr+ " AND "+node.value);
                                     }
                                     node.blur();
                                }
			};
			
			_widget.searchIdea = function searchIdea(query){
			      // hide sorting buttons (not available for the time being in search mode)
                                _widget.dom.querySelector(".listbtns").classList.add("invisible");
                                
                                listSearch.resetQuery({q: query, sort: '\\creation_date<date>', include_docs: true}).then(function(){
                                        // display search list and fill search field with idea title if applicable
                                        _stack.getStack().show("#list-search");
                                        if (listSearch.getModel().count() >0){
                                                _searchInput.set("search", listSearch.getModel().get(0).doc.title);
                                                _widget.dom.querySelector(".noresult").classList.add("invisible");
                                                _widget.displayHighlightedIdea();
                                        }
                                        else {
                                                _widget.dom.querySelector(".noresult").classList.remove("invisible");
                                        }        
                                });
                        };
			
			// reset function
                        _widget.reset = function reset(){
                                _searchInput.set("search", "");
                                listSearch.resetQuery({q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
                                listRating.resetQuery({startkey: '["'+Config.get("user").get("_id")+'",{}]', endkey: '["'+Config.get("user").get("_id")+'"]', descending: true, include_docs:true}) ;
                                listDate.resetQuery({key: '"'+_user.get("_id")+'"', descending: true, include_docs:true})
                                .then(function(){
                                        _stack.getStack().show("#list-date");
                                        _widget.displayHighlightedIdea();         
                                });        
                        };
                        
			// INIT
			
			// get user preferred language for content
                        (_user.get("settings").contentLang) ? _currentLang = _user.get("settings").contentLang : _currentLang = _user.get("lang").substring(0,2);
                        if (_currentLang === "all") _currentLang = "*";
                        
                        // update lang button
                        _btns.loop(function(v,i){
                                        if (v.name==="#lang") _btns.update(i, "lang", _currentLang);
                        });
                        
                        // create db queries based on default language
                        if (_currentLang === "*"){
                                initldQuery = {key: '"'+_user.get("_id")+'"', descending: true};
                                initlrQuery = {endkey: '[0,"'+_user.get("_id")+'"]', startkey: '[0,"'+_user.get("_id")+'",{},{}]', descending: true};
                        }
                        else{
                                initldQuery = {key:'[0,"'+_user.get("_id")+'","'+_currentLang+'"]', descending: true};
                                initlrQuery = {endkey: '[1,"'+_user.get("_id")+'","'+_currentLang+'"]', startkey: '[1,"'+_user.get("_id")+'","'+_currentLang+'",{},{}]', descending: true};
                        }
			
			// for library for the time being only propose list by date or search tool
			// additional options (rating/favorites etc. may be offered in the future)
			
                        listDate = new List(_db, "library", "_view/ideas", initldQuery);
                        listSearch = new List("_fti/local/"+_db, "indexedideas", "userbyname", {q: "init_listSearch_UI", sort: '\\creation_date<date>', limit:30, include_docs: true});
                        listRating = new List(_db, "ideas", "_view/privatebyvotes", initlrQuery);
                        listFav = new List(_db, "library", "_view/allideas", "fav");
			
			_stack.getStack().add("#list-date", listDate);
			_stack.getStack().add("#list-rating", listRating);
			_stack.getStack().add("#list-search", listSearch);
			_stack.getStack().add("#list-fav", listFav);
                        
                        listDate.init(_currentLang)
                        .then(function(){
                                _stack.getStack().show("#list-date");
                                (listDate.getModel().count()) ? _widget.displayHighlightedIdea() : _detail.displayEmpty("#list-date");
                                return listFav.setLang(_currentLang);     
                        })
                        .then(function(){
                                // Watch for favorites changes in user document and update list accordingly
                                _user.watchValue("library-favorites", function(val){
                                        if (val.length !== listFav.getModel().count()) {
                                                listFav.resetQuery(_currentLang)
                                                .then(function(){
                                                        if (_stack.getStack().getCurrentName() === "#list-fav"){
                                                                (listFav.getModel().count()) ? _widget.displayHighlightedIdea() : _detail.displayEmpty("#list-fav");
                                                        }
                                                });
                                        }       
                                });
                                
                                // watch for default language filter changes in settings
                                _user.watchValue("settings", function(s){
                                        var l = s.contentLang;
                                        if (l === "all") l ="*";
                                        if(l && l !== _currentLang){
                                                 _currentLang =l;
                                                
                                                //update buttons
                                                _btns.loop(function(v,i){
                                                        if (v.name==="#lang") _btns.update(i, "lang", _currentLang);
                                                });
                                                
                                                // refresh all lists
                                                ["#list-date", "#list-rating", "#list-fav"].forEach(function(ui){
                                                        _stack.getStack().get(ui).setLang(_currentLang);        
                                                });
                                        }
                                });
                        });
                        listRating.init(_currentLang);
                        
                        
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
                                         if (wid === _stack.getStack().getCurrentScreen()){
                                                _ideaNode = wid.dom.querySelector(".list-item.selected") || wid.dom.querySelector("li[data-listideas_id='0']");
                                                if (_ideaNode) _id = _ideaNode.getAttribute("data-listideas_id");
                                                (_ideaList.count()) ? _detail.reset(_ideaList, _id) :_detail.displayEmpty(_stack.getStack().getCurrentName());
                                        } 
                                 });
                                 */
                        });
                        
                       // when a new idea is created by the user 
                       _observer.watch("NewIdea", function(id){
                                ["#list-date", "#list-rating", "#list-fav", "#list-search"].forEach(function(ui){
                                        var wid =_stack.getStack().get(ui),
                                              _ideaList = wid.getModel(),
                                              _ideaNode, _id, idx, ideaElem;
                                        
                                        if (ui === _stack.getStack().getCurrentName()){
                                                // set Spinner
                                                _listSpinner.spin(document.getElementById("idea-list"));
                                                
                                                // watch for list update
                                                _ideaList.watch("added", function(){
                                                        // get index of newly created idea in current list
                                                        _ideaList.loop(function(v,i){
                                                                if (v.id === id) idx = i;
                                                        });
                                                        
                                                        // remove current highlight
                                                        _ideaNode = wid.dom.querySelector(".list-item.selected");
                                                        if (_ideaNode) _ideaNode.classList.remove("selected");
                                                        
                                                        // focus on new idea
                                                        ideaElem = wid.dom.querySelector("li[data-listideas_id='"+idx+"']");
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
                        });
                        
                        //return
			return _widget;
		};

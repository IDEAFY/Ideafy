/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "CouchDBView", "service/config", "Bind.plugin", "Event.plugin", "service/utils", "service/avatar", "service/actionbar", "Promise"], function(Widget, Store, CouchDBView, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function TwoQListConstructor($type, $db, $design, $view, $query) {
                var _store = new CouchDBView([]),
                    _searchList = new Store([]),
                    touchStart,
                    touchPoint,
                    className = "",
                    currentBar = null,
                    _options = {
                        db : $db,
                        view : $view,
                        design : $design,
                        query : {
                                descending : true
                        }
                     },
                     labels = Config.get("labels"),
                     widget = this;

                //setup
                _store.setTransport(Config.get("transport"));
                
                // adjust list height to take into account contact selection UI
                ($type === "contact") ? className = "contacttwoqlist" : className = "";
                
                this.template = '<div><ul class="twoq-list '+ className + '" data-twoqlist="foreach"><li class="list-item" data-twoqlistevent="listen:touchstart, setStart"><div class="item-header"><span class="date" data-twoqlist="bind:date,value.creation_date"></span></div><div class="item-body"><p data-twoqlist="bind:innerHTML,value.question"></p></div><div class="item-footer"><a class="item-twocent"></a><span class="replies" data-twoqlist="bind:showReplies, value.twocents"></span></div></li></ul><ul class="twoq-searchlist invisible ' + className + '" data-twoqsearch="foreach"><li class="list-item" data-twoqlistevent="listen:touchstart, setStart"><div class="item-header"><span class="date" data-twoqsearch="bind:date,value.creation_date"></span></div><div class="item-body"><p data-twoqsearch="bind:innerHTML,value.question"></p></div><div class="item-footer"><a class="item-twocent"></a><span class="replies" data-twoqsearch="bind:showReplies, value.twocents"></span></div></li></ul></div>';

                this.plugins.addAll({
                        "twoqlist": new Model(_store, {
                                date : function date(date) {
                                        (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                },
                                showReplies : function showReplies(twocents) {
                                        var nb;
                                        if (twocents) {
                                                nb = twocents.length;        
                                        }
                                        if (nb === 0) {
                                                this.innerHTML = labels.get("noreplyyet");
                                        }
                                        else if (nb === 1) {
                                                this.innerHTML = nb +" "+labels.get("showonetcreply");
                                        }
                                        else if (nb>1){
                                                this.innerHTML = nb + " " + labels.get("showtcrepliesafter");
                                        }
                                },
                                setAvatar : function setAvatar(author){
                                        var _ui, _frag;
                                        if (author){
                                                _frag = document.createDocumentFragment();
                                                _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                },
                                setVisibility : function(visibility){
                                        (visibility && visibility === "public") ? this.classList.add("public") : this.classList.remove("public");
                                }
                        }),
                        "twoqsearch" : new Model(_searchList, {
                                date : function date(date) {
                                        (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                },
                                showReplies : function showReplies(twocents) {
                                        var nb;
                                        if (twocents) {
                                                nb = twocents.length;        
                                        }
                                        if (nb === 0) {
                                                this.innerHTML = labels.get("noreplyyet");
                                        }
                                        else if (nb === 1) {
                                                this.innerHTML = nb +" "+labels.get("showonetcreply");
                                        }
                                        else if (nb>1){
                                                this.innerHTML = nb + " " + labels.get("showtcrepliesafter");
                                        }
                                },
                                setAvatar : function setAvatar(author){
                                        var _ui, _frag;
                                        if (author){
                                                _frag = document.createDocumentFragment();
                                                _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                },
                                setVisibility : function(visibility){
                                        (visibility && visibility === "public") ? this.classList.add("public") : this.classList.remove("public");
                                }
                        }),
                        "twoqlistevent" : new Event(this)
                        });

                this.getModel = function() {
                        var ret,search;
                        search = !widget.dom.querySelector(".twoq-searchlist").classList.contains("invisible");
                        (search) ? ret = _searchList : ret = _store;
                        return ret;
                };
                
                this.resetQuery = function(query) {
                        var promise = new Promise();
                        
                        _options.query = query;
                        _store.unsync();
                        _store.reset([]);
                        widget.hideSearch();
                        _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                currentBar && currentBar.hide();
                                promise.fulfill();
                        });
                        return promise;
                };

                this.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        if (currentBar){
                                 currentBar.hide();
                                 currentBar = null;        
                        }
                };
                
                this.showActionBar = function(event, node){
                        var id = node.getAttribute("data-twoqlist_id"),
                            dom = document.getElementById("mtc-list"),
                            frag, display = false;
                        
                        touchPoint = [event.pageX, event.pageY];
                                
                        // check if actionbar exists for this element
                        if (currentBar && currentBar.getParent() === node){
                                display = true;
                        }
                        
                        if (!display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                currentBar = new ActionBar("2Q", node, _store.get(id)._id);
                                frag = document.createDocumentFragment();  
                                currentBar.place(frag); // render action bar    
                                node.appendChild(frag); // display action bar
                        }
                };
                
                // toggle search list
               this.showSearch = function showSearch(){
                       var search = document.querySelector(".twoq-searchlist"),
                           list = document.querySelector(".twoq-list");
                        
                        if (search && search.classList.contains("invisible")){
                                list.classList.add("invisible");
                                search.classList.remove("invisible");
                        }     
                };
                
                this.hideSearch = function hideSearch(){
                       var search = this.dom.querySelector(".twoq-searchlist"),
                           list = this.dom.querySelector(".twoq-list");
                        
                        if (search && !search.classList.contains("invisible")){
                                list.classList.remove("invisible");
                                search.classList.add("invisible");
                        }     
                };
                
                // search twoquestions
                this.search = function search(text){
                        _searchList.reset([]);
                        if (text.toLowerCase()){
                                this.showSearch();
                                _store.loop(function(v,i){
                                        if (JSON.stringify(v).search(text) > -1) {_searchList.alter("push", v);}        
                                });
                        }
                        else {this.hideSearch();} 
                };

                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                
                this.init = function init(){
                        var promise = new Promise();
                            
                        _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                promise.fulfill();   
                        });
                        return promise;
                };
        }

        return function TwoQListFactory($type, $db, $design, $view, $query) {
                TwoQListConstructor.prototype = new Widget();
                return new TwoQListConstructor($type, $db, $design, $view, $query);
        };
});
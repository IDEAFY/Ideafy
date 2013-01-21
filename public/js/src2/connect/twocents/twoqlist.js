/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/TwoQList", ["Olives/OObject", "CouchDBStore", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Utils", "Ideafy/Avatar", "Ideafy/ActionBar", "Promise"], function(Widget, Store, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function TwoQListConstructor($type, $db, $design, $view, $query) {
                var _store = new Store([]),
                    _searchList = new Store([]),
                    touchStart,
                    touchPoint,
                    display = false,
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
                     labels = Config.get("labels");

                //setup
                _store.setTransport(Config.get("transport"));
                
                // adjust list height to take into account contact selection UI
                ($type === "contact") ? className = "contacttwoqlist" : className = "";
                
                this.template = '<div><ul class="twoq-list '+ className + '" data-twoqlist="foreach"><li class="list-item" data-twoqlistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class="item-header"><span class="date" data-twoqlist="bind:date,value.creation_date"></span></div><div class="item-body"><p data-twoqlist="bind:innerHTML,value.question"></p></div><div class="item-footer"><a class="item-twocent"></a><span class="replies" data-twoqlist="bind:showReplies, value.twocents"></span></div></li></ul><ul class="twoq-searchlist invisible ' + className + '" data-twoqsearch="foreach"><li class="list-item" data-twoqlistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class="item-header"><span class="date" data-twoqsearch="bind:date,value.creation_date"></span></div><div class="item-body"><p data-twoqsearch="bind:innerHTML,value.question"></p></div><div class="item-footer"><a class="item-twocent"></a><span class="replies" data-twoqsearch="bind:showReplies, value.twocents"></span></div></li></ul></div>';

                this.plugins.addAll({
                        "twoqlist": new Model(_store, {
                                date : function date(date) {
                                        (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                },
                                showReplies : function showReplies(twocents) {
                                        var nb = twocents.length;
                                        if (nb === 0) this.innerHTML = labels.get("noreplyyet")
                                        else if (nb === 1) this.innerHTML = nb +" "+labels.get("showonetcreply")
                                        else this.innerHTML = nb + " " + labels.get("showtcrepliesafter")
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
                                        (visibility === "public") ? this.classList.add("public") : this.classList.remove("public");
                                }
                        }),
                        "twoqsearch" : new Model(_searchList, {
                                date : function date(date) {
                                        (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                },
                                showReplies : function showReplies(twocents) {
                                        var nb = twocents.length;
                                        if (nb === 0) this.innerHTML = labels.get("noreplyyet")
                                        else if (nb === 1) this.innerHTML = nb +" "+labels.get("showonetcreply")
                                        else this.innerHTML = nb + " " + labels.get("showtcrepliesafter")
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
                                        (visibility === "public") ? this.classList.add("public") : this.classList.remove("public");
                                }
                        }),
                        "twoqlistevent" : new Event(this)
                        });

                this.getModel = function() {
                        return _store;
                };
                this.resetQuery = function(query) {
                        var promise = new Promise();
                        
                        _options.query = query;
                        _store.unsync();
                        _store.reset([]);
                        _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                promise.resolve();
                        });
                        return promise;
                };

                this.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        
                        if (currentBar) this.hideActionBar(currentBar);  // hide previous action bar 
                };
                
                this.showActionBar = function(event, node){
                        var id = node.getAttribute("data-twoqlist_id"),
                            dom = document.getElementById("mtc-list");
                        
                        touchPoint = [event.pageX, event.pageY];
                        
                        if (!dom.classList.contains("mosaic") && !display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                var actionBar = new ActionBar("2Q", node, _store.get(id).value, this.hideActionBar),
                                    frag = document.createDocumentFragment();  
                                
                                actionBar.place(frag); // render action bar    
                                node.appendChild(frag); // display action bar
                                currentBar = actionBar; // store current action bar
                                display = true; // prevent from showing it multiple times
                        }
                };
                
                this.hideActionBar = function hideActionBar(ui){
                        
                        var parent = ui.dom.parentElement;
                        
                        parent.removeChild(parent.lastChild);
                        display = false;
                        currentBar = null;
                };
                
                // toggle search list
               this.showSearch = function showSearch(){
                       var search = document.querySelector(".twoq-searchlist"),
                           list = document.querySelector(".twoq-list");
                        
                        if (search.classList.contains("invisible")){
                                list.classList.add("invisible");
                                search.classList.remove("invisible");
                        }     
                };
                
                this.hideSearch = function hideSearch(){
                       var search = document.querySelector(".twoq-searchlist"),
                           list = document.querySelector(".twoq-list");
                        
                        if (!search.classList.contains("invisible")){
                                list.classList.remove("invisible");
                                search.classList.add("invisible");
                        }     
                };
                
                // search twoquestions
                this.search = function search(text){
                        _searchList.reset([]);
                        if (text){
                                this.showSearch();
                                _store.loop(function(v,i){
                                        if (JSON.stringify(v).search(text) > -1) _searchList.alter("push", v)        
                                });
                        }
                        else this.hideSearch();  
                };

                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                
                this.init = function init(){
                        var promise = new Promise();
                            
                        _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                promise.resolve();   
                        });
                        return promise;
                };
        }

        return function TwoQListFactory($type, $db, $design, $view, $query) {
                TwoQListConstructor.prototype = new Widget();
                return new TwoQListConstructor($type, $db, $design, $view, $query);
        };
});
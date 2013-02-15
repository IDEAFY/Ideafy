/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "CouchDBStore", "Store", "service/config", "Olives/Model-plugin", "Olives/Event-plugin", "service/utils", "service/avatar", "service/actionbar", "Promise"], function(Widget, CouchDBStore, Store, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function ListPollingConstructor($db, $design, $view, $query) {
                var _store = new Store([]),
                touchStart,
                touchPoint,
                display = false,
                currentBar = null,
                _options = {
                        db : $db,
                        view : $view,
                        design : $design,
                        query : {
                                descending : true,
                                include_docs : true,
                                limit : 30
                        }
                };

                this.template = "<ul class='ideas-list' data-listideas='foreach'>" + "<li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,doc.title'>Idea title</h3>" + "<p data-listideas='bind:innerHTML,doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, value.rating'></span>" + " </div>" + "</li>" + "</ul>";

                this.plugins.addAll({
                        "listideas" : new Model(_store, {
                                date : function date(date) {
                                        this.innerHTML = Utils.formatDate(date);
                                },
                                setRating : function setRating(rating) {
                                        if (rating === undefined) {
                                                var _id = this.getAttribute("data-listideas_id"),
                                                    _arr = _store.get(_id).doc.votes || [];
                                                if (_arr.length === 0) {this.innerHTML = ""}
                                                else {
                                                        this.innerHTML = Math.round(_arr.reduce(function(x,y){return x+y;})/_arr.length*100)/100;
                                                }
                                                
                                        }
                                        else this.innerHTML = rating;
                                },
                                setAvatar : function setAvatar(authors){
                                        var _ui, _frag;
                                        _frag = document.createDocumentFragment();
                                        _ui = new Avatar(authors);
                                        _ui.place(_frag);
                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                }
                        }),
                        "listevent" : new Event(this)
                        });

                this.getModel = function() {
                        return _store;
                };
                
                this.resetQuery = function(query) {
                        var promise=new Promise(),
                            cdb = new CouchDBStore();
                        _options.query = query;

                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                _store.reset(JSON.parse(cdb.toJSON()));
                                cdb.unsync();
                                setInterval(function(){
                                        console.log("reset query: polling every 60 s");
                                        cdb.reset();
                                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                                _store.reset(JSON.parse(cdb.toJSON()));
                                                cdb.unsync();
                                        });
                                },Config.get("polling_interval"));
                                promise.resolve();
                        });
                        return promise;
                };
                
                this.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        
                        if (currentBar) this.hideActionBar(currentBar);  // hide previous action bar 
                };
                
                this.showActionBar = function(event, node){
                        var id = node.getAttribute("data-listideas_id"),
                            dom = document.getElementById("public");
                        
                        touchPoint = [event.pageX, event.pageY];
                        
                        if (!dom.classList.contains("mosaic") && !display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                var actionBar = new ActionBar("idea", node, _store.get(id).doc, this.hideActionBar),
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

                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                this.init = function init(initCallback){
                        var promise = new Promise(),
                            cdb = new CouchDBStore();
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                _store.reset(JSON.parse(cdb.toJSON()));
                                initCallback(_store, 0);
                                cdb.unsync();
                                setInterval(function(){
                                        console.log("polling every 60 s");
                                        cdb.reset();
                                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                                _store.reset(JSON.parse(cdb.toJSON()));
                                                cdb.unsync();
                                        });
                                },Config.get("polling_interval"));
                                promise.resolve();      
                        });
                        return promise;
                };

        }

        return function ListPollingFactory($db, $design, $view, $query) {
                ListPollingConstructor.prototype = new Widget();
                return new ListPollingConstructor($db, $design, $view, $query);
        };
}); 
/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "CouchDBView", "Store", "service/config", "Bind.plugin", "Event.plugin", "service/utils", "service/avatar", "service/actionbar", "Promise"], function(Widget, CouchDBView, Store, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function ListPollingConstructor($db, $design, $view, $query) {
                var _store = new CouchDBView([]),
                touchStart,
                touchPoint,
                polling, // timer variable (to use clearInterval)
                display = false,
                currentBar = null,
                user = Config.get("user"),
                _options = {
                        db : $db,
                        view : $view,
                        design : $design,
                        query : {
                                descending : true,
                                limit : 50
                        }
                },
                widget = this;

                this.template = "<ul class='idea-list' data-listideas='foreach'>" + "<li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,value.doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,value.doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,value.doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3>" + "<p data-listideas='bind:setDesc,value.doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, value.rating'></span>" + " </div>" + "</li>" + "</ul>";

                this.plugins.addAll({
                        "listideas" : new Model(_store, {
                                date : function date(creadate) {
                                        this.innerHTML = Utils.formatDate(creadate);
                                },
                                
                                setDesc : function(desc){
                                        this.innerHTML = desc.replace(/\n/g, "<br>");        
                                },
                                setRating : function setRating(rating) {
                                        if (rating === undefined) {
                                                var _id = this.getAttribute("data-listideas_id"),
                                                    _arr = _store.get(_id).doc.votes || [];
                                                if (_arr.length === 0) {this.innerHTML = "";}
                                                else {
                                                        this.innerHTML = Math.round(_arr.reduce(function(x,y){return x+y;})/_arr.length*100)/100;
                                                }
                                                
                                        }
                                        else {this.innerHTML = rating;}
                                },
                                setAvatar : function setAvatar(authors){
                                        var _ui, _frag;
                                        /*if (authors){
                                                _frag = document.createDocumentFragment();
                                                _ui = new Avatar(authors);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }*/
                                }
                        }),
                        "listevent" : new Event(this)
                        });

                this.getModel = function() {
                        return _store;
                };
                
                widget.resetQuery = function resetQuery(query) {
                        var promise=new Promise(),
                            interval = user.get("settings").polling_interval || Config.get("polling_interval"),
                            cdb = new CouchDBView();
                        if (query) {_options.query = query;}
                        
                        clearInterval(polling);
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                _store.reset(JSON.parse(cdb.toJSON()));
                                cdb.unsync();
                                polling = setInterval(function(){
                                        cdb.reset([]);
                                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                                _store.reset(JSON.parse(cdb.toJSON()));
                                                cdb.unsync();
                                        });
                                },interval);
                                promise.fulfill();
                        });
                        return promise;
                };
                
                this.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        
                        if (currentBar) {this.hideActionBar(currentBar);}  // hide previous action bar 
                };
                
                this.showActionBar = function(event, node){
                        var id = node.getAttribute("data-listideas_id"),
                            dom = document.getElementById("public");
                        
                        touchPoint = [event.pageX, event.pageY];
                        
                        if (!dom.classList.contains("mosaic") && !display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                var actionBar = new ActionBar("idea", node, _store.get(id).id, this.hideActionBar),
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
                
                this.init = function init(){
                        var promise = new Promise(),
                            interval = user.get("settings").polling_interval || Config.get("polling_interval"),
                            cdb = new CouchDBView();
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                _store.reset(JSON.parse(cdb.toJSON()));
                                cdb.unsync();
                                polling = setInterval(function(){
                                        cdb.reset([]);
                                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                                _store.reset(JSON.parse(cdb.toJSON()));
                                                cdb.unsync();
                                        });
                                },interval);
                                promise.fulfill();      
                        });
                        return promise;
                };
                
                // watch for change in polling interval in user settings
                user.watchValue("settings", function(){
                        var cdb = new CouchDBView(), interval;
                        if (user.get("settings").polling_interval !== Config.get("polling_interval")){
                                Config.set("polling_interval", user.get("settings").polling_interval);
                                interval = Config.get("polling_interval");
                                clearInterval(polling);
                                cdb.setTransport(Config.get("transport"));
                                polling = setInterval(function(){
                                        cdb.reset();
                                        cdb.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                                _store.reset(JSON.parse(cdb.toJSON()));
                                                cdb.unsync();
                                        });
                                },interval);        
                        }        
                });
                
                // watch for "user-triggered" update events
                Config.get("observer").watch("update-polling", function(){
                        widget.resetQuery();                
                });

        }

        return function ListPollingFactory($db, $design, $view, $query) {
                ListPollingConstructor.prototype = new Widget();
                return new ListPollingConstructor($db, $design, $view, $query);
        };
}); 
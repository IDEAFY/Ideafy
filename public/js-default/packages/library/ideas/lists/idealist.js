/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "CouchDBView", "service/config", "Bind.plugin", "Event.plugin", "service/utils", "service/avatar", "service/actionbar", "Promise"], function(Widget, CouchDBView, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function IdeaListConstructor($db, $design, $view, $query) {
                var _store = new CouchDBView([]),
                display = false,
                currentBar = null,
                    _options = {
                        db : $db,
                        view : $view,
                        design : $design,
                        query : {
                                descending : true
                        }
                };

                //setup
                _store.setTransport(Config.get("transport"));
                
                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                this.template = '<div><div id="noresult" class="date invisible" data-labels="bind:innerHTML, noresult"></div><ul class="idea-list" data-listideas="foreach"><li class="list-item" data-listevent="listen:mousedown, setStart; listen:dblclick, showActionBar"><div class="item-header"><div class="avatar" data-listideas="bind:setAvatar,value.doc.authors"></div><h2 data-listideas="bind:innerHTML,value.doc.authornames"></h2><span class="date" data-listideas="bind:date, value.doc.creation_date"></span></div><div class="item-body"><h3 data-listideas="bind:innerHTML,value.doc.title"></h3><p data-listideas="bind:innerHTML, value.doc.description"></p></div><div class="item-footer"><a class="idea-type private" data-listideas="bind:setVisibility, value.doc.visibility"></a><a class="item-acorn"></a><span class="rating" data-listideas="bind:setRating, value.rating"></span></div></li></ul></div>';
                
                // change template for listSearch
                if (_options.query.q){
                        this.template = '<div><div id="noresult" class="date invisible" data-labels="bind:innerHTML, noresult"></div><ul class="idea-list" data-listideas="foreach"><li class="list-item" data-listevent="listen:mousedown, setStart; listen:dblclick, showActionBar"><div class="item-header"><div class="avatar" data-listideas="bind:setAvatar,doc.authors"></div><h2 data-listideas="bind:innerHTML,doc.authornames"></h2><span class="date" data-listideas="bind:date, doc.creation_date"></span></div><div class="item-body"><h3 data-listideas="bind:innerHTML,doc.title"></h3><p data-listideas="bind:setDesc, doc.description"></p></div><div class="item-footer"><a class="idea-type private" data-listideas="bind:setVisibility, doc.visibility"></a><a class="item-acorn"></a><span class="rating" data-listideas="bind:setRating, rating"></span></div></li></ul></div>';        
                }

                this.plugins.addAll({
                        "labels": new Model(Config.get("labels")),
                        "listideas": new Model(_store, {
                                date : function date(date) {
                                        (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                },
                                setDesc : function(desc){
                                        this.innerHTML = desc.replace(/\n/g, "<br>");        
                                },
                                setRating : function setRating(rating) {
                                        if (rating === undefined) {
                                                var _id = this.getAttribute("data-listideas_id"),
                                                    _arr = _store.get(_id).doc.votes || [];
                                                if (_arr.length === 0) {this.innerHTML = "0";}
                                                else {
                                                        this.innerHTML = Math.round(_arr.reduce(function(x,y){return x+y;})/_arr.length*100)/100;
                                                }
                                                
                                        }
                                        else this.innerHTML = Math.round(rating*100)/100;
                                },
                                setAvatar : function setAvatar(authors){
                                        var _ui, _frag;
                                        /*if (authors){
                                                _frag = document.createDocumentFragment();
                                                _ui = new Avatar(authors);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }*/
                                },
                                setVisibility : function(visibility){
                                        (visibility === "public") ? this.classList.add("public") : this.classList.remove("public");
                                }
                        }),
                        "listevent" : new Event(this)
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
                                promise.fulfill();
                        });
                        return promise;
                };

                this.setStart = function(event, node){
                        currentBar && currentBar.hide();  // hide previous action bar  
                };
                
                this.showActionBar = function(event, node){
                        var id = node.getAttribute("data-listideas_id"),
                            display = false, frag,
                            dom = document.getElementById("ideas");
                        
                        // check if actionbar exists for this element
                        if (currentBar && currentBar.getParent() === node){
                                display = true;
                        }
                                
                        if (!dom.classList.contains("mosaic") && !display){
                                currentBar = new ActionBar("idea", node, _store.get(id).id);
                                frag = document.createDocumentFragment(); 
                                currentBar.place(frag); // render action bar    
                                node.appendChild(frag); // display action bar
                                display = true; // prevent from showing it multiple times
                        }
                };
                
                this.init = function init(){
                        var promise = new Promise();
                        _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                promise.fulfill();   
                        });
                        return promise;
                };
        }

        return function IdeaListFactory($db, $design, $view, $query) {
                IdeaListConstructor.prototype = new Widget();
                return new IdeaListConstructor($db, $design, $view, $query);
        };
}); 
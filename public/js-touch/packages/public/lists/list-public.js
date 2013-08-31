/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "CouchDBView", "service/config", "Bind.plugin", "Event.plugin", "service/utils", "service/avatar", "service/actionbar", "Promise"], function(Widget, CouchDBView, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function ListPublicConstructor($db, $design, $view, $query) {
                var _store = new CouchDBView([]),
                _usr =  Config.get("user"),
                touchStart,
                touchPoint,
                currentBar = null,
                _options = {
                        db : $db,
                        view : $view,
                        design : $design,
                        query : {
                                descending : true,
                                limit : 50
                        }
                };

                //setup
                _store.setTransport(Config.get("transport"));
                
                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                this.template = "<div><div id='noresult' class='date invisible' data-labels='bind:innerHTML,noresult' ></div><ul class='idea-list' data-listideas='foreach'>" + "<li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,value.doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,value.doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,value.doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3>" + "<p data-listideas='bind:innerHTML,value.doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, value.rating'></span>" + " </div>" + "</li>" + "</ul></div>";

                // change template for listSearch
                if (_options.query.q){
                        this.template = "<div><div id='noresult' class='date invisible' data-labels='bind:innerHTML,noresult' ></div><ul class='idea-list' data-listideas='foreach'>" + "<li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,doc.title'>Idea title</h3>" + "<p data-listideas='bind:setDesc,doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, rating'></span>" + " </div>" + "</li>" + "</ul></div>";       
                }
                
                this.plugins.addAll({
                        "labels" : new Model(Config.get("labels")),
                        "listideas" : new Model(_store, {
                                date : function date(date) {
                                        if (date) this.innerHTML = Utils.formatDate(date);
                                },
                                setDesc : function(desc){
                                        if (desc) this.innerHTML = desc.replace(/\n/g, "<br>");        
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
                
                this.resetQuery = function(query) {
                        var promise=new Promise(),
                            fav = _usr.get("public-favorites") || [],
                            json = {idList: fav};
                        _options.query = query;

                        _store.unsync();
                        _store.reset([]);
                        
                        if ($query === "fav" && fav.length){
                                Config.get("transport").request("GetFavList", json, function(res){
                                        console.log("fav update result : ", res);
                                        _store.reset(JSON.parse(res));
                                        promise.fulfill();
                                });
                        }
                        else {
                                _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                        currentBar && currentBar.hide();
                                        promise.fulfill();      
                                });
                        }
                        
                        return promise;
                };
                
                this.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        currentBar && currentBar.hide(); 
                };
                
                this.showActionBar = function(event, node){
                        var id = node.getAttribute("data-listideas_id"),
                            dom = document.getElementById("public"),
                            frag, display = false;
                        
                        touchPoint = [event.pageX, event.pageY];
                                
                        // check if actionbar exists for this element
                        if (currentBar && currentBar.getParent() === node){
                                display = true;
                        }
                        
                        if (!display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                currentBar = new ActionBar("idea", node, _store.get(id).id);
                                frag = document.createDocumentFragment();  
                                currentBar.place(frag); // render action bar    
                                node.appendChild(frag); // display action bar
                        }
                };
                
                this.init = function init(){
                        var promise = new Promise(),
                            fav = _usr.get("public-favorites") || [],
                            json = {idList : fav};
                        if ($query === "fav"){
                                if (fav.length){
                                        console.log("before fav httpreq");
                                        Config.get("transport").request("GetFavList", json, function(res){
                                                console.log(res);
                                                _store.reset(JSON.parse(res));
                                                promise.fulfill();
                                        });
                                }
                                else {
                                        _store.reset([]);
                                        promise.fulfill();
                                }
                        }
                        else {
                                _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                        promise.fulfill();      
                                });
                        }
                        return promise;
                };

        }

        return function ListPublicFactory($db, $design, $view, $query) {
                ListPublicConstructor.prototype = new Widget();
                return new ListPublicConstructor($db, $design, $view, $query);
        };
}); 
/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "CouchDBView", "service/config", "Bind.plugin", "Event.plugin", "service/utils", "service/avatar", "service/actionbar", "Promise"], function(Widget, CouchDBView, Config, Model, Event, Utils, Avatar, ActionBar, Promise) {
        function ListPublicConstructor($db, $design, $view, $query) {
                var _store = new CouchDBView([]),
                    _usr =  Config.get("user"),
                    display = false,
                    currentBar = null,
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

                //setup
                _store.setTransport(Config.get("transport"));
                
                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                this.template = "<div><div class='noresult date invisible' data-labels='bind:innerHTML,noresult' ></div><ul class='idea-list' data-listideas='foreach'>" + "<li class='list-item' data-listevent='listen:mousedown, setStart; listen:dblclick, showActionBar'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,value.doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,value.doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,value.doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3>" + "<p data-listideas='bind:innerHTML,value.doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, value.rating'></span>" + " </div>" + "</li>" + "</ul></div>";

                // change template for listSearch
                if (_options.query.q){
                        this.template = "<div><div class='noresult date invisible' data-labels='bind:innerHTML,noresult' ></div><ul class='idea-list' data-listideas='foreach'>" + "<li class='list-item' data-listevent='listen:mousedown, setStart; listen:dblclick, showActionBar'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,doc.title'>Idea title</h3>" + "<p data-listideas='bind:setDesc,doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, rating'></span>" + " </div>" + "</li>" + "</ul></div>";       
                }
                
                widget.plugins.addAll({
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
                                                if (_arr.length === 0) {this.innerHTML = "";}
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

                widget.getModel = function() {
                        return _store;
                };
                
                widget.resetQuery = function(query) {
                        var promise=new Promise(),
                            fav = _usr.get("public-favorites") || [],
                            json = {idList: fav},
                            nores = widget.dom.querySelector(".noresult");
                            
                        _options.query = query;
                        _store.unsync();
                        _store.reset([]);
                        
                        if ($query === "fav" && fav.length){
                                Config.get("transport").request("GetFavList", json, function(res){
                                        var arr = JSON.parse(res), i, l, lang;
                                        if (!query || query === "*") _store.reset(arr);
                                        else{
                                                for (i=0, l=arr.length; i<l; i++){
                                                        lang = arr[i].value.doc.lang.substring(0,2);
                                                        if (query === lang) _store.alter("push", arr[i]);
                                                }        
                                        }
                                        (_store.getNbItems()) ? nores.classList.add("invisible") : nores.classList.remove("invisible");
                                        promise.fulfill();
                                });
                        }
                        else {
                                _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                        currentBar && currentBar.hide();
                                        (_store.getNbItems()) ? nores.classList.add("invisible") : nores.classList.remove("invisible");
                                        promise.fulfill();      
                                });
                        }
                        
                        return promise;
                };
                
                widget.setLang = function(lang){
                        if ($query === "fav") return widget.resetQuery(lang);
                        else if (lang === "*"){
                                return widget.resetQuery({startkey:'[0,{}]', endkey:'[0]',descending : true,limit : 50});        
                        }
                        else{
                                return widget.resetQuery({startkey:'[1,"'+lang+'", {}]', endkey:'[1,"'+lang+'"]', descending: true, limit: 50});
                        }  
                };
                
                widget.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        if (currentBar){
                                currentBar.hide();
                                currentBar = null;
                        } 
                };
                
                widget.showActionBar = function(event, node){
                        var id = node.getAttribute("data-listideas_id"),
                            display = false, frag,
                            dom = document.getElementById("public");
                        
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
                
                widget.init = function init(){
                        var promise = new Promise(),
                            fav = _usr.get("public-favorites") || [],
                            json = {idList : fav},
                            nores = widget.dom.querySelector(".noresult");
                        if ($query === "fav"){
                                if (fav.length){
                                        Config.get("transport").request("GetFavList", json, function(res){
                                                _store.reset(JSON.parse(res));
                                                nores.classList.add("invisible");
                                                promise.fulfill();
                                        });
                                }
                                else {
                                        _store.reset([]);
                                        nores.classList.remove("invisible");
                                        promise.fulfill();
                                }
                        }
                        else {
                                _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                        (_store.getNbItems()) ? nores.classList.add("invisible") : nores.classList.remove("invisible");
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
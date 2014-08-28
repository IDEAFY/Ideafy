/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../../libs/olives"),
      emily = require("../../../../libs/emily"),
      CouchDBTools = require("../../../../libs/CouchDBTools"),
      Widget = olives.OObject,
      Store = emily.Store,
      CouchDBView = CouchDBTools.CouchDBView,
      Config = require("../../../../services/config"),
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Utils = require("../../../../services/utils"),
      Avatar = require("../../../../services/avatar"),
      ActionBar = require("../../../../services/actionbar"),
      Promise = emily.Promise;

function IdeaListConstructor($db, $design, $view, $query) {
                var _store = new CouchDBView([]),
                      _mosaic = new Store(),
                      touchStart,
                      touchPoint,
                      display = false,
                      currentBar = null,
                      _options = {
                              db : $db,
                              view : $view,
                              design : $design,
                              query : {
                                      descending : true
                              }
                      },
                      user = Config.get("user"),
                      widget = this;

                //setup
                _store.setTransport(Config.get("transport"));
                
                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                widget.template = '<div><div class="noresult date invisible" data-labels="bind:innerHTML, noresult"></div><ul class="idea-list" data-listideas="foreach"><li class="list-item" data-listevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class="item-header"><div class="avatar" data-listideas="bind:setAvatar,value.doc.authors"></div><h2 data-listideas="bind:innerHTML,value.doc.authornames" data-display="bind:setAuthornames, mosaic"></h2><span class="date" data-listideas="bind:date, value.doc.creation_date"></span></div><div class="item-body"><h3 data-listideas="bind:innerHTML,value.doc.title"></h3><p data-listideas="bind:innerHTML, value.doc.description"></p></div><div class="item-footer"><a class="idea-type private" data-listideas="bind:setVisibility, value.doc.visibility"></a><a class="item-acorn"></a><span class="rating" data-listideas="bind:setRating, value.rating"></span></div></li></ul></div>';
                
                // change template for listSearch
                if (_options.query.q){
                        widget.template = '<div><div class="noresult date invisible" data-labels="bind:innerHTML, noresult"></div><ul class="idea-list" data-listideas="foreach"><li class="list-item" data-listevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class="item-header"><div class="avatar" data-listideas="bind:setAvatar,doc.authors"></div><h2 data-listideas="bind:innerHTML,doc.authornames" data-display="bind:setAuthornames, mosaic"></h2><span class="date" data-listideas="bind:date, doc.creation_date"></span></div><div class="item-body"><h3 data-listideas="bind:innerHTML,doc.title"></h3><p data-listideas="bind:setDesc, doc.description"></p></div><div class="item-footer"><a class="idea-type private" data-listideas="bind:setVisibility, doc.visibility"></a><a class="item-acorn"></a><span class="rating" data-listideas="bind:setRating, rating"></span></div></li></ul></div>';
                }

                widget.seam.addAll({
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
                        "display" : new Model(_mosaic, {
                                setAuthornames : function(mosaic){
                                        var _id = this.getAttribute("data-listideas_id"),
                                              names = _store.get(_id).value.doc.authornames,
                                              authors = _store.get(_id).value.doc.authors;
                                        if (mosaic && authors.length > 1){
                                                this.innerHTML = names.split(',')[0] + labels.get("andothers");
                                        }
                                        else this.innerHTML = names;
                                } 
                        }),
                        "listevent" : new Event(this)
                        });

                widget.getModel = function() {
                        return _store;
                };
                widget.resetQuery = function(query) {
                        var promise = new Promise(), nores = widget.dom.querySelector(".noresult"),
                            fav = Config.get("user").get("library-favorites") || [],
                            json = {idList: fav};
                        _options.query = query;
                        _store.unsync();
                        _store.reset([]);
                        if ($query === "fav"){
                                Config.get("transport").request("GetFavList", json, function(res){
                                        var arr = JSON.parse(res), i, l, lang;
                                        if (!query || query === "*") _store.reset(arr);
                                        else{
                                                for (i=0, l=arr.length; i<l; i++){
                                                        lang = arr[i].value.doc.lang.substring(0,2);
                                                        if (query === lang) _store.alter("push", arr[i]);
                                                }        
                                        }
                                        (_store.count()) ? nores.classList.add("invisible") : nores.classList.remove("invisible");
                                        promise.fulfill();
                                });
                        }
                        else {
                                _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                        currentBar && currentBar.hide();
                                        (_store.count()) ? nores.classList.add("invisible") : nores.classList.remove("invisible");
                                        promise.fulfill();      
                                });
                        }
                        return promise;
                };

                widget.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                        if (currentBar){
                                 currentBar.hide();
                                 currentBar = null;        
                        } 
                };
                
                widget.setLang = function(lang){
                        var query;
                        if ($query === "fav") query = lang;
                        else {
                                switch($view){
                                        case "_view/ideas":
                                                if (lang === "*"){
                                                        query = {key: '"' + user.get("_id")+'"', descending: true};        
                                                }
                                                else{
                                                        query = {key:'[0,"'+user.get("_id")+'","'+lang+'"]', descending: true};
                                                }
                                                break;
                                        case "_view/privatebyvotes":
                                                if (lang === "*"){
                                                        query = {endkey: '[0,"'+user.get("_id")+'"]', startkey: '[0,"'+user.get("_id")+'",{},{}]', descending: true};
                                                }
                                                else {
                                                        query = {endkey: '[1,"'+user.get("_id")+'"]', startkey: '[1,"'+user.get("_id")+'","'+lang+'",{},{}]', descending: true};        
                                                }
                                                break;
                                        default:
                                                break;        
                                }
                        }
                        return widget.resetQuery(query); 
                };
                
                widget.setMosaic = function(mosaic){
                        (mosaic) ? _mosaic.set("mosaic", true) : _mosaic.set("mosaic", false);
                };
                
                widget.showActionBar = function(event, node){
                        var id = node.getAttribute("data-listideas_id"),
                              dom = document.getElementById("ideas"),
                              frag,
                              display = false;
                        
                        touchPoint = [event.pageX, event.pageY];
                                
                        // check if actionbar exists for this element
                        if (currentBar && currentBar.getParent() === node){
                                display = true;
                        }
                        
                        if (!dom.classList.contains("mosaic") && !display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                currentBar = new ActionBar("idea", node, _store.get(id).id);
                                frag = document.createDocumentFragment();  
                                currentBar.place(frag); // render action bar    
                                node.appendChild(frag); // display action bar
                                display = true; // prevent from showing it multiple times
                        }
                };
                
                widget.init = function init(){
                        var promise = new Promise(),
                            fav = user.get("library-favorites") || [],
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
                                        (_store.count()) ? nores.classList.add("invisible") : nores.classList.remove("invisible");
                                        promise.fulfill();      
                                });
                        }
                        return promise;
                };
};

module.exports = function IdeaListFactory($db, $design, $view, $query) {
        IdeaListConstructor.prototype = new Widget();
        return new IdeaListConstructor($db, $design, $view, $query);
};
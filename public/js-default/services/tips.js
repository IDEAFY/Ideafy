/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store", "CouchDBView"],
        function(Widget, Map, Model, Event, Config, Store, CouchDBView){
                
                return function TipsConstructor($firstStart){
                
                        var _widget = new Widget(),
                            _labels = Config.get("labels"),
                            _cdb = new CouchDBView([]),
                            _user = Config.get("user"),
                            _previous = [],
                            _allTips = new Store([]),
                            _tip = new Store({});
                        
                        _cdb.setTransport(Config.get("transport"));
                        
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "tip" : new Model(_tip,{
                                        setTitle : function(id){
                                                if (id === "TIP:0") this.innerHTML = _labels.get("signupwelcomeobject");
                                                else this.innerHTML = _labels.get("dyknow");       
                                        }
                                }),
                                "tipevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div><div class="help-doctor"></div><div class="close-tip" data-tipevent="listen:mousedown, close"></div><div class="tip-screen"><legend data-tip="bind:setTitle, id"></legend><p data-tip = "bind: innerHTML, body"></p><div class="next-button" data-labels = "bind: innerHTML, nextbutton" data-tipevent="listen: mousedown, press; listen:mouseup, next"></div></div><div class="tip-footer"><input type="checkbox" data-tipevent="listen: change, doNotShow"><label data-labels="bind: innerHTML, notips"></label></div></div>';
                        
                        
                        _widget.init = function init(firstStart){
                                _cdb.sync(Config.get("db"), "about", "_view/tip")
                                .then(function(){
                                        // init allTips store with proper language
                                        var lang = _user.get("lang");
                                                
                                        _cdb.loop(function(v,i){
                                                var doc = v.value;
                                                if (doc.default_lang === lang || !doc.translations[lang] ){
                                                        _allTips.alter("push", {"id": doc._id, "title": doc.title, "body": doc.body});
                                                }
                                                else{
                                                        _allTips.alter("push", {"id": doc._id, "title": doc.translations[lang].title, "body": doc.translations[lang].body});
                                                }
                                        });
                                        
                                        _cdb.unsync();
                                        
                                        if (firstStart){
                                                _tip.reset(_allTips.get(0));
                                        }
                                        else {
                                                // remove welcome message
                                                _allTips.alter("splice", 0, 1);
                                                _widget.getRandomTip();
                                        }
                                        _widget.place(Map.get("tip-popup"));
                                        document.getElementById("tip-popup").classList.add("visible");
                                        document.getElementById("cache").classList.add("appear");
                                }); 
                        };
                        
                        _widget.getRandomTip = function getRandomTip(){
                                var nb = _allTips.getNbItems(),
                                    id = Math.floor(Math.random()*nb);
                                if (nb === 0) _widget.close();
                                else{
                                        _tip.reset(_allTips.get(id));
                                        // remove tip (can only be shwon once per session)
                                        _allTips.alter("splice", id, 1);
                                }            
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                _widget.getRandomTip();        
                        };
                        
                        _widget.close = function(event, node){
                                // hide window
                                document.getElementById("tip-popup").classList.remove("visible");
                                document.getElementById("cache").classList.remove("appear");
                        };
                        
                        _widget.doNotShow = function(event, node){
                                var settings;
                                node.setAttribute("readonly", "readonly");
                                if (node.checked === _user.get("settings").showTips){
                                        settings = _user.get("settings");
                                        settings.showTips = !node.checked;
                                        _user.set("settings", settings);
                                        _user.upload().then(function(){
                                                node.removeAttribute("readonly");        
                                        });
                                }
                        };
                        return _widget;
                };
        });
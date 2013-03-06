/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "service/confirm"], 
	function(Widget, Map, Store, Model, Event, Config, Confirm){
		return function PublicEditConstructor($action){
		//declaration
			var _widget = new Widget(),
			    _store = new Store(),  // the idea
			    _labels = Config.get("labels"),
			    _error = new Store({"error": ""});
		//setup
	               
                        _store.setTransport(Config.get("transport"));
                        
			_widget.plugins.addAll({
			        "editlabel" : new Model(_labels),
			        "editidea" : new Model(_store, {
                                        setVisibility : function(visibility){
                                             (visibility === "public") ? this.innerHTML = _labels.get("publiclbl") : this.innerHTML = _labels.get("privatelbl");     
                                        },
                                        hideVisibility : function(visibility){
                                             (visibility === "public") ? this.setAttribute("style", "display:none"):this.setAttribute("style", "display:inline-block");       
                                        },
                                        setVisibleIcon : function(visibility){
                                             (visibility === "public") ? this.setAttribute("style", "background:url('img/public/publicForList.png') no-repeat left center; background-size: 14px 12px;") : this.setAttribute("style", "background-image:url('img/public/privateForList.png');");         
                                        },
                                        setReplay : function(session){
                                                console.log("hello anyone there", session);
                                             (!session) ? this.setAttribute("style", "display:none"):this.setAttribute("style", "display:inline-block");      
                                        },
                                        setIdeafyStatus : function(replay){
                                             (replay) ? this.innerHTML = _labels.get("enabledreplaylbl") : this.innerHTML = _labels.get("disabledreplaylbl");         
                                        },
                                        setSessionReplay : function(replay){
                                             (replay) ? this.innerHTML = _labels.get("disablereplaylbl") : this.innerHTML = _labels.get("enablereplaylbl");         
                                        }
                                }),
			        "editevent" : new Event(_widget),
			        "errormsg" : new Model(_error,{
			                setError : function(error){
			                        switch (error){
			                                case "notitle":
			                                     this.innerHTML = _labels.get("titlefield")+ _labels.get("emptyfielderror");
			                                     break;
			                                case "nodesc":
			                                     this.innerHTML = _labels.get("descriptionfield")+ _labels.get("emptyfielderror");
			                                     break;
			                                case "nosol":
			                                     this.innerHTML = _labels.get("solutionfield")+ _labels.get("emptyfielderror");
			                                     break;
			                                default:
			                                     this.innerHTML = "";
			                        }
			                }
			        })
			});
			
			_widget.template = '<div class="idea-edit"><div class="header blue-dark"><span data-editlabel="bind:innerHTML, modifyidealbl">Modify your idea</span></div><form class="form"><p><input type="text" class="input" data-editidea="bind: value, title"></p><p><textarea class="description input" data-editidea="bind: value, description"></textarea></p><p><textarea class="solution input" data-editidea="bind: value, solution"></textarea></p><div class="options"><div class="current-visibility" data-editidea="bind:setVisibleIcon, visibility"><span class="label" data-editlabel="bind:innerHTML,ideavisiblelbl"></span><span data-editlabel="bind:innerHTML, privatelbl" data-editidea="bind:setVisibility, visibility"></span></div><div class="edit-visibility" data-editidea="bind:hideVisibility, visibility"><span class="label" data-editlabel="bind:innerHTML,setideavisiblelbl"></span><div class="visibility public" data-editlabel="bind:innerHTML, publiclbl" data-editevent="listen:touchstart, editVisibility"></div></div></div><div class="options invisible" data-editidea="bind:setReplay, sessionId"><div class="current-visibility replay"><span class="label" data-editlabel="bind:innerHTML,ideafyreplaylbl"></span><span data-editlabel="bind:innerHTML, disabledreplaylbl" data-editidea="bind:setIdeafyStatus, sessionReplay"></span></div><div class="edit-visibility replay"><span class="label" data-editlabel="bind:innerHTML, ideafysetreplaylbl"></span><div class="toggle-replay" data-editidea = "bind: setSessionReplay, sessionReplay" data-editevent="listen:touchstart, press; listen:touchend, enableReplay" data-editlabel="bind:innerHTML, enablereplaylbl"></div></div></div><p class="submit"><label class="publish pressed-btn" data-editevent="listen:touchend, upload">Publish</label><label class="cancel pressed-btn" data-editevent="listen:touchend, cancel">Cancel</label><label class="editerror" data-errormsg="bind:setError, error"></label></p></form></div>';
			
			_widget.place(Map.get("public-edit"));

                        _widget.reset = function reset(id){
                                _store.unsync();
                                _store.reset();
                                _store.sync(Config.get("db"), id);        
                        };
                        
                                                _widget.editVisibility = function(event, node){
                                // confirmation
                                var confirm = new Confirm(node, _labels.get("setpublicquestion"), function(decision){
                                        (decision) ? _store.set("visibility", "public") : _store.set("visibility", "private");
                                        confirm.close();
                                        });       
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.enableReplay = function(event, node){
                                setTimeout(function(){
                                        (_store.get("sessionReplay")) ? _store.set("sessionReplay", false) : _store.set("sessionReplay", true);
                                        node.classList.remove("pressed");
                                }, 300);
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    modDate = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                    
                                if (_store.get("title") === "") {
                                        _error.set("error", "notitle");
                                }
                                else if (_store.get("description") === ""){
                                        _error.set("error", "nodesc");        
                                }
                                else if (_store.get("solution") === ""){
                                        _error.set("error", "nosol");        
                                }
                                else{
                                        _store.set("modification_date", modDate);
                                        _store.upload().then(function(){
                                                // close window
                                                //_widget.place(document.createDocumentFragment());
                                                $action("close");
                                        });
                               }
                               nide.classList.remove("pressed");     
                        };
                        
                        _widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                $action("close");       
                        };
                        
		//return
			return _widget;
		};
	});
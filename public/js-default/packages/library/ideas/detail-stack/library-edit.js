/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "service/config", "service/confirm", "Promise", "Place.plugin", "attach/attachment", "attach/add"], 
	function(Widget, Map, Store, CouchDBDocument, Model, Event, Config, Confirm, Promise, Place, Attachment, AddAttachment){
		return function LibraryEditConstructor($action){
		//declaration
			var _widget = new Widget(),
			     _attachmentUI = new Attachment("idea"),
			     _addAttachmentUI = new AddAttachment(),
			    _store = new CouchDBDocument(),  // the idea
                            _languages = new Store(Config.get("userLanguages")),
                             user = Config.get("user"),
                             transport = Config.get("transport"),
                            _resetLang = function(){
                                _languages.loop(function(v,i){
                                        (_store.get("lang") && (v.name === _store.get("lang").substring(0,2))) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                            },
			    _labels = Config.get("labels"),
			    _error = new Store({"error": ""}),
			    _alist = new Store([]),
			    _addedAttachments = [],
			    _removedAttachments = [],
			    updateReplay; // flag, set to true if sessionReplay option is modified
		//setup
	               
                        _store.setTransport(transport);
                        
			_widget.plugins.addAll({
			        "editlabel": new Model(_labels),
			        "editidea" : new Model(_store, {
                                        displayLang : function(lang){
                                                var l;
                                                if (lang) {
                                                        l=lang.substring(0,2);
                                                        this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");
                                                }        
                                        },
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
			                     (!session || session.search("deleted") !== -1) ? this.setAttribute("style", "display:none"):this.setAttribute("style", "display:inline-block");      
			                },
			                setIdeafyStatus : function(replay){
			                     (replay) ? this.innerHTML = _labels.get("enabledreplaylbl") : this.innerHTML = _labels.get("disabledreplaylbl");         
			                },
			                setSessionReplay : function(replay){
			                     (replay) ? this.innerHTML = _labels.get("disablereplaylbl") : this.innerHTML = _labels.get("enablereplaylbl");         
			                },
                                        showAttachments : function(att){
                                                (att && att.length) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
			        }),
                                "alist": new Model(_alist,{
                                        setCat : function(cat){
                                                var cats = Config.get("cat"), colors = Config.get("catColors"), idx = cats.indexOf(cat);
                                                
                                                if (idx > -1) {
                                                        this.innerHTML = _labels.get(cat);
                                                        this.setAttribute("style", "color:" + colors[idx]);
                                                }
                                                else{
                                                        this.innerHTML = cat;
                                                        this.setAttribute("style", "color: #404040");
                                                }
                                        },
                                        setType : function(type){
                                                switch(type){
                                                        default:
                                                                this.setAttribute("style", "background-image: url('../img/r2/download.png')");
                                                                break;
                                                }
                                        },
                                        setRef : function(name){
                                                var url =  Config.get("location")+"/downloads",
                                                      idx = this.getAttribute("data-alist_id");
                                                if (name){
                                                        url += "?atype=idea&docid=" +  _store.get("_id")+ "&file=" + name;
                                                        this.setAttribute("href", url);
                                                }       
                                        },
                                        setRating : function (docId){
                                                var cdb, node=this;
                                                if (docId){
                                                        cdb = new CouchDBDocument();
                                                        cdb.setTransport(transport);
                                                        cdb.sync(Config.get("db"), docId)
                                                        .then(function(){
                                                                var v = cdb.get("votes") || [],
                                                                      l = v.length;
                                                                if (l===0){
                                                                        node.innerHTML = "";
                                                                }
                                                                else{
                                                                        node.innerHTML = Math.round(v.reduce(function(x,y){return x+y;})/l*100)/100;
                                                                }
                                                        });
                                                }
                                        }
                                }),
                                "select" : new Model (_languages, {
                                        setBg : function(name){
                                                if (name){
                                                        this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                                }
                                        },
                                        setSelected : function(selected){
                                                (selected) ? this.classList.add("selected") : this.classList.remove("selected");        
                                        } 
                                }),
                                "place" : new Place({"AttachmentUI" : _attachmentUI, "AddAttachmentUI" : _addAttachmentUI}),
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
			
			_widget.template='<div class="idea-edit"><div class="header blue-dark"><span data-editlabel="bind:innerHTML, modifyidealbl"></span></div><form class="form"><div class="idealang"><div class="currentlang" data-editidea="bind: displayLang, lang" data-editevent="listen: mouseup, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-editevent="listen: mousedown, selectFlag; listen: mouseup, setLang"></li></ul></div><p><legend class="idealegend" data-editlabel="bind:innerHTML, title"></legend><input type="text" class="input" data-editidea="bind: value, title"></p><p><legend class="idealegend" data-editlabel="bind:innerHTML, principle"></legend><textarea class="description input" data-editidea="bind: value, description"></textarea></p><p><legend class="idealegend" data-editlabel="bind:innerHTML, solution"></legend><textarea class="solution input" data-editidea="bind: value, solution"></textarea></p><div class="options"><div class="current-visibility" data-editidea="bind:setVisibleIcon, visibility"><span class="label" data-editlabel="bind:innerHTML,ideavisiblelbl"></span><span data-editlabel="bind:innerHTML, privatelbl" data-editidea="bind:setVisibility, visibility"></span></div><div class="edit-visibility" data-editidea="bind:hideVisibility, visibility"><span class="label" data-editlabel="bind:innerHTML,setideavisiblelbl"></span><div class="visibility public" data-editlabel="bind:innerHTML, publiclbl" data-editevent="listen:mousedown, editVisibility"></div></div></div><div class="options invisible" data-editidea="bind:setReplay, sessionId"><div class="current-visibility replay"><span class="label" data-editlabel="bind:innerHTML,ideafyreplaylbl"></span><span data-editlabel="bind:innerHTML, disabledreplaylbl" data-editidea="bind:setIdeafyStatus, sessionReplay"></span></div><div class="edit-visibility replay"><span class="label" data-editlabel="bind:innerHTML, ideafysetreplaylbl"></span><div class="toggle-replay" data-editidea = "bind: setSessionReplay, sessionReplay" data-editevent="listen:mousedown, press; listen:mouseup, enableReplay" data-editlabel="bind:innerHTML, enablereplaylbl"></div></div></div><p class="submit"><label class="publish pressed-btn" data-editlabel="bind:innerHTML, publishlbl" data-editevent="listen: mousedown, press; listen:mouseup, upload"></label><label class="cancel pressed-btn" data-editlabel="bind:innerHTML, cancellbl" data-editevent="listen: mousedown, press;listen:mouseup, cancel"></label><label class="editerror" data-errormsg="bind:setError, error"></label></p></form><div class="attachments"><legend class="idealegend" data-editlabel="bind:innerHTML, attachments"></legend><div class="toggleattach" data-editevent="listen: mousedown, toggleAttachments"></div><ul class="a-list" data-alist="foreach"><li><a class="a-type" data-alist="bind:setType, type; bind: setRef, fileName" data-editevent="listen: mousedown, press; listen: mouseup, release"></a><label class="a-name" data-alist="bind:innerHTML, name">Name</label><label class="a-cat" data-alist="bind:setCat, category"></label><label class="a-delete" data-editevent="listen:mousedown, press; listen:mouseup, removeAttachment"></label><label class="a-zoom" data-editevent="listen: mousedown, press; listen: mouseup, release; listen:mouseup, zoom"></label></li></ul><legend class="a-legend" data-editlabel="bind:innerHTML, alegend"></legend><div data-place="place: AddAttachmentUI"></div></div><div data-place="place: AttachmentUI"></div></div>';
			
			_widget.place(Map.get("library-edit"));


                        _widget.reset = function reset(id){
                                
                                // reset store
                                _store.unsync();
                                _store.reset();
                                
                                // reset attachment edits
                                _addedAttachments = [];
                                _removedAttachments = [];
                                
                                _store.sync(Config.get("db"), id)
                                .then(function(){
                                        _resetLang();
                                        
                                        // set attachment list
                                        (_store.get("attachments")) ? _alist.reset(_store.get("attachments").concat()) : _alist.reset([]);
                                        
                                        // reset add attachment UI
                                        _addAttachmentUI.reset(id, "idea", _alist);
                                        _alist.watch("added", function(idx, val){
                                                _addedAttachments.push(val.docId);        
                                        });
                                });
                                updateReplay = false;        
                        };
                        
                        _widget.showLang = function(event, node){
                                _widget.dom.querySelector(".idealang ul").classList.remove("invisible");        
                        };
                        
                        _widget.selectFlag = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = parseInt(node.getAttribute("data-select_id"), 10);
                                _languages.loop(function(v,i){
                                        (id === i) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);
                                });               
                        };
                        
                        _widget.setLang = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = node.getAttribute("data-select_id");
                                _store.set("lang", _languages.get(id).name);
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");        
                        };
                        
                        _widget.editVisibility = function(event, node){
                                // confirmation
                                Confirm.reset(_labels.get("setpublicquestion"), function(decision){
                                        (decision) ? _store.set("visibility", "public") : _store.set("visibility", "private");
                                        Confirm.hide();
                                        });       
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.release = function(event, node){
                                node.classList.remove("pressed");        
                        };
                        
                        _widget.toggleAttachments = function(event, node){
                                var list = _widget.dom.querySelector(".a-list");
                                if (node.classList.contains("show")){
                                        list.classList.remove("invisible");
                                        node.classList.remove("show");
                                }
                                else{
                                        list.classList.add("invisible");
                                        node.classList.add("show");
                                }
                        };
                        
                        _widget.removeAttachment = function(event, node){
                                var idx = node.getAttribute("data-alist_id"),
                                      id = _alist.get(idx).docId;
                                 
                                // add attachment id to the list of attachments to be removed (will be done upon edit confirmation)
                                _removedAttachments.push(id);
                                _alist.alter("splice", idx, 1);
                                node.classList.remove("pressed");       
                        };
                        
                        /*
                         * Apply changes made to attachments
                         */
                        _widget.manageAttachments = function(){
                                var aA = _addedAttachments, rA = _removedAttachments;
                                if (rA.length){
                                        rA.forEach(function(attachment_id){
                                                var idx1 = -1, idx2 = -1;
                                                // check if attachment was just added
                                                for (i=0; i<aA.length; i++){
                                                        if (aA[i] === attachment_id){
                                                                idx1 = i;
                                                                break;
                                                        }                
                                                }
                                                if (idx1 > -1) aA.splice(idx1, 1);
                                                
                                                // remove attachment from idea
                                                _alist.loop(function(val,idx){
                                                        if (val.docId === attachment_id){
                                                                idx2 = idx;        
                                                        }        
                                                });
                                                if (idx2 > -1) _alist.alter("splice", idx2, 1);
                                                
                                                // remove attachment from database
                                                _addAttachmentUI.deleteAttachmentDoc(attachment_id);
                                        });                            
                                }
                                
                                if (aA.length || rA.length){
                                        _store.set("attachments", JSON.parse(_alist.toJSON()));
                                }    
                        };
                        
                        _widget.zoom = function(event, node){
                                var idx = node.getAttribute("data-alist_id");
                                _attachmentUI.reset(_alist.get(idx).docId);
                                document.querySelector(".cache").classList.add("appear");      
                        };
                        
                        _widget.enableReplay = function(event, node){
                                setTimeout(function(){
                                        (_store.get("sessionReplay")) ? _store.set("sessionReplay", false) : _store.set("sessionReplay", true);
                                        updateReplay = true;
                                        node.classList.remove("pressed");
                                }, 300);
                        };
                        
                        /*
                         * A function to update the session document (add or remove idea from replayIdeas)
                         * @Param boolean bool
                         * @Returns promise
                         */
                        _widget.updateSessionReplay = function updateSessionReplay(bool){
                                var promise = new Promise(), cdb = new CouchDBDocument();
                                cdb.setTransport(Config.get("transport"));
                                cdb.sync(Config.get("db"), _store.get("sessionId")).then(function(){
                                        var arr = cdb.get("replayIdeas") || [], i;
                                        if (bool){
                                                arr.push(_store.get("_id"));
                                        }
                                        else{
                                                for (i=arr.length-1; i>=0; i--){
                                                        if (arr[i] === _store.get("_id")) {arr.splice(i,1);}
                                                }
                                        }
                                        cdb.set("replayIdeas", arr);
                                        cdb.upload().then(function(){
                                                promise.fulfill();
                                                cdb.unsync();
                                        });
                                });
                                return promise;        
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
                                        _widget.manageAttachments();
                                        _store.set("modification_date", modDate);
                                        _store.upload().then(function(){
                                                if (updateReplay){
                                                        _widget.updateSessionReplay(_store.get("sessionReplay")).then(null, function(err){console.log(err);});
                                                }
                                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");
                                                $action("close");
                                                
                                        });
                               }
                               node.classList.remove("pressed");     
                        };
                        
                        _widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");
                                $action("close");       
                        };
                        
		//return
			return _widget;
		};
	});
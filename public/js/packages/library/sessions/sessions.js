/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "CouchDBStore", "Store", "service/utils", "service/avatarlist"],
        function(Widget, Map, Model, Event, Config, CouchDBStore, Store, Utils, AvatarList){
                
           return function MySessionsContructor(){
              
              // declaration     
              var _widget = new Widget(),
                  _actionWidget = new Widget(),
                  touchStart, touchPoint, // used to trigger action bar
                  _dom = Map.get("sessions"),
                  _sessions = new Store(),
                  _db = Config.get("db"),
                  _user = Config.get("user"),
                  _avatars = Config.get("avatars"),
                  _labels = Config.get("labels"),
                  _sortStatus = new Store({
                          "sbytitle": {selected: false, "descending": true},
                          "sbydate": {selected: true, "descending": true},
                          "sbyidea": {selected: false, "descending": true},
                          "sbyscore": {selected: false, "descending": true}
                          }),
                  _currentSort = "sbydate", // the current sorting type of the list
                  _sessionData = [],
                  _searchData = [],
                  _currentSearch = "", // the current search, if empty _sessionData is used
                  _sessionsCDB = new CouchDBStore();
                  
              
              // setup
              _sessionsCDB.setTransport(Config.get("transport"));
              
              _widget.plugins.addAll({
                        "label": new Model(_labels),
                        "sort": new Model(_sortStatus, {
                                setSelected : function(selected){
                                        (selected)?this.classList.add("selectsort"):this.classList.remove("selectsort");        
                                },
                                setOrder : function(descending){
                                        if (descending){
                                                this.classList.remove("sort-ascending");
                                                this.classList.add("sort-descending");
                                        }
                                        else {
                                                this.classList.remove("sort-descending");
                                                this.classList.add("sort-ascending");
                                        }       
                                }
                        }),
                        "sessions": new Model(_sessions, {
                                formatDate: function(date){
                                        if (date && date.length) this.innerHTML = Utils.formatDate(date);
                                },
                                formatIdeas: function(array){
                                        // check if at least one idea was generated during this session
                                        if (array && array.length === 1) {
                                                // the most common case (for quick sessions)
                                               this.innerHTML = array[0].title;
                                        }
                                        else if (array && array.length > 1){
                                                var arr = [];
                                                for (i=0; i<array.length; i++){
                                                        arr.push(array[i].title);
                                                }
                                                this.innerHTML = arr.join('<br/>');        
                                        }
                                        else{
                                                this.innerHTML = _labels.get("noideayet");
                                        }
                                },
                                setAvatars: function(array){
                                        var ui = new AvatarList(array),
                                            frag = document.createDocumentFragment(),
                                            node = this;
                                            ui.place(frag);
                                            (!node.hasChildNodes())?node.appendChild(frag):node.replaceChild(frag, node.firstChild);
                                },
                                setStatus : function(status){
                                        (status === "completed") ? this.innerHTML = _labels.get("completed") : this.innerHTML = _labels.get("inprogress");
                                },
                                setScore : function(score){
                                        if (score>=0){
                                                this.innerHTML = score;
                                        }
                                        else {
                                                this.innerHTML = "";
                                        }
                                },
                                setSuffix : function(score){
                                        if (score === undefined || score === "" || score === null){
                                                this.innerHTML = _labels.get("noscore");
                                        }
                                        else this.innerHTML = "ip";
                                }
                        }),
                  "sortevent": new Event(_widget),
                  "sessionevent": new Event(_widget)      
              });
              
              _widget.template = '<div id="sessions"><div id="session-list" class="list"><div class="header blue-light" data-label="bind: innerHTML, library-sessions"></div><div class="session-tools"><div class="session-sorting"><div id="sbytitle" class="sort-button" data-sort="bind: setSelected, sbytitle.selected" data-sortevent="listen: touchstart, sort"><span data-label="bind: innerHTML, sbytitle"></span><div class="sort-caret" data-sort="bind: setOrder, sbytitle.descending"></div></div><div id="sbydate" class="sort-button" data-sort="bind: setSelected, sbydate.selected" data-sortevent="listen: touchstart, sort"><span data-label="bind: innerHTML, sbydate"></span><div class="sort-caret" data-sort="bind: setOrder, sbydate.descending"></div></div><div id="sbyidea" class="sort-button" data-sort="bind: setSelected, sbyidea.selected" data-sortevent="listen: touchstart, sort"><span data-label="bind: innerHTML, sbyidea"></span><div class="sort-caret" data-sort="bind: setOrder, sbyidea.descending"></div></div><div id="sbyscore" class="sort-button" data-sort="bind: setSelected, sbyscore.selected" data-sortevent="listen: touchstart, sort"><span data-label="bind: innerHTML, sbyscore"></span><div class="sort-caret" data-sort="bind: setOrder, sbyscore.descending"></div></div></div><input class="search" type="text" data-label="bind:placeholder, searchsessions" data-sortevent="listen: keypress, search"><div id="sessionsearchresult"></div></div><div class="session-details"><ul data-sessions="foreach"><li class="session-item" data-sessionevent="listen:touchstart, setStart; listen: touchmove, displayActionBar"><table class="session-boxscore"><tr><td class="session-type"></td><td class="session-info"><p class="session-title" data-sessions="bind: innerHTML, title">Titre de la session</p><p class="session-date" data-sessions="bind: formatDate, date">jj/mm/aaaa</p></td><td class="session-idea" data-sessions="bind:formatIdeas, idea">Idea(s) generated from session</td><td class="avatarlist" data-sessions="bind: setAvatars, participants"></td><td class="session-status" data-sessions="bind:setStatus, status">completed</td><td class="session-score"><span class="points" data-sessions="bind:setScore, score"></span><span data-sessions="bind: setSuffix, score">ip</span></td></tr></table><div class="actionbar" data-sessionevent="listen: touchend, hideActionBar"><div class="replaysession" name="replay" data-sessionevent="listen: touchstart, press; listen:touchend, replay"></div><div class="deletesession" name="delete" data-sessionevent="listen: touchstart, press; listen:touchend, deleteSession"></div></div></li></ul></div></div></div>';
              
              _widget.sort = function sort(event, node){
                        var mode = node.getAttribute("id");
                        
                        if (_sortStatus.get(mode).selected){
                                _sortStatus.set(mode, {selected: true, descending: !(_sortStatus.get(mode).descending)});
                        }
                        else{
                                _sortStatus.set(_currentSort, {selected:false, descending:_sortStatus.get(_currentSort).descending});
                                _sortStatus.set(mode, {selected:true, descending:_sortStatus.get(mode).descending});
                                _currentSort = mode;
                        }
                        _widget.sortSessions(mode);      
              };
              
              _widget.sortSessions = function sortSessions(mode){
                       var _scope;
                       // scope of search (all items or search results)
                       (_currentSearch) ? _scope = _searchData : _scope = _sessionData;
                       
                       if (_scope.length){ 
                                // sorting functions
                                switch(mode){
                                        case "sbytitle":
                                                Utils.sortByProperty(_scope, "title", _sortStatus.get("sbytitle").descending);
                                                break;
                                        case "sbydate":
                                                Utils.sortByProperty(_scope, "date", _sortStatus.get("sbydate").descending);
                                                break;
                                        case "sbyidea":
                                                Utils.sortByProperty(_scope, "idea", _sortStatus.get("sbyidea").descending);
                                                break;
                                        case "sbyscore":
                                                Utils.sortByProperty(_scope, "score", _sortStatus.get("sbyscore").descending);
                                                break;
                                }
                        }
                        // display sorted list
                        _sessions.reset(_scope);        
              };
              
              _widget.acceptinput = function(event, node){
                node.removeAttribute("readonly");        
              };
              
              _widget.search = function search(event, node){     
                var _resDiv = document.getElementById("sessionsearchresult");
                
                _resDiv.innerHTML ="";
                
                if (event.keyCode === 13){
                        _currentSearch = node.value;
                        if (_currentSearch === ""){
                                // make sure list is sorted according to current sort status
                                 _widget.sortSessions(_currentSort);
                                _sessions.reset(_sessionData);
                        }
                        else{
                                _searchData = Utils.searchArray(_sessionData, _currentSearch);
                                _resDiv.innerHTML = _labels.get("foundlbl")+" "+_searchData.length+" "+_labels.get("matchingsessions");
                                _sessions.reset(_searchData);
                        }
                }        
              };
              
              _widget.setStart = function(event, node){
                        touchStart = [event.pageX, event.pageY];
                };
              
              _widget.displayActionBar = function(event, node){
                      var _id = node.getAttribute("data-sessions_id"),
                          _height = node.offsetHeight,
                          _sid = _sessions.get(_id);
                      
                      touchPoint = [event.pageX, event.pageY];
                      
                      if ((touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                              node.querySelector(".actionbar").setAttribute("style", "display: block;margin-top:-"+_height+"px;height: "+_height+"px;");
                      
                                // session cannot be deleted if initiated by another user or if has multiple users or if it is the current session in progress
                                if (_sid.participants.length>1 || _sid.participants[0] != _user.get("_id") || _sid.id === _user.get("sessionInProgress").id){
                                        node.querySelector(".deletesession").setAttribute("style", "display: none;");        
                                }
                                else node.querySelector(".deletesession").setAttribute("style", "display: inline-block;"); 
                      
                                // Automatically hide bar after 2s
                                setTimeout(function(){node.querySelector(".actionbar").setAttribute("style", "display: none;");}, 2000);
                        }
              };
              
              _widget.hideActionBar = function(event, node){
                node.setAttribute("style", "display: none;");        
              };
              
              _widget.press = function(event, node){
                       node.classList.add("pressed");        
              };
              
              _widget.replay = function(event, node){
                      var _id = node.getAttribute("data-sessions_id"),
                          _sid = _sessions.get(_id).id,
                         _mode = _sessions.get(_id).mode;
                      
                      // hide action bar and remove hightlight
                        node.parentNode.setAttribute("style", "display: none;");
                        node.classList.remove("pressed");
                      // notify replay-session event
                      Config.get("observer").notify("replay-session", _sid, _mode); 
              };
              
              _widget.deleteSession = function(event, node){
                        var _id = node.getAttribute("data-sessions_id"), _sid = _sessions.get(_id).id;
                        // hide action bar and remove hightlight
                        node.classList.remove("pressed");
                        node.parentNode.setAttribute("style", "display: none;");
                        
                        // remove session from CouchDB
                        var _cdb = new CouchDBStore();
                        _cdb.setTransport(Config.get("transport"));
                        _cdb.sync(_db, _sid).then(function(){
                                _cdb.remove();
                        });
                        
                        // last, remove attachments (whiteboards) if any from the server
                        Config.get("transport").request("cleanUpSession", _sid, function(res){
                                if (res.err) console.log(res.err);        
                        });
              };
              
              _widget.resetSessionData = function resetSessionData(){
                                _sessionData = [];
                                _sessionsCDB.loop(function(v,i){
                                        // only keep useful information to speed up sorting
                                        var _item= {
                                                id:v.id,
                                                title:v.value.title,
                                                date:v.value.date,
                                                idea:v.value.idea,
                                                participants:[],
                                                usernames:[],
                                                status:v.value.status,
                                                score:v.value.score,
                                                mode: v.value.mode
                                         };
                                         // merge initiator and participants
                                        _item.participants.push(v.value.initiator.id);
                                        _item.usernames.push(v.value.initiator.username);
                                        
                                        for (j=0; j<v.value.participants.length; j++){
                                                _item.participants.push(v.value.participants[j].id);
                                                _item.usernames.push(v.value.participants[j].username);        
                                        }
                                        // if there are multiple ideas in a session, sort them by title
                                        if (_item.idea && _item.idea.length>1){
                                                Utils.sortByProperty(_item.idea, "title", false);
                                        }
                                        _sessionData.push(_item);
                                });
                                _sessions.reset(_sessionData);
              };
              
              _widget.getMode = function getMode(sid){
                        var result;
                        _sessionsCDB.loop(function(v, i){
                                if (v.id === sid) {
                                        result = v.value.mode;
                                }         
                        });
                        
                        return result;
              };
              
              _widget.place(_dom);
              
              // init session data
              _sessionsCDB.sync(_db, "library", "_view/sessions", {key: Config.get("uid"), descending: true}).then(function(){
                                _widget.resetSessionData();
                                ["added", "deleted", "updated"].forEach(function(change){
                                        _sessionsCDB.watch(change, function(idx, value){
                                                _widget.resetSessionData();
                                                // apply current sorting methods
                                                _widget.sortSessions(_currentSort);        
                                        });   
                               });
              });
              
              
              // return
              return _widget;
                   
           };    
                
        });
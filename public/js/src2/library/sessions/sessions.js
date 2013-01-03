define("Ideafy/Library/Sessions", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "CouchDBStore", "Store", "Ideafy/Utils", "Ideafy/AvatarList"],
        function(Widget, Map, Model, Event, Config, CouchDBStore, Store, Utils, AvatarList){
                
           return function MySessionsContructor(){
              
              // declaration     
              var _widget = new Widget(),
                  _actionWidget = new Widget(),
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
                                        var frag = document.createDocumentFragment(),
                                            _ui = new AvatarList(array);
                                            console.log(this.getAttribute("data-sessions_id"), array, _sessions.get(this.getAttribute("data-sessions_id")).participants);
                                            _ui.place(frag);
                                            (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
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
                  "sortevent": new Event(this),
                  "sessionevent": new Event(this)      
              });
              
              this.sort = function(event, node){
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
              
              this.acceptinput = function(event, node){
                node.removeAttribute("readonly");        
              };
              
              this.search = function(event, node){     
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
              
              this.displayActionBar = function(event, node){
                      var _id = node.getAttribute("data-sessions_id"),
                          _height = node.offsetHeight,
                          _sid = _sessions.get(_id);
                      
                      node.querySelector(".actionbar").setAttribute("style", "display: block;margin-top:-"+_height+"px;height: "+_height+"px;");
                      
                      // session cannot be deleted if initiated by another user or if has multiple users or if it is the current session in progress
                      if (_sid.participants.length>1 || _sid.participants[0] != _user.get("_id") || _sid.id === _user.get("sessionInProgress").id){
                        node.querySelector(".deletesession").setAttribute("style", "display: none;");        
                      }
                      else node.querySelector(".deletesession").setAttribute("style", "display: inline-block;"); 
                      
                      // Automatically hide bar after 3s
                      setTimeout(function(){node.querySelector(".actionbar").setAttribute("style", "display: none;");}, 2000);
              };
              
              this.hideActionBar = function(event, node){
                node.setAttribute("style", "display: none;");        
              };
              
              this.press = function(event, node){
                       node.classList.add("pressed");        
              };
              
              this.replay = function(event, node){
                      var _id = node.getAttribute("data-sessions_id"),
                          _sid = _sessions.get(_id).id,
                         _mode = _sessions.get(_id).mode;
                      
                      // hide action bar and remove hightlight
                        _dom.querySelector(".actionbar[data-sessions_id='"+_id+"']").setAttribute("style", "display: none;");
                        node.classList.remove("pressed");
                      // notify replay-session event
                      Config.get("observer").notify("replay-session", _sid, _mode); 
              };
              
              this.deleteSession = function(event, node){
                        var _id = node.getAttribute("data-sessions_id"), _sid = _sessions.get(_id).id;
                        // hide action bar and remove hightlight
                        _dom.querySelector(".actionbar[data-sessions_id='"+_id+"']").setAttribute("style", "display: none;");
                        node.classList.remove("pressed");
                        
                        /*
                         * Use store.watch deleted aand resetting the store instead
                         
                        // remove session from display
                        _sid = _sessions.get(_id).id;
                        
                        // start with _sessionData
                        for (i=_sessionData.length-1; i>=0; i--){
                                if (_sessionData[i].id === _sid) {
                                        _sessionData.splice(i,1);
                                        break;
                                }
                        }
                        // same with searchData if applicable
                        if (_currentSearch){
                                for (i=_searchData.length-1; i>=0; i--){
                                        if (_searchData[i].id === _sid) {
                                                _searchData.splice(i,1);
                                                break;
                                        }
                                }        
                        }
                        
                        // apply current sorting method
                        _widget.sortSessions(_currentSort);
                        */
                        
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
                                                console.log(_item.participants);        
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
              
              _widget.alive(_dom);
              
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
              
              
              SSLIST = _sessions;
              // return
              return _widget;
                   
           };    
                
        });
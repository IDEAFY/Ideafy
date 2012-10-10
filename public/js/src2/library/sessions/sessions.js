define("Ideafy/Library/Sessions", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "CouchDBStore", "Store", "Ideafy/Utils", "Ideafy/AvatarList"],
        function(Widget, Map, Model, Event, Config, CouchDBStore, Store, Utils, AvatarList){
                
           return function MySessionsContructor(){
              
              // declaration     
              var _widget = new Widget(),
                  _sessions = new Store(),
                  _user = Config.get("user"),
                  _avatars = Config.get("avatars"),
                  _labels = Config.get("labels"),
                  _sortStatus = new Store({
                          "sbytitle": {selected: false, "descending": true},
                          "sbydate": {selected: true, "descending": true},
                          "sbyidea": {selected: false, "descending": true},
                          "sbyscore": {selected: false, "descending": true}
                          }),
                  _currentSort = "sbydate",
                  _sessionData = [],
                  _searchData = [],
                  _currentSearch = "",
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
                                        if (date) this.innerHTML = Utils.formatDate(date);
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
                                        var idx = this.getAttribute("data-sessions_id"),
                                            frag = document.createDocumentFragment();
                                            _ui = new AvatarList(_sessions.get(idx).participants, _sessions.get(idx).avatars);
                                            _ui.place(frag);
                                            (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                },
                                setStatus : function(status){
                                        (status === "completed") ? this.innerHTML = _labels.get("completed") : this.innerHTML = _labels.get("inprogress");
                                },
                                setScore : function(score){
                                        if (score >= 0){
                                                this.innerHTML = score;
                                        }
                                },
                                setSuffix : function(score){
                                        if (score === undefined || score === ""){
                                                this.innerHTML = _labels.get("noscore");
                                        }
                                }
                        }),
                  "sortevent": new Event(this)       
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
                        this.sortSessions(mode);      
              };
              
              this.sortSessions = function sortSessions(mode){
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
              
              this.search = function(event, node){     
                var _resDiv = document.getElementById("sessionsearchresult");
                
                _resDiv.innerHTML ="";
                
                if (event.keyCode === 13){
                        _currentSearch = node.value;
                        if (_currentSearch === ""){
                                // make sure list is sorted according to current sort status
                                 this.sortSessions(_currentSort);
                                _sessions.reset(_sessionData);
                        }
                        else{
                                _searchData = Utils.searchArray(_sessionData, _currentSearch);
                                _resDiv.innerHTML = _labels.get("foundlbl")+" "+_searchData.length+" "+_labels.get("matchingsessions");
                                _sessions.reset(_searchData);
                        }
                }        
              };
              
              _widget.alive(Map.get("sessions"));
              
              // init session data
              _sessionsCDB.sync("ideafy", "library", "_view/sessions", {key: Config.get("uid"), descending: true}).then(function(){
                                _sessionsCDB.loop(function(v,i){
                                        // only keep useful information to speed up sorting
                                        var _item= {
                                                id:v.id,
                                                title:v.value.title,
                                                date:v.value.date,
                                                idea:v.value.idea,
                                                participants:[],
                                                usernames:[],
                                                avatars:[],
                                                status:v.value.status,
                                                score:v.value.score
                                         };
                                         // merge initiator and participants
                                        _item.participants.push(v.value.initiator.id);
                                        _item.usernames.push(v.value.initiator.username);
                                        _item.avatars.push(v.value.initiator.picture_file);
                                        
                                        for (i=0; i<v.value.participants.length; i++){
                                                _item.participants.push(v.value.participants[i].id);
                                                _item.usernames.push(v.value.participants[i].username);
                                                _item.avatars.push(v.value.participants[i].picture_file);        
                                        }
                                        // if there are multiple ideas in a session, sort them by title
                                        if (_item.idea && _item.idea.length>1){
                                                Utils.sortByProperty(_item.idea, "title", false);
                                        }
                                        _sessionData.push(_item);
                                });
                                _sessions.reset(_sessionData);
                                DATA = _sessionData;
              });
              
              // return
              return _widget;
                   
           };    
                
        });
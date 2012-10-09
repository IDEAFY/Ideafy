define("Ideafy/Library/Sessions", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config", "CouchDBStore", "Store", "Ideafy/Utils"],
        function(Widget, Map, Model, Config, CouchDBStore, Store, Utils){
                
           return function MySessionsContructor(){
              
              // declaration     
              var _widget = new Widget(),
                  _sessions = new Store(),
                  _labels = Config.get("labels"),
                  _sessionData = [],
                  _sessionsCDB = new CouchDBStore();
                  
              
              // setup
              _sessionsCDB.setTransport(Config.get("transport"));
              
              _widget.plugins.addAll({
                        "label": new Model(_labels),
                        "sessions": new Model(_sessions, {
                                formatDate: function(date){
                                        this.innerHTML = Utils.formatDate(date);
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
                                                this.innerHTML = arr.join("\n");        
                                        }
                                        else{
                                                this.innerHTML = _labels.get("noideayet");
                                        }
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
                        })       
              });
              
              _widget.alive(Map.get("sessions"));
              
              // init session data
              _sessionsCDB.sync("ideafy", "library", "_view/sessions", {key: Config.get("uid")}).then(function(){
                                _sessionsCDB.loop(function(v,i){
                                        _sessionData.push(v.value);
                                });
                                _sessions.reset(_sessionData);
                                console.log(_sessionData[0]);
              });
              
              // return
              return _widget;
                   
           } ;    
                
        });
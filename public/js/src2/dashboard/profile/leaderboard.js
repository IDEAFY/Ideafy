define("Ideafy/Dashboard/Leaderboard", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Ideafy/Utils", "Ideafy/Avatar"],
        function(Widget, Config, Model, Event, CouchDBStore, Utils, Avatar){
                
                return new function LeaderboardConstructor(){
                        
                        var leaderboard = new Widget(),
                            leaders = new CouchDBStore([]);
                        
                        leaderboard.template = '<div><ul data-leaders="foreach"><li class="leader"><div data-leaders="bind:setAvatar, value.userid"></div><div class="username" data-leaders="bind:innerHTML, value.username">Username</div><div class="distinction" data-leaders="bind:setDistinction, value.ip"></div><div class="grade" data-leaders="bind:setGrade, value.ip"></div><div class="score" data-leaders="bind: setScore, value.ip"></div></li></ul></div>';
                        
                        leaderboard.plugins.addAll({
                                "leaders": new Model(leaders,{
                                        setAvatar : function(userid){
                                                var _ui, _frag;
                                                _frag = document.createDocumentFragment();
                                                _ui = new Avatar([userid]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        },
                                        setGrade : function(ip){
                                                var node = this;
                                                Utils.getGrade(ip, function(result){
                                                        node.setAttribute("style", "background: url('../img/profile/"+result.grade.badge+"') no-repeat center center; background-size: 40px 40px;");
                                                });        
                                        },
                                        setDistinction : function(ip){
                                                var node = this;
                                                Utils.getGrade(ip, function(result){
                                                        console.log(result);
                                                        if (result.distinction) node.setAttribute("style", "background: url('../img/profile/"+result.distinction.badge+"') no-repeat center center; background-size: 40px 40px;");
                                                })
                                        },
                                        setScore : function(ip){
                                                this.innerHTML = ip + " ip";
                                        }
                                }),
                                "leaderevent": new Event(leaderboard)
                        });
                        
                        leaderboard.init = function init($dom){
                                leaders.setTransport(Config.get("transport"));
                                leaders.sync(Config.get("db"), "users", "_view/leaderboard", {limit:100, descending: true}).then(function(){
                                        console.log(leaders.toJSON());
                                        leaderboard.place($dom);
                                })
                        };
                        
                        
                        
                        return leaderboard;
                        
                };
        });

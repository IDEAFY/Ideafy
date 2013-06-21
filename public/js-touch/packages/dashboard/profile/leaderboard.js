/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "CouchDBView", "service/utils", "service/avatar"],
        function(Widget, Config, Model, Event, CouchDBView, Utils, Avatar){
                
                return function LeaderboardConstructor(){
                        
                        var leaderboard = new Widget(),
                            leaders = new CouchDBView([]);
                        
                        leaderboard.template = '<div><ul data-leaders="foreach"><li class="leader" data-leaders="bind:setSpotLight, value.userid"><div data-leaders="bind:setAvatar, value.userid"></div><div class="username" data-leaders="bind:innerHTML, value.username"></div><div class="distinction" data-leaders="bind:setDistinction, value.ip"></div><div class="grade" data-leaders="bind:setGrade, value.ip"></div><div class="score" data-leaders="bind: setScore, value.ip"></div></li></ul></div>';
                        
                        leaderboard.plugins.addAll({
                                "leaders": new Model(leaders,{
                                        setSpotLight : function(userid){
                                                if (userid === Config.get("user").get("_id")){
                                                        this.classList.add("userleader");
                                                        this.scrollIntoView(false);
                                                }
                                                else{
                                                        this.classList.remove("userleader");
                                                }        
                                        },
                                        setAvatar : function(userid){
                                                var _ui, _frag;
                                                if (userid){
                                                        _frag = document.createDocumentFragment();
                                                        _ui = new Avatar([userid]);
                                                        _ui.place(_frag);
                                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
                                        },
                                        setGrade : function(ip){
                                                var node = this;
                                                Utils.getGrade(ip, function(result){
                                                        node.setAttribute("style", "background: url('img/profile/"+result.grade.badge+"') no-repeat center center; background-size: 40px 40px;");
                                                });        
                                        },
                                        setDistinction : function(ip){
                                                var node = this;
                                                Utils.getGrade(ip, function(result){
                                                        if (result.distinction) node.setAttribute("style", "background: url('img/profile/"+result.distinction.badge+"') no-repeat center center; background-size: 40px 40px;");
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
                                        leaderboard.place($dom);
                                });
                        };
                        
                         Config.get("observer").watch("reconnect", function(){
                                leaders.unsync();
                                leaders.reset([]);
                                leaders.sync(Config.get("db"), "users", "_view/leaderboard", {limit:100, descending: true});
                        });
                        
                        return leaderboard;
                        
                };
        });

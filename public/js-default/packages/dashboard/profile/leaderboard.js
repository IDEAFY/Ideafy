/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "CouchDBView", "service/utils", "service/avatar", "lib/spin.min"],
        function(Widget, Config, Model, Event, CouchDBView, Utils, Avatar, Spinner){
                
                return function LeaderboardConstructor(){
                        
                        var leaderboard = new Widget(),
                              leaders = new CouchDBView([]),
                              spinner = new Spinner({color:"#9ac9cd", lines:10, length: 12, width: 6, radius:10, top: 328}).spin();
                        
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
                                                });
                                        },
                                        setScore : function(ip){
                                                this.innerHTML = ip + " ip";
                                        }
                                }),
                                "leaderevent": new Event(leaderboard)
                        });
                        
                        leaderboard.init = function init($dom){
                                spinner.spin($dom);
                                leaders.setTransport(Config.get("transport"));
                                leaders.sync(Config.get("db"), "users", "_view/leaderboard", {limit:100, descending: true}).then(function(){
                                        leaderboard.place($dom);
                                        spinner.stop();
                                        leaders.unsync();
                                });
                        };
                        
                        leaderboard.refresh = function(){
                                leaders.reset([]);
                                spinner.spin(leaderboard.dom);
                                leaders.sync(Config.get("db"), "users", "_view/leaderboard", {limit:100, descending: true}).then(function(){
                                        spinner.stop();
                                        leaders.unsync();
                                });            
                        };
                        
                         Config.get("observer").watch("reconnect", function(){
                                leaderboard.refresh();
                        });
                        
                        return leaderboard;
                };
        });

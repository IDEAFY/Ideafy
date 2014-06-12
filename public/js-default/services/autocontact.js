/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                function AutoContactConstructor($dom, $outputNode, $update){
                
                        var _widget = this,
                            _user = Config.get("user"),
                            _search = false,
                            _contactList = new Store([]);
                        
                        _widget.plugins.addAll({
                                "auto" : new Model(_contactList,{
                                        setSelected : function(selected){
                                                (selected)?this.classList.add("selected"): this.classList.remove("selected");
                                        },
                                        setType : function(type){
                                                (type==="group") ? this.classList.add("group") : this.classList.remove("group");
                                        }
                                }),
                                "select" : new Event(_widget)
                        });
                        
                        _widget.template = '<div class = "autocontact"><div class="autoclose" data-select="listen:mousedown,close"></div><ul data-auto="foreach"><li data-auto="bind:innerHTML, username; bind:setType, type; bind:setSelected, selected" data-select="listen:mousedown, select"></li></ul></div>';
                        
                        _widget.init = function init(){
                                var arr = _user.get("connections").concat(), usernames = [], currentList = [], types = {};
                                // reset _contactList
                                _contactList.reset([]);
                                
                                // get all contacts
                                for (i=0, l=arr.length; i<l;i++){
                                        usernames.push(arr[i].username);
                                        types[arr[i].username] = arr[i].type;      
                                }
                                usernames.sort().forEach(function(value){
                                        _contactList.alter("push", {username: value, type: types[value], selected: false});
                                });
                                
                                // get current list
                                if ($outputNode.value){
                                        currentList = $outputNode.value.split(/,|;/);
                                        for (i=0, l=currentList.length;i<l;i++){currentList[i]=currentList[i].trim();}
                                }
                                _contactList.loop(function(v,i){
                                        (currentList.indexOf(v.username)>-1) ? _contactList.update(i, "selected", true) : _contactList.update(i, "selected", false);        
                                });
                        };
                        
                        _widget.updateList = function updateList(){
                                // get the last part of the string
                                var arr, pattern, usernames = [], types = {};
                                
                                if ($outputNode.value) {
                                        _search = true;
                                        arr = $outputNode.value.split(/,|;/);
                                        pattern = arr[arr.length-1].trim().toLowerCase();
                                
                                        _contactList.reset([]);
                                        //lookup user contacts for matching entries starting with usernames, then add last names
                                        _user.get("connections").forEach(function(item){
                                                if (item.username.toLowerCase().search(pattern) === 0){
                                                        _contactList.alter("push", {username: item.username, type:item.type});
                                                }                
                                        });
                                        // update selection based on current list
                                        if ($outputNode.value){
                                                currentList = $outputNode.value.split(/,|;/);
                                                for (i=0, l=currentList.length;i<l;i++){currentList[i]=currentList[i].trim();}
                                        }
                                        _contactList.loop(function(v,i){
                                                (currentList.indexOf(v.username)>-1) ? _contactList.update(i, "selected", true) : _contactList.update(i, "selected", false);        
                                        });
                                }
                                
                        };
                        
                        _widget.close = function(event,node){
                                event.stopPropagation();
                                $dom.classList.add("invisible");        
                        };
                        
                        _widget.select = function(event,node){
                                var id = node.getAttribute("data-auto_id"),
                                    selected = _contactList.get(id).selected;
                                _contactList.update(id, "selected", !selected);
                                (selected)?_widget.remove(_contactList.get(id)) : _widget.add(_contactList.get(id));       
                        };
                        
                        _widget.add = function add(contact){
                                var group;
                                if (contact.type === "user"){
                                        if (!_search){
                                                ($outputNode.value) ? $outputNode.value+=", "+contact.username : $outputNode.value = contact.username;
                                        }
                                        else {
                                                // replace last character chain
                                                var arr = $outputNode.value.split(/,|;/), res = "";
                                                arr.forEach(function(value){value = value.trim();});
                                                arr.pop();
                                                for (i=0, l=arr.length;i<l;i++){res+=arr[i]+", ";}
                                                res+=contact.username;
                                                $outputNode.value = res;
                                                _search = false;
                                        }              
                                }
                                else{
                                        // retrieve group details form user contacts
                                        _user.get("connections").forEach(function(value){
                                                if (value.username === contact.username){
                                                         group = value.contacts;
                                                }        
                                        });
                                        // add each member of the group not already present
                                        group.forEach(function(value){
                                                if ($outputNode.value.search(value.username) < 0){
                                                        _widget.add(value);
                                                        _contactList.loop(function(v,i){
                                                                if (v.username === value.username) _contactList.update(i, "selected", true);      
                                                        });
                                                }     
                                        });
                                        
                                }
                                $update($outputNode.value);        
                        };
                        
                        _widget.remove = function remove(contact){
                                var currentList, res="";
                                if (contact.type === "user"){
                                        currentList = $outputNode.value.split(/,|;/);
                                        for (i=0, l=currentList.length;i<l;i++){currentList[i]=currentList[i].trim();}
                                        currentList.splice(currentList.indexOf(contact.username), 1);
                                        currentList.forEach(function(value){
                                                res += value +", ";        
                                        });
                                        $outputNode.value = res.substr(0, res.length-2);
                                        $update(res.substr(0, res.length-2));
                                        
                                        // check if removed user is part of a group that was selected
                                        _contactList.loop(function(v,i){
                                                if (v.type === "group" && v.selected){
                                                     // retrieve group contacts from user connections
                                                     _user.get("connections").forEach(function(value){
                                                        if (value.username === v.username){
                                                                if (JSON.stringify(value).search(contact.username)>-1){
                                                                        _contactList.update(i, "selected", false);
                                                                }
                                                        }        
                                                     });  
                                                }            
                                        });       
                                }
                                else{
                                        // retrieve group fonmr user connections
                                        _user.get("connections").forEach(function(value){
                                                if (value.username === contact.username){
                                                        value.contacts.forEach(function(user){
                                                                // change the selected parameter in contactList
                                                                _contactList.loop(function(v,i){
                                                                        if (v.username === user.username){
                                                                                _contactList.update(i, "selected", false);
                                                                        }
                                                                });
                                                                _widget.remove(user);
                                                        });
                                                }        
                                        });        
                                }
                        };
                        
                        // init
                        _widget.init();
                        _widget.render();
                        _widget.place($dom);
                        
                }
                        
                return function AutoContactFactory($dom, $outputNode, $update){
                        AutoContactConstructor.prototype = new Widget();
                        return new AutoContactConstructor($dom, $outputNode, $update);
                };
        });
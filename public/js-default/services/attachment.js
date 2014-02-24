/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "Place.plugin", "service/utils", "service/confirm", "Promise"],
        function(Widget, Config, Store, CouchDBDocument, Model, Event, WriteTwocent, TwocentList, Place, Utils, Confirm, Promise){
                
                function AttachmentConstructor($type){
                       
                        // declaration
                        var ui = this,
                             _attachmentTwocentListUI = new TwocentList("attach"),
                             _twocentWriteUI = new WriteTwocent("attach"),
                            cdb = new CouchDBDocument(),
                            cdbEdit = new Store(),
                            labels = Config.get("labels"),
                            transport = Config.get("transport"),
                            user = Config.get("user"),
                            _cat = Config.get("cat"),
                            vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                            _voted = false,
                            ConfirmUI;
                        
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "attach" : new Model(cdb,{
                                        setCat : function(cat){
                                                var colors = Config.get("catColors"), idx = _cat.indexOf(cat);
                                                if (idx > -1) {
                                                        this.innerHTML = labels.get(cat);
                                                        this.setAttribute("style", "color:" + colors[idx]);
                                                }
                                                else{
                                                        this.innerHTML = cat;
                                                        this.setAttribute("sytle", "color: #404040");
                                                }
                                        },
                                        displayTwocentList : function(twocents){
                                                (twocents && twocents.length) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        setDate : function(id){
                                                var stamp = parseInt(id.replace("A:", ""), 10),
                                                      date = new Date(stamp);
                                                this.innerHTML = date.toLocaleDateString();
                                        },
                                        showVoting : function(id){
                                                var arr = user.get("rated_a") || [], authors = cdb.get("authors");
                                                if (authors.indexOf(user.get("_id")) > -1){
                                                        this.classList.add("invisible");
                                                }
                                                else{
                                                        (arr.indexOf(id) > -1) ? this.classList.add("invisible") : this.classList.remove("invisible");
                                                }
                                        },
                                        showRating : function(votes){
                                                var votingEl = ui.dom.querySelector(".a-vote");
                                                this.classList.add("invisible");
                                                if (votes && votes.length && votingEl.classList.contains("invisible")){
                                                        this.classList.remove("invisible");
                                                }
                                        },
                                        displayRating : function(votes){
                                                if (votes && votes.length){
                                                        this.innerHTML =   Math.round(votes.reduce(function(x,y){return (x+y);})/votes.length*100)/100;      
                                                }        
                                        },
                                        displayNbVotes : function(votes){
                                                if (!votes) this.innerHTML="";
                                                else if (votes.length === 0){
                                                        this.innerHTML = "("+labels.get("novotesyet")+")";
                                                }
                                                else if (votes.length === 1){
                                                        this.innerHTML = "("+ labels.get("onevote")+")";
                                                }
                                                else{
                                                        this.innerHTML = "("+votes.length + " "+ labels.get("votes")+")";
                                                }
                                        },
                                        setRef : function(name){
                                                var url =  Config.get("location")+"/downloads", type;
                                                if (cdb.get("docId").search("I:") > -1) type = "idea";
                                                if (name){
                                                        url += "?atype=" + type + "&docid=" +  cdb.get("docId")+ "&file=" + name;
                                                        this.setAttribute("href", url);
                                                }     
                                        },
                                        showWriteTwocent : function(twocents){
                                                (twocents && twocents,length) ? this .classList.add("invisible") : this.classList.remove("invisible");
                                        },
                                        displayEdit : function(arr){
                                                (arr.indexOf(user.get("_id")) > -1) ? this.setAttribute("style", "display:inline-block;") : this.setAttribute("style", "display:none;");
                                        },
                                        displayDelete : function(twocents){
                                                if (twocents && twocents.length){
                                                        this.setAttribute("style", "display:none;");
                                                }
                                                else if (cdb.get("authors").indexOf(user.get("_id")) < 0){
                                                        this.setAttribute("style", "display:none;");        
                                                }
                                                else{
                                                        this.setAttribute("style", "display:inline-block;");
                                                }
                                        }
                                }),
                                "edit": new Model(cdbEdit,{
                                        setSelectCat : function(cat){
                                                var custom = user.get("categories") || [], arr, i, l, key, idx = null, node = this,
                                                      res = "<option selected disabled style='display:none;'>"+labels.get("choosecat")+"</option>";
                                                      
                                                /* reset colors */
                                               [1,2,3,4,5,6].forEach(function(val){
                                                        node.classList.remove("acolor"+val);
                                                        node.classList.add("acolor");
                                                });      
                                                      
                                                for (i=0, l=_cat.length; i<l;i++){
                                                        key = _cat[i];
                                                        res+="<option>"+labels.get(key)+"</option>";
                                                        if (cat === key) {
                                                                idx = i+1;
                                                                node.classList.add("acolor"+idx);
                                                        }
                                                }
                                                if (custom.length){
                                                        for (i=0, l=custom.length; i<l;i++){
                                                                res+="<option>"+custom[i]+"</option>";
                                                                if (cat === custom[i]) idx = _cat.length+i+1;
                                                        }
                                                }
                                                res+="<option>"+ labels.get("other")+"</option>";
                                                this.innerHTML = res;
                                                this.selectedIndex = idx || 0;     
                                        }        
                                }),
                                "vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background-image: url('img/public/activeIdeaVote.png');",
                                                    styleInactive = "background-image: url('img/public/rateForList.png');";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
                                "place": new Place({"LibraryTwocentUI" : _attachmentTwocentListUI}),
                                "attachevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class = "attachment-screen invisible"><div class="close-popup" data-attachevent = "listen:mousedown, close"></div><div class="attach-header" data-attach="bind:innerHTML, name"></div><div class="attach-details"><div class="attach-body"><div class="a-type" data-attach="bind:setType, type"><input type="file" class="a-input" data-attachevent="listen:mouseup, check;listen:change, uploadFile"></div><div class="a-left"><div class="a-name" data-attach="bind:innerHTML, name"></div><div class="a-contrib"><span class="a-span" data-labels="bind: innerHTML, contrib"></span><span class="a-author" data-attach="bind: innerHTML, authornames"></span></div><div class="a-date" data-attach="bind:setDate, _id"></div></div><div class="a-cat"><span data-attach="bind:setCat, category"></span><select class="acolor invisible" data-edit="bind:setSelectCat, category" data-attachevent="listen: change, selectCat"></select><input maxlength=18 type="text" placeholder="Enter category" class="input custom-cat invisible" data-attach="bind:show, custom" data-attachevent="listen:input, setCat"></div><div class="a-rating invisible" data-attach="bind:showRating, votes"><a class="item-acorn"></a><span data-attach="bind:displayRating, votes"></span><span class="votes" data-attach="bind:displayNbVotes, votes"></span></div><div class="a-vote" data-attach="bind:showVoting, _id"><legend data-labels="bind:innerHTML, rateit"></legend><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-attachevent="listen: mousedown, previewVote; listen: mouseup, castVote"></li></ul></div></div><ul class="actionbtn"><li><a class="attach-download" data-attach="bind: setRef, fileName" data-attachevent="listen:mousedown, press; listen:mouseup, download"></a></li><li><div class="a-2cent" data-attachevent="listen:mousedown, press; listen:mouseup, displayWriteTwocent"></div></li><li data-attach="bind:displayEdit, authors"><div class="a-edit" data-attachevent="listen:mousedown, press; listen:mouseup, edit"></div></li><li data-attach="bind:displayDelete, twocents"><div class="a-delete" data-attachevent="listen:mousedown, press; listen:mouseup, confirmDelete"></div></li><li class="a-publish invisible"><div class="sendmail" data-labels="bind: innerHTML, publishlbl" data-attachevent="listen: mousedown, press; listen: mouseup, update"></div></li><li class="a-cancel invisible"><div class="cancelmail" data-labels="bind: innerHTML, cancellbl" data-attachevent="listen: mousedown, press; listen: mouseup, cancel">Cancel</div></li></ul><div class="attach-preview invisible"></div><div id="attach-writetwocents" data-attach="bind:showWriteTwocent, twocents"></div><div div id="attach-twocents" class="twocents" data-attach="bind:displayTwocentList, twocents" data-place="place:LibraryTwocentUI"></div></div></div>';
                        
                        ui.reset = function reset(id){
                                // complete UI build (twocents) and display
                                var _domWrite = ui.dom.querySelector("#attach-writetwocents");
                                
                                _twocentWriteUI.reset(id);
                                _attachmentTwocentListUI.reset(id);
                                
                                ui.dom.classList.remove("invisible");
                                _twocentWriteUI.place(_domWrite);
                                
                                if (!ConfirmUI){
                                        ConfirmUI = new Confirm(ui.dom, labels.get("deleteattachment"), ui.deleteAttachment, "a-delconfirm");
                                        ConfirmUI.hide();
                                }
                                
                                // retrieve attachment document form database
                                cdb.unsync();
                                cdb.reset({});
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        // if user is author of attachment, create copy for edition purposes
                                        if (cdb.get("authors").indexOf(User.get("_id")) > -1){
                                                ui.resetEdit();       
                                        }
                                }, function(err){console.log(err);});
                        };
                        
                        ui.resetEdit = function(){
                                cdbEdit.reset({});
                                cdbEdit.set("name", cdb.get("name"));
                                cdbEdit.set("authors", cdb.get("authors").concat());
                                cdbEit.set("fileName", cdb.get("fileName"));
                                cdbEdit.set("category", cdb.get("category"));         
                        };
                        
                        ui.close = function(event, node){
                               ui.dom.classList.add("invisible");
                               document.querySelector(".cache").classList.remove("appear");
                        };
                        
                        ui.previewVote = function(event, node){
                             var i=0, idx = node.getAttribute("data-vote_id");
                             vote.loop(function(v,i){
                                     (i<=idx) ? vote.update(i, "active", true):vote.update(i, "active",false);        
                             });            
                        };
                        
                        ui.castVote = function(event, node){
                                var grade = parseInt(node.getAttribute("data-vote_id"))+1,
                                    id = cdb.get("_id"),
                                    json = {id : id, vote: grade, voter: user.get("_id")};
                                
                                // prevent multiple votes on the same idea -- if request fails or before database is updated 
                                if (!_voted){
                                        _voted = true;
                                        console.log(json);
                                        transport.request("Vote", json, function(result){
                                                var ra = user.get("rated_a") || [];
                                                if (result !== "ok"){
                                                        console.log(result, "something went wrong, please try again later");
                                                        _voted = false;
                                                }
                                                else {
                                                        // update user store locally to keep consistency
                                                        ra.unshift(id);
                                                        user.set("rated_a", ra);
                                                        alert(Config.get("labels").get("thankyou"));
                                                        
                                                        // hide voting interface and display rating
                                                        ui.dom.querySelector(".a-vote").classList.add("invisible");
                                                        ui.dom.querySelector(".a-rating").classList.remove("invisible");
                                                        
                                                        //cleanup 
                                                        vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                                }
                                        });
                                }
                        };
                        
                        ui.press = function(event, node){
                                node.classList.add("a-pressed");
                        };
                        
                        ui.download = function(event,node){
                                node.classList.remove("a-pressed");
                        };
                        
                        ui.displayWriteTwocent = function(event, node){
                                ui.dom.querySelector("#attach-writetwocents").classList.remove("invisible");
                                node.classList.remove("a-pressed");
                        };
                        
                        ui.edit = function(event, node){
                                node.classList.remove("a-pressed");
                                ui.dom.classList.add("edit-a");   
                        };
                        
                        ui.check = function(event, node){
                                
                        };
                        
                        ui.uploadFile = function(event, node){
                                
                        };
                        
                        ui.update = function(event, node){
                                node.classList.remove("a-pressed");        
                        };
                        
                        ui.cancel = function(event, node){
                                node.classList.remove("a-pressed");        
                        };
                        
                        ui.confirmDelete = function(event, node){
                                node.classList.remove("a-pressed");
                                ConfirmUI.reset(labels.get("deleteattachment"), ui.deleteAttachment);
                                ConfirmUI.show();
                        };
                        
                        ui.deleteAttachment =  function(choice){
                                console.log("deleting attachment");
                                var idea = cdb.get("docId"),
                                      a_id = cdb.get("_id"),
                                      fileName = cdb.get("fileName"),
                                      ideaCDB = new CouchDBDocument();
                                if (choice){
                                        // remove attachment from idea doc
                                        ideaCDB.setTransport(transport);
                                        ideaCDB.sync(Config.get("db"), idea)
                                        .then(function(){
                                                var a_array = ideaCDB.get("attachments").concat() || [],
                                                      l = a_array.length, i, idx=-1,
                                                      promise = new Promise();
                                                for(i=0; i<l; i++){
                                                        if (a_array[i].docId === a_id){
                                                                idx = i;
                                                                break;
                                                        }
                                                }
                                               
                                               if (idx <0){
                                                       promise.reject("error: attachment not found");
                                               }
                                               else{
                                                        a_array.splice(idx, 1);
                                                        ideaCDB.set("attachments", a_array);
                                                        ideaCDB.upload()
                                                        .then(function(){
                                                                promise.fulfill();
                                                        }) ;
                                               } 
                                               return promise;       
                                        })
                                        .then(function(){
                                                // delete attachment doc from database
                                                return cdb.remove();        
                                        })
                                        .then(function(){
                                                // close popup and delete file form server
                                                ui.close();
                                                return Utils.deleteAttachmentFile("idea", idea, fileName);  
                                        });
                                }
                                else{
                                        ConfirmUI.hide();                
                                }     
                        };
                }
                
                return function AttachmentFactory($type){
                        AttachmentConstructor.prototype = new Widget();
                        return new AttachmentConstructor($type);
                };
        });

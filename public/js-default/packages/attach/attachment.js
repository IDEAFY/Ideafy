/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "Place.plugin", "service/utils", "service/confirm", "Promise", "lib/spin.min"],
        function(Widget, Config, Store, CouchDBDocument, Model, Event, WriteTwocent, TwocentList, Place, Utils, Confirm, Promise, Spinner){
                
                function AttachmentConstructor($type){
                       
                        // declaration
                        var ui = this,
                             _attachmentTwocentListUI = new TwocentList("attach"),
                             _twocentWriteUI = new WriteTwocent("attach"),
                             cdb = new CouchDBDocument(),
                             cdbEdit = new Store(),
                             _progress = new Store({status: null}),
                             _uploadReq,
                             labels = Config.get("labels"),
                             transport = Config.get("transport"),
                             user = Config.get("user"),
                             _cat = Config.get("cat"),
                             vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                             _voted = false;
                       
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(labels),
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
                                        setDescription : function(desc){
                                                if (desc && desc !== "\n") {
                                                        this.classList.remove("invisible");
                                                        this.innerHTML = desc.replace(/\n/g, "<br>");
                                                }
                                                else this.classList.add("invisible");    
                                        },
                                        displayTwocentList : function(twocents){
                                                (twocents && twocents.length) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        setDate : function(id){
                                                var stamp = parseInt(id.replace("A:", ""), 10);
                                                this.innerHTML = Utils.formatDateStamp(stamp);
                                        },
                                        setAuthors : function(names){
                                                var res = "";
                                                if (names && names instanceof Array && names.length){
                                                        for (i=0, l=names.length; i<l;i++){
                                                               if (i === l-1){
                                                                       res += names[i];
                                                               }
                                                               else res += names[i] + ", ";
                                                        }
                                                        this.innerHTML = res;
                                                } 
                                                else this.innerHTML = names;      
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
                                                        this.addEventListener("touchstart", Utils.showLinkInBrowser);
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
                                        show : function(bool){
                                                (bool && ui.dom.classList.contains("edit-a")) ? this.setAttribute("style", "display:inline-block;") : this.setAttribute("style", "display:none;");
                                        },
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
                                "progress": new Model(_progress, {
                                        showStatus : function(status){
                                                (status) ? this.setAttribute("value", status) : this.setAttribute("value", 0) ;
                                        },
                                        showVal : function(status){
                                                (status) ? this.innerHTML = status + "%" : this.innerHTML = "";
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
                        
                        ui.template = '<div class = "attachment-screen invisible"><div class="close-popup" data-attachevent = "listen:mousedown, close"></div><div class="attach-header" data-attach="bind:innerHTML, name"></div><div class="attach-details"><div class="attach-body"><div class="a-type" data-attach="bind:setType, type"></div><div class="a-type-edit" data-attachevent="listen:mousedown, press"><input type="file" class="a-input" data-attachevent="listen:mousedown, check;listen:change, uploadFile"></div><div class="a-left"><div class="a-name" data-attach="bind:innerHTML, name" data-edit="bind:innerHTML, name" data-attachevent="listen:input, updateName"></div><div class="a-contrib"><span class="a-span" data-labels="bind: innerHTML, contrib"></span><span class="a-author" data-attach="bind: setAuthors, authornames"></span></div><div class="a-date" data-attach="bind:setDate, _id"></div></div><div class="a-cat"><span data-attach="bind:setCat, category"></span><select class="acolor invisible" data-edit="bind:setSelectCat, category" data-attachevent="listen: change, selectCat"></select><input maxlength=18 type="text" placeholder="Enter category" class="input custom-cat invisible" data-edit="bind:show, custom" data-attachevent="listen:input, setCat"></div><div class="a-rating invisible" data-attach="bind:showRating, votes"><a class="item-acorn"></a><span data-attach="bind:displayRating, votes"></span><span class="votes" data-attach="bind:displayNbVotes, votes"></span></div><div class="a-preview invisible"><div class="a-content" data-edit="bind:innerHTML, fileName"></div><progress class="uploadbar" data-progress="bind:showStatus, status" max=100></progress><div class="uploadval" data-progress="bind:showVal, status"></div></div><div class="a-vote" data-attach="bind:showVoting, _id"><legend data-labels="bind:innerHTML, rateit"></legend><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-attachevent="listen: mousedown, previewVote; listen: mouseup, castVote"></li></ul></div></div><ul class="actionbtn"><li><a class="attach-download" data-attach="bind: setRef, fileName" data-attachevent="listen:mousedown, press; listen:mouseup, download"></a></li><li><div class="a-2cent" data-attachevent="listen:mousedown, press; listen:mouseup, displayWriteTwocent"></div></li><li data-attach="bind:displayEdit, authors"><div class="a-edit" data-attachevent="listen:mousedown, press; listen:mouseup, edit"></div></li><li data-attach="bind:displayDelete, twocents"><div class="a-delete" data-attachevent="listen:mousedown, press; listen:mouseup, confirmDelete"></div></li><li class="a-publish invisible"><div class="sendmail" data-labels="bind: innerHTML, publishlbl" data-attachevent="listen:mousedown, press; listen: mouseup, update"></div></li><li class="a-cancel invisible"><div class="cancelmail" data-labels="bind: innerHTML, cancellbl" data-attachevent="listen: mousedown, press; listen: mouseup, cancel">Cancel</div></li></ul><p class="a-desc invisible" data-attach="bind: setDescription, description" data-attachevent="listen:input, updateDesc"></p><div class="attach-preview invisible"></div><div id="attach-writetwocents" data-attach="bind:showWriteTwocent, twocents"></div><div id="attach-twocents" class="twocents" data-attach="bind:displayTwocentList, twocents" data-place="place:LibraryTwocentUI"></div></div></div>';
                        
                        ui.reset = function reset(id){
                                // complete UI build (twocents) and display
                                var _domWrite = ui.dom.querySelector("#attach-writetwocents");
                                
                                _twocentWriteUI.reset(id);
                                _attachmentTwocentListUI.reset(id);
                                
                                // reset voting
                                _voted = false;
                                
                                ui.dom.classList.remove("invisible");
                                _twocentWriteUI.place(_domWrite);
                                
                                // retrieve attachment document form database
                                cdb.unsync();
                                cdb.reset({});
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        // if user is author of attachment, create copy for edition purposes
                                        if (cdb.get("authors").indexOf(user.get("_id")) > -1){
                                                ui.resetEdit();       
                                        }
                                }, function(err){console.log(err);});
                        };
                        
                        ui.resetEdit = function(){
                                cdbEdit.reset({});
                                cdbEdit.set("type", cdb.get("type"));
                                cdbEdit.set("name", cdb.get("name"));
                                cdbEdit.set("authors", cdb.get("authors").concat());
                                cdbEdit.set("authornames", cdb.get("authornames"));
                                cdbEdit.set("fileName", cdb.get("fileName"));
                                cdbEdit.set("category", cdb.get("category"));
                                cdbEdit.set("custom", cdb.get("custom"));
                                cdbEdit.set("description", cdb.get("description") || labels.get("attachdescplaceholder"));        
                        };
                        
                        ui.close = function(event, node){
                                if (ui.dom.classList.contains("edit-a")) ui.dom.classList.remove("edit-a");
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
                                event.preventDefault();
                                if (node.classList.contains("a-type")){
                                        if (ui.dom.classList.contains("edit-a")) node.classList.add("a-pressed");
                                }
                                else node.classList.add("a-pressed");
                        };
                        
                        ui.download = function(event,node){
                                node.classList.remove("a-pressed");
                        };
                        
                        ui.displayWriteTwocent = function(event, node){
                                ui.dom.querySelector("#attach-writetwocents").classList.remove("invisible");
                                node.classList.remove("a-pressed");
                        };
                        
                        ui.edit = function(event, node){
                                var   nameEl = ui.dom.querySelector(".a-name"),
                                        descEl = ui.dom.querySelector(".a-desc");
                                
                                node.classList.remove("a-pressed");
                                ui.dom.classList.add("edit-a");
                                nameEl.setAttribute("contentEditable", true);
                                descEl.setAttribute("contentEditable", true);
                                
                                // display description input and set placeholder if field was previously empty
                                if (!cdb.get("description")) {
                                        descEl.classList.remove("invisible");
                                        descEl.innerHTML = cdbEdit.get("description");
                                }
                        };
                        
                        ui.updateName = function(event, node){
                                cdbEdit.set("name", node.innerHTML);        
                        };
                        
                        ui.updateDesc = function(event, node){
                                cdbEdit.set("description", node.innerText);        
                        };
                        
                        ui.selectCat = function(event, node){
                                // if "other" is selected display category input field, else set attachment category value
                                if (node.value ===  node.lastChild.innerHTML){
                                        cdbEdit.set("custom", true);
                                        for (i=1, l=_cat.length; i<=l;i++){
                                                node.classList.remove("acolor"+i); 
                                        };
                                        node.classList.add("acolor");       
                                }
                                else{
                                        node.classList.remove("acolor");
                                        cdbEdit.set("custom", false);
                                        cdbEdit.set("category", _cat[node.selectedIndex-1]);
                                        for (i=1, l=_cat.length; i<=l;i++){
                                                (node.selectedIndex === i) ? node.classList.add("acolor"+i) : node.classList.remove("acolor"+i);        
                                        };  
                                }        
                        };
                        
                        ui.setCat = function(event, node){
                                cdbEdit.set("category", node.value) ;       
                        };
                        
                        ui.check = function(event, node){
                                node.classList.remove("a-pressed");      
                        };
                        
                        ui.uploadFile = function(event, node){
                                var _reader = new FileReader(),
                                       _fd = new FormData(),
                                       _id = cdb.get("docId"),
                                       _url = '/upload',
                                       _type = "afile",
                                       _dir,
                                       fileName = "";
                               
                               if (_id.search("I:") > -1) _dir = "ideas/" + _id;
                               
                               if (node.files && node.files.length){
                                       fileName = node.files[0].name;
                                       ui.dom.querySelector(".a-preview").classList.remove("invisible");
                                        
                                        cdbEdit.set("fileName", fileName);
                                        
                                        if (!cdbEdit.get("name")) cdbEdit.set("name", fileName);
                                                               
                                        _reader.onloadend = function(e){
                                                _fd.append("type", _type);
                                                _fd.append("dir", _dir);
                                                _fd.append("userfile", node.files[0]);
                                                _fd.append("filename", fileName);
                                                _uploadReq = Utils.uploadFile(_url, _fd, _progress, function(result){
                                                        return result;
                                                });
                                        };
                                
                                        _reader.readAsArrayBuffer(node.files[0]);
                                }       
                        };
                        
                        ui.checkUpdate = function(){
                                var update = false;
                                
                                if (cdbEdit.get("name") !== cdb.get("name") || cdbEdit.get("description") !== cdb.get("description")|| cdbEdit.get("fileName") !== cdb.get("fileName") || cdbEdit.get("category") !== cdb.get("category") || cdbEdit.get("authors").join() !== cdb.get("authors").join()){
                                        update = true;
                                }
                                return update;
                                
                        };
                        
                        ui.update = function(event, node){
                                node.classList.remove("a-pressed");
                                
                                if (ui.checkUpdate()){
                                        
                                        // if attached file has changed, delete previous file
                                        if (cdb.get("fileName") !== cdbEdit.get("fileName")){
                                                ui.deleteAttachmentFile(cdb.get("fileName"));
                                        }
                                        
                                        // update attachment document
                                        cdb.set("name", cdbEdit.get("name"));
                                        cdb.set("description", cdbEdit.get("description"));
                                        cdb.set("fileName", cdbEdit.get("fileName"));
                                        cdb.set("category", cdbEdit.get("category"));
                                        cdb.set("custom", cdbEdit.get("custom"));
                                        cdb.set("authors", cdbEdit.get("authors"));
                                        cdb.set("authornames", cdbEdit.get("authornames"));
                                        
                                        // hide edit interface
                                        ui.dom.classList.remove("edit-a");
                                        ui.dom.querySelector(".a-name").setAttribute("contentEditable", false);
                                        ui.dom.querySelector(".a-desc").setAttribute("contentEditable", false);
                                        ui.dom.querySelector(".a-preview").classList.add("invisible");
                                        
                                        ui.resetEdit(); 
                                        
                                        // update database
                                        cdb.upload()
                                        .then(function(){
                                                return ui.updateParentDoc(cdb.get("docId"));
                                        });
                                }
                                
                                else{
                                        ui.cancel();
                                }    
                        };
                        
                        ui.cancel = function(event, node){
                                node && node.classList.remove("a-pressed");
                                
                                // if an upload request is in progress then cancel it
                                if (_uploadReq && _uploadReq.readyState !== 4){
                                        _uploadReq.abort();
                                        _progress.reset({status: ""});
                                } 
                                
                                // if a new file has been uploaded, delete it from server
                                if (cdbEdit.get("fileName") !== cdb.get("fileName")) ui.deleteAttachmentFile(cdbEdit.get("fileName"));
                                
                                // exit edit interface
                                ui.dom.querySelector(".a-name").setAttribute("contentEditable", false);
                                ui.dom.querySelector(".a-desc").setAttribute("contentEditable", false);
                                ui.dom.querySelector(".a-preview").classList.add("invisible");
                                ui.dom.classList.remove("edit-a");
                                
                                // reset Edit store
                                ui.resetEdit();    
                        };
                        
                        ui.confirmDelete = function(event, node){
                                node.classList.remove("a-pressed");
                                Confirm.reset(labels.get("deleteattachment"), ui.deleteAttachment, "a-delconfirm");
                                Confirm.show();
                        };
                        
                        ui.deleteAttachmentFile = function(fileName){
                                return Utils.deleteAttachmentFile(cdb.get("docId"), fileName);    
                        };
                        
                        ui.deleteAttachment =  function(choice){
                                var doc = cdb.get("docId"),
                                      a_id = cdb.get("_id"),
                                      fileName = cdb.get("fileName"),
                                      parentCDB = new CouchDBDocument();
                                if (choice){
                                        // remove attachment from idea doc
                                        parentCDB.setTransport(transport);
                                        parentCDB.sync(Config.get("db"), doc)
                                        .then(function(){
                                                var a_array = parentCDB.get("attachments").concat() || [],
                                                      l = a_array.length, i, idx=null,
                                                      promise = new Promise();
                                                for(i=0; i<l; i++){
                                                        if (a_array[i].docId === a_id){
                                                                idx = i;
                                                                break;
                                                        }
                                                }
                                               
                                               if (idx === null){
                                                       promise.reject("error: attachment not found");
                                               }
                                               else{
                                                        a_array.splice(idx, 1);
                                                        parentCDB.set("attachments", a_array);
                                                        parentCDB.upload()
                                                        .then(function(){
                                                                promise.fulfill();
                                                        }) ;
                                               } 
                                               return promise;       
                                        })
                                        .then(function(){
                                                console.log("before calling remove");
                                                // delete attachment doc from database
                                                return cdb.remove();        
                                        })
                                        .then(function(){
                                                // close popup and delete file form server
                                                ui.close();
                                                return Utils.deleteAttachmentFile(doc, fileName);  
                                        });
                                }
                                else{
                                        Confirm.hide();                
                                }     
                        };
                        
                        ui.updateParentDoc = function(id){
                                var promise = new Promise(),
                                      doc = new CouchDBDocument();
                                
                                doc.setTransport(transport);
                                doc.sync(Config.get("db"), id)
                                .then(function(){
                                        var att = doc.get("attachments").concat(), idx, i, l = att.length;
                                        for (i=0;i<l;i++){
                                                if (att[i].docId === cdb.get("_id")){
                                                        idx = i;
                                                        break;
                                                }
                                        }
                                        att.splice(idx, 1, {
                                                docId : cdb.get("_id"),
                                                type : cdb.get("type"),
                                                category : cdb.get("category"),
                                                name : cdb.get("name"),
                                                fileName : cdb.get("fileName"),
                                                authornames: cdb.get("authornames")
                                        });
                                        doc.set("attachments", att);
                                        return doc.upload();
                                })
                                .then(function(){
                                        promise.fulfill();
                                });
                                                               
                                return promise;
                        };
                }
                
                return function AttachmentFactory($type){
                        AttachmentConstructor.prototype = new Widget();
                        return new AttachmentConstructor($type);
                };
        });

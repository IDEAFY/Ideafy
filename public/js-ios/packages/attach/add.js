/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2012-2013 IDEAFY
 */

define(["OObject", "service/config", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "service/utils", "Promise", "lib/spin.min"],
        function(Widget, Config, Store, CouchDBDocument, Model, Event, Utils, Promise, Spinner){
                
                function AddAttachmentConstructor(){
                       
                        // declaration
                        var ui = this,
                              transport = Config.get("transport"),
                              user = Config.get("user"),
                              cats = Config.get("cat"),
                              _labels = Config.get("labels"),
                              cdb = new CouchDBDocument({
                                    custom : false,
                                    category : "",
                                    name : "",
                                    description:"",
                                    type : "",
                                    fileName : "",
                                    authors : [user.get("_id")],
                                    authornames : user.get("username"),
                                    docId: "",
                                    rating: null,
                                    votes:[],
                                    twocents:[],
                                    uploaded: false
                              }),
                              _progress = new Store({status:null}),
                              uploadReq, parentDoc, parentType, aList,
                              aspinner = new Spinner({color:"#657b99", lines:8, length: 6, width: 3, radius:6, top: -2, left: -2}).spin();
                        
                        cdb.setTransport(transport);
                        
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(_labels),
                                "attach" : new Model(cdb,{
                                        show : function(bool){
                                                (bool) ? this.setAttribute("style", "display:inline-block;") : this.setAttribute("style", "display:none;");
                                        },
                                        hide : function(uploaded){
                                                if (uploaded) this.setAttribute("style", "display:none;");        
                                        },
                                        setContent : function(type){
                                                var node = this;
                                                switch(type){
                                                         case "file":
                                                                node.innerHTML = cdb.get("fileName");
                                                                break;
                                                        default:
                                                                node.innerHTML = cdb.get("name");
                                                        break;
                                                }        
                                        },
                                        setName : function(name){
                                                this.value = name;
                                        },
                                        resetCat : function(cat){
                                                var node = this;
                                                if (cat === "") {
                                                        node.selectedIndex = 0;
                                                        [1,2,3,4,5,6].forEach(function(val){
                                                                node.classList.remove("acolor"+val);
                                                                node.classList.add("acolor");
                                                        });
                                                }
                                        },
                                        setAttachmentCat : function(uploaded){
                                                if (!uploaded){
                                                        var custom = [], arr, i, l, key,
                                                                res = "<option selected disabled style='display:none;'>"+_labels.get("choosecat")+"</option>";
                                                        if (user.get("categories")) custom = user.get("categories");
                                                        for (i=0, l=cats.length; i<l;i++){
                                                                key = cats[i];
                                                                res+="<option>"+_labels.get(key)+"</option>";
                                                        }
                                                        if (custom.length){
                                                                for (i=0, l=custom.length; i<l;i++){
                                                                        res+="<option>"+custom[i]+"</option>";
                                                                }
                                                        }
                                                        res+="<option>"+_labels.get("other")+"</option>";
                                                        this.innerHTML = res;
                                                }
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
                                "addevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class="add-attachments"><select class="acolor" data-attach="bind:setAttachmentCat, uploaded; bind:resetCat, category" data-addevent="listen: change, selectCat"></select><input maxlength=18 type="text" placeholder="Enter category" class="input custom-cat" data-attach="bind:show, custom" data-addevent="listen:input, setCat"><input maxlength=36 type="text" placeholder="Enter name" class="input a-name" data-attach="bind:setName, name" data-addevent="listen: input, setName"><ul class="a-tools" data-attach="bind:show, category; bind:hide, uploaded"><li class="toolbox-button"><div class="upload-button" name="upload" data-addevent="listen:touchstart, press; listen:touchend, release"><input type="file" class="a-input" data-addevent="listen:change, uploadFile"></div><legend data-labels="bind:innerHTML, filelbl"></legend></li><li class="toolbox-button" style="display:none"><div class="importpic-button" name="import" data-addevent="listen:touchstart, press"></div><legend data-labels="bind:innerHTML, imagelbl"></legend></li><li class="toolbox-button" style="display:none"><div class="drawingtool-button" name="drawing" data-addevent="listen:touchstart, press"></div><legend data-labels="bind:innerHTML, drawinglbl">Drawing</legend></li></ul><div class="a-preview invisible"><div class="a-content" data-attach="bind:setContent, type"></div><progress class="uploadbar" data-progress="bind:showStatus, status" max=100></progress><div class="uploadval" data-progress="bind:showVal, status"></div></div><div class="a-button a-confirm" data-attach="bind:show, uploaded" data-addevent="listen:touchstart, press; listen: touchstart, aconfirm; listen:touchend, release">&#10003</div><div class="a-button a-cancel" data-attach="bind:show, uploaded" data-addevent="listen:touchstart, press; listen:touchstart, acancel">&#10007</div><textarea class="a-desc input" data-labels="bind:placeholder, attachdescplaceholder" data-attach="bind: value, description" data-attachevent="listen: input, updateDesc"></textarea></div>';
                        
                        ui.reset = function reset($parentDoc, $parentType, $aList){
                                
                                parentDoc = $parentDoc;
                                parentType = $parentType;
                                aList = $aList;
                                
                                // unsync if applicable
                                cdb.unsync();
                                
                                // clear attachment
                                cdb.reset({
                                        custom : false,
                                        category : "",
                                        name : "",
                                        description: "",
                                        type : "",
                                        fileName : "",
                                        authors : [user.get("_id")],
                                        authornames : [user.get("username")],
                                        docId: parentDoc,
                                        rating: null,
                                        votes: [],
                                        twocents: [],
                                        uploaded: false
                                });
                                
                                // release buttons
                                ui.dom.querySelector(".a-confirm").classList.remove("pressed");
                                ui.dom.querySelector(".a-cancel").classList.remove("pressed");
                               
                                // hide a-preview window
                                ui.dom.querySelector(".a-preview").classList.add("invisible");
                        };
                        
                        ui.show = function(){
                                ui.dom.classList.remove("invisible");       
                        };
                        
                        ui.hide = function(){
                                ui.dom.classList.add("invisible");
                        };
                        
                        ui.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        ui.release = function(event, node){
                                node.classList.remove("pressed");         
                        };
                        
                        ui.selectCat = function(event, node){
                                // if "other" is selected display category input field, if custom category is selected remove color, else set attachment category value
                                if (node.selectedIndex > cats.length){
                                        if (node.value ===  node.lastChild.innerHTML){
                                                cdb.set("custom", true);
                                        }
                                        else{
                                                cdb.set("custom", false);
                                                for (i=1, l=cats.length; i<=l;i++){
                                                        node.classList.remove("acolor"+i); 
                                                };
                                                cdb.set("category", node.value);
                                        }
                                        node.classList.add("acolor");       
                                }
                                else{
                                        node.classList.remove("acolor");
                                        cdb.set("custom", false);
                                        cdb.set("category", cats[node.selectedIndex-1]);
                                        for (i=1, l=cats.length; i<=l;i++){
                                                (node.selectedIndex === i) ? node.classList.add("acolor"+i) : node.classList.remove("acolor"+i);        
                                        };  
                                } 
                        };
                        
                        ui.setCat = function(event, node){
                                cdb.set("category", node.value);     
                        };
                        
                        ui.setName = function(event, node){
                                cdb.set("name", node.value);
                        };
                        
                        ui.updateDesc = function(event, node){
                                cdb.set("description", node.value);      
                        };
                        
                        ui.check = function(event, node){
                                node.parentNode.classList.remove("pressed");
                        };
                        
                        ui.uploadFile = function(event, node){
                                var _reader = new FileReader(),
                                       _fd = new FormData(),
                                       _now = new Date(),
                                       _id = parentDoc,
                                       _url = '/upload',
                                       _type = "afile",
                                       _dir,
                                       fileName = "";
                               
                               // if parentDoc is new generate new docId
                               
                               switch (parentType){
                                       case "idea":
                                                if (_id === "new") _id = "I:"+_now.getTime();
                                                _dir =  "ideas/"+_id;
                                                parentDoc = _id;
                                                break;
                                        default:
                                                if (_id === "new") _id = "I:"+_now.getTime();
                                                _dir =  "ideas/"+_id;
                                                parentDoc = _id;
                                                break;
                               }
                               
                               if (node.files && node.files.length){
                                       fileName = node.files[0].name;
                                        ui.dom.querySelector(".a-preview").classList.remove("invisible");
                                        
                                        cdb.set("fileName", fileName);
                                        cdb.set("docId", _id);
                                        if (!cdb.get("name")) cdb.set("name", fileName);
                                        cdb.set("type", "file");
                                                               
                                        _reader.onloadend = function(e){
                                                _fd.append("type", _type);
                                                _fd.append("dir", _dir);
                                                _fd.append("userfile", node.files[0]);
                                                _fd.append("filename", fileName);
                                                _uploadReq = Utils.uploadFile(_url, _fd, _progress, function(result){
                                                        cdb.set("uploaded", true);
                                                });
                                        };
                                
                                        _reader.readAsArrayBuffer(node.files[0]);
                                }
                        };
                        
                        ui.deleteAttachmentFile = function(fileName){
                                return Utils.deleteAttachmentFile(parentDoc, fileName);      
                        };
                        
                        ui.deleteAttachmentDoc = function(docId){
                                return Utils.deleteAttachmentDoc(docId);        
                        };
                        
                        ui.aconfirm = function(event, node){
                                var now = new Date(),
                                      id = "A:"+now.getTime();
                                
                                // Attachment needs a name and a category to be uploaded
                               
                               if (cdb.get("name") && cdb.get("category")){
                                        aspinner.spin(node);
                                        cdb.sync(Config.get("db"), id)
                                        .then(function(err){
                                                if (err) console.log(err);
                                                return cdb.upload();
                                        })
                                        .then(function(){
                                                var custom = [];
                                                
                                                user.get("categories") && (custom = user.get("categories").concat());
                                                
                                                // add to attachment list
                                                aList.alter("unshift" , {
                                                        docId : id,
                                                        type : cdb.get("type"),
                                                        category : cdb.get("category"),
                                                        name : cdb.get("name"),
                                                        fileName : cdb.get("fileName"),
                                                        authornames : cdb.get("authornames")
                                                });
                                                
                                                // if user created a new custom category add it
                                                if (cdb.get("custom")){
                                                        if (custom.indexOf(cdb.get("category")) === -1){
                                                                custom.push(cdb.get("category"));
                                                                user.set("categories", custom);
                                                                user.upload();       
                                                        }
                                                }
                               
                                                // stop spinner
                                                aspinner.stop(); 
                                        
                                                // reset attachment
                                                ui.reset(parentDoc, parentType, aList);           
                                        });
                                }
                                else if (!cdb.get("name")){
                                               
                                }
                                else{
                                              
                                }                                 
                        };
                        
                        ui.acancel = function(event, node){
                                var file = cdb.get("fileName");
                                
                                ui.abortReq();
                                
                                ui.deleteAttachmentFile(file);
                                
                                // reset attachment
                                ui.reset(parentDoc, parentType, aList);   
                        };
                        
                        ui.getDocId = function(){
                                if (parentDoc === "new") return false;
                                else return parentDoc;        
                        };
                        
                        ui.getFileName = function(){
                                return cdb.get("fileName");
                        };
                        
                        ui.getReq = function(){
                                return uploadReq;
                        };
                        
                        ui.abortReq = function(){
                                if (uploadReq && uploadReq.readyState !== 4){
                                        uploadReq.abort();
                                        _progress.reset({status: ""});
                                }        
                        };
                }
                
                return function AddAttachmentFactory(){
                        AddAttachmentConstructor.prototype = new Widget();
                        return new AddAttachmentConstructor();
                };
        });

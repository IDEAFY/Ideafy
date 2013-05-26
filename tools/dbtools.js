DELCHAT = function delChat(){
                        var cdb = new CouchDBView();
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), "chat", "_view/all")
                        .then(function(){
                                cdb.loop(function(v,i){
                                        var doc = new CouchDBDocument();
                                        doc.setTransport(Config.get("transport"));
                                        doc.sync(Config.get("db"), v.id).then(function(){
                                                setTimeout(function(){doc.remove();}, 150);
                                        });
                                }); 
                                console.log("chat documents removed"); 
                        });       
                };
                
DELMUSESSIONS = function delMusessions(){
                      var cdb = new CouchDBView();
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), "library", "_view/sessions")
                        .then(function(){
                                cdb.unsync();
                                cdb.loop(function(v,i){
                                        var doc = new CouchDBDocument();
                                        doc.setTransport(Config.get("transport"));
                                        if (v.id.search("S:MU") >-1){
                                                doc.sync(Config.get("db"), v.id).then(function(){
                                                        setTimeout(function(){doc.remove();}, 150);
                                                });
                                        }
                                }); 
                                console.log("multi user session documents removed");
                        });  
                };
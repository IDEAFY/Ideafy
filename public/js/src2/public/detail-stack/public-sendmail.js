define("Ideafy/Public/Sendmail", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Ideafy/Avatar", "Ideafy/Utils"], 
	function(Widget, Map, Config, Model, Event, Store, Avatar, Utils){
		return function PublicSendmailConstructor($obs){
		//declaration
			var _widget = new Widget(),
			    _error = new Store({"errormsg": ""}),
			    _user = Config.get("user"),
			    _transport = Config.get("transport"),
			    _labels = Config.get("labels"),
			    _mail = new Store({"toField":"", "from": "", "subject":"", "body": "", "signature": "", "attachment": ""});
		//setup
		        _widget.plugins.addAll({
                                "labels": new Model(_labels),
                                "mail" : new Model(_mail, {
                                        setUserAvatar : function(from){
                                                if (from) this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;");
                                        },
                                        date : function date(date){
                                                if (date) this.innerHTML = Utils.formatDate(date);
                                        },
                                        setAvatar : function setAvatar(authors){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar(authors);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        },
                                        setSignature : function(sign){
                                                if (!sign) this.setAttribute("placeholder", _user.get("username")+ " <" + _user.get("_id"));     
                                        },
                                        setRating : function(rating){
                                                
                                        },
                                        setVotes : function(votes){
                                                
                                        }
                                }),
                                "mailevent" : new Event(_widget),
                                "errormsg" : new Model(_error,{
                                        setError : function(error){
                                                switch (error){}
                                        }
                                })
                        });
		        
			_widget.alive(Map.get("public-sendmail"));
			
			_widget.reset = function reset(idea){
			     console.log(idea);
			     _error.reset({"errormsg": ""});
			     _mail.reset({"toField":"", "from": _user.get("username")+" <"+_user.get("_id")+">", "subject":"", "body": "", "signature":"", "attachment": idea});
			     json = {};
			};
			
			_widget.validateAddress = function(event, node){
			        
			};
			
			_widget.validateMessage = function validateMessage(){
			     
			     return (_error.get("errormsg") === "");       
			};
			
			_widget.sendMail = function sendMail(){
			     console.log("send message now"); 
			     json.type = "doc";
			     json.recipient = _mail.get("toField");
			     json.subject = _user.get("username") + _labels.get("sentdocmsg");
			     json.header = _mail.get("subject");
			     json.body = _mail.get("body");
			     json.signature = _mail.get("from");
			     json.attachHeader = "<div style='border:1px solid #cccccc'; border-radius=5px; padding = 10px;'>"+ Utils.formatDate(_mail.get("attachment").creation_date) + "<br><p><b>" + mail.get("attachment").title + "</b></p><br><p><i>" + _mail.get("attachment").authornames + "</i></p>";
			     json.attachBody = "<p style='margin-top: 20px;'>"+_mail.get("attachment").description+"</p><pstyle='margin-top: 20px;'>" + _mail.get("attachment").solution + "</p>";
			     console.log(json);
			     _transport.request("SendMail", json, function(result){
			             if (result.sendmail === "ok"){
			                     _error.set("errormsg", _labels.get("yourmessage")+result.recipient+_labels.get("sentoklbl"));        
			             }
			             else{
			                     _error.set("errormsg", _labels.get("somethingwrong"));
			                     console.log("error", result.error);
			                     console.log("response", result.response);
			             }
			     });            
			};
			
			_widget.press = function(event, node){
			     node.classList.add("pressed");        
			};
			
			_widget.send = function(event, node){
			     if (_widget.validateMessage()) _widget.sendMail();            
			};
			
			_widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                $obs.notify("hide");       
                        };

		//return
			return _widget;
		};
	}
);
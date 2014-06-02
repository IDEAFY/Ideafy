/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "service/config", "Bind.plugin", "Event.plugin", "Store", "service/avatar", "service/utils"], 
	function(Widget, Map, Config, Model, Event, Store, Avatar, Utils){
		return function PublicSendmailConstructor($action){
		//declaration
			var _widget = new Widget(),
			    _error = new Store({"errormsg": ""}),
			    _user = Config.get("user"),
			    _transport = Config.get("transport"),
			    _labels = Config.get("labels"),
			    _mail = new Store({"toField":"", "from": "", "subject":"", "body": "", "signature": "", "attachment": "", "sent": false});
		//setup
		        _widget.plugins.addAll({
                                "labels": new Model(_labels),
                                "mail" : new Model(_mail, {
                                        setUserAvatar : function(from){
                                                if (from) this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;background-size: cover;");
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
                                        setRating : function(rating){
                                                
                                        },
                                        setVotes : function(votes){
                                                
                                        }
                                }),
                                "mailevent" : new Event(_widget),
                                "errormsg" : new Model(_error)
                        });
		        
		        _widget.template = '<div class="idea-sendmail"><div class="header blue-dark"><a href="#public-2cents" class="option left"></a><span data-labels="bind:innerHTML, sendidealbl"></span><a href="#public-favorites" class="option right"></a></div><div class="avatar" data-mail="bind:setUserAvatar, from"></div><form class="form"><p><textarea class="mail-header" data-mail="bind: value, toField" data-labels="bind:placeholder, tolbl"></textarea></p><p><input type="text" class="input" data-mail="bind:value, subject" data-labels="bind:placeholder, subjectlbl"></textarea></p><p><textarea class="input" data-mail="bind:value, body"></textarea></p><p><legend data-labels="bind: innerHTML, signaturelbl"></legend><textarea class="signature" data-mail="bind:value, signature"></textarea></p><div class="attachment"><div class="attachment-header"><div data-mail="bind:setAvatar, attachment.authors"></div><span class="date" data-mail="bind:date, attachment.creation_date"></span><h2 data-mail="bind:innerHTML,attachment.title"></h2><span class="author" data-mail="bind:innerHTML,attachment.authornames"></span><span data-labels="bind:innerHTML, ideawrotelbl"></span><div class="visibility-icon private"></div></div><div class="attachment-body"><p data-mail="bind:innerHTML,attachment.description"></p><p data-mail="bind:innerHTML,attachment.solution"></p><div class = "rating" data-mail="bind:setRating, attachment.rating"></div><div class = "votes" data-mail="bind:setVotes, attachment. votes"></div></div></div><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-mailevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sendlbl" data-mailevent="listen:touchstart, press; listen:touchend, send">Send</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></form></div>';
		        
			_widget.place(Map.get("public-sendmail"));
			
			_widget.reset = function reset(idea){
			     _error.reset({"errormsg": ""});
			     _mail.reset({"toField":"", "from": _user.get("username"), "subject":"", "body": "", "signature": _user.get("username")+" <"+_user.get("_id"), "attachment": idea, "sent": false});
			     if (_user.get("signature")) _mail.set("signature", _user.get("signature"));
			     json = {};
			};
			
			_widget.validateAddress = function validateAddress(value){
			     var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
			         emailArray = value.toLowerCase().split(/,|;/),
			         result = true;
			     
                             for (i=0, l=emailArray.length; i<l; i++){
                                if (!emailPattern.test(emailArray[i].trim())) {
                                        _error.set("errormsg", emailArray[i]+_labels.get("notavalidaddress"));
                                        result = false;
                                        break;
                                }         
                             }
                             return result;        
			};
			
			_widget.validateMessage = function validateMessage(){
			     // check email addresses
			     (_mail.get("toField")) ? _widget.validateAddress(_mail.get("toField")) : _error.set("errormsg", _labels.get("norecipient"));
			     return (_error.get("errormsg") === "");       
			};
			
			_widget.sendMail = function sendMail(){
			     // formatting message
			     json.type = "doc";
			     json.recipient = _mail.get("toField");
			     json.cc = _user.get("_id"); // this is a parameter users could disable
			     json.replyTo =_user.get("_id");
			     json.subject = _user.get("username") + _labels.get("sentdocmsg");
			     json.header = _mail.get("subject");
			     json.body = _mail.get("body");
			     json.signature = _mail.get("signature");
			     json.attachHeader = "<div style='background:#657B99; font-family:Helvetica; padding:15px;'><p style='color:white;font-size:24px;font-weight:bold;margin-top:10px;'>" + _mail.get("attachment").title + "</p><p style='color: #F27B3D; font-size:16px; font-weight:bold;margin-bottom:10px;'>" + _mail.get("attachment").authornames + ", <span style='color:black';>" + Utils.formatDate(_mail.get("attachment").creation_date) + "</span></p></div>";
			     json.attachBody = "<div style='border:1px solid #657b99;background:white'><p style='font-size:14px; font-family:Helvetica; text-align:justify; padding:15px;'>"+ _mail.get("attachment").description + "</p><p style='font-size:14px; font-family:Helvetica; text-align:justify; padding:15px;'>" + _mail.get("attachment").solution + "</p></div>";
			     // send request
			     _transport.request("SendMail", json, function(result){
			             if (result.sendmail === "ok"){
			                     _error.set("errormsg", _labels.get("yourmessage")+result.recipient+_labels.get("sentoklbl"));
			                     //_widget.place(document.createDocumentFragment());
			                     setTimeout(function(){$action("close");}, 350);       
			             }
			             else{
			                     _error.set("errormsg", _labels.get("somethingwrong"));
			                     _mail.set("sent", false);
			                     console.log("error", result.error);
			                     console.log("response", result.response);
			             }
			     });            
			};
			
			_widget.press = function(event, node){
			     
			     if (!node.classList.contains("sendmail") || !_mail.get("sent")) node.classList.add("pressed");        
			};
			
			_widget.send = function(event, node){
			     if (!_mail.get("sent")){
			             _mail.set("sent", true); // to avoid multiple attempts
			             _error.set("errormsg", ""); //reset error message
			             node.classList.remove("pressed");
			             (_widget.validateMessage()) ? _widget.sendMail() : _mail.set("sent", false);
			     }          
			};
			
			_widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                $action("close");       
                        };

		//return
			return _widget;
		};
	});
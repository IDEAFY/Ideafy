/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "service/map", "Amy/Stack-plugin", "./detail-stack/public-idea", "./detail-stack/public-edit", "./detail-stack/public-sendmail", "./detail-stack/public-share", "service/config", "Store", "lib/spin.min"], 
	function(Widget, Model, Map, Stack, IdeaDetail, Edit, Sendmail, Share, Config, Store, Spinner){
		return function IdeaStackConstructor(){
		//declaration
			var  _widget = new Widget(),
                             _emptyList = new Widget(),
			     _ideaDetail, _sendmail, _share, _edit,
		             _stack = new Stack(),
                             _labels = Config.get("labels"),
		             _observer = Config.get("observer"),
		             _store = new Store(),
		             current = 0,
		             spinner = new Spinner({color:"#808080", lines:10, length: 12, width: 6, radius:10, top: 328}).spin();

		//setup
		        
			
			_widget.plugins.addAll({
			        "detailstack" : _stack
			});
			
			_widget.template = '<div class="detail-stack" data-detailstack="destination"></div>';
			
			_emptyList.template = '<div class="msgsplash"><div class="header blue-dark"><span data-labels="bind:innerHTML, noideafound"></span></div><div class="innersplash"><span data-labels="bind: innerHTML, tryotherview"></span></div></div>';
                        _emptyList.plugins.add("labels", new Model(_labels));

		//detail
			_widget.reset = function reset(viewStore, index){
			        _store = viewStore;
                                current = index;
                                if (_store.getNbItems()){
                                     _stack.getStack().show("#public-ideadetail");
                                        _ideaDetail.hideCache();
                                        spinner.spin(_widget.dom);
                                     _ideaDetail.reset(viewStore, index)
                                        .then(function(){
                                                spinner.stop();
                                                cache.classList.add("invisible");
                                        });
                                }
                                else{
                                        _stack.getStack().show("#empty-list");
                                }
			};
			
			_widget.displayEmpty = function displayEmpty(name){
                                _stack.getStack().show("#empty-list");                     
                        };
                        
                        _widget.action = function action(name){
                                var id = _store.get(current).id;
                                switch(name){
                                        
                                        case "#public-edit":
                                                _edit.reset(id);
                                                _stack.getStack().show('#public-edit');
                                             break;
                                        case "#public-favorites":  
                                             break;
                                        case "#public-share":
                                                _share.reset(id);
                                                _stack.getStack().show("#public-share");
                                             break;
                                        case "close":
                                             _stack.getStack().show("#public-ideadetail");
                                             break;
                                        default:
                                             _stack.getStack().show("#public-ideadetail");
                                             break;
                                }       
                        };
			
			_widget.edit = function edit(id){
			        _edit.reset(id);
			        _stack.getStack().show("#public-edit");     
			};
			
			_widget.sendMail = function sendMail(idea){
			         _sendmail.reset(idea);
                                 _stack.getStack().show("#public-sendmail");        
			};
			
			_widget.share = function share(idea){
			        _share.reset(idea._id);
                                _stack.getStack().show("#public-share");         
			};
			
			// init
			
			// initialize UIs
			_ideaDetail = new IdeaDetail(_widget.action);
			_edit = new Edit(_widget.action);
			_sendmail = new Sendmail(_widget.action);
			_share = new Share(_widget.action);
			// add to stacck
			_stack.getStack().add("#public-ideadetail", _ideaDetail);
                        _stack.getStack().add("#public-edit", _edit);
                        _stack.getStack().add("#public-sendmail", _sendmail);
                        _stack.getStack().add("#public-share", _share);
                        _stack.getStack().add("#empty-list", _emptyList);
                        
                        _observer.watch("public-viewidea", function(id){
			             _widget.viewIdea(id);       
			});
			
			_observer.watch("public-edit", function(id){
			             _widget.edit(id);        
                        });
                        
                        _observer.watch("public-sendmail", function(idea){
                                     _widget.sendMail(idea);        
                        });
                        
                        _observer.watch("public-share", function(idea){
                                     _widget.share(idea);        
                        });
			
			
		//return
			return _widget;
		};
	});
/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "Bind.plugin", "./detail-stack/library-idea", "./detail-stack/library-edit", "./detail-stack/library-sendmail", "./detail-stack/library-share", "service/config", "Store", "lib/spin.min"], 
	function(Widget, Map, Stack, Model, IdeaDetail, Edit, Sendmail, Share, Config, Store, Spinner){
		return function IdeaStackConstructor(){
		//declaration
			var  _widget = new Widget(),
                             _emptyList = new Widget(),
			     _ideaDetail, _sendmail, _share, _edit,
		             _stack = new Stack(),
		             _observer = Config.get("observer"),
                             _labels = Config.get("labels"),
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

		//library
			_widget.reset = function reset(viewStore, index){
			        var cache;
			        _store = viewStore;
			        current = index;
			        _stack.getStack().show("#library-ideadetail");
			        _ideaDetail.hideCache();
			        spinner.spin(_widget.dom);
			        _ideaDetail.reset(viewStore, index)
			        .then(function(){
			                spinner.stop();
			                cache.classList.add("invisible");
			        });
			};
			
			_widget.action = function action(name){
                                switch(name){
                                        
                                        case "#library-edit":
                                                _edit.reset(_store.get(current).id);
                                                _stack.getStack().show('#library-edit');
                                             break;
                                        
                                        case "#library-favorites":
                                             break;
                                             
                                        case "#library-share":
                                                _share.reset(_store.get(current).id);
                                                _stack.getStack().show("#library-share");
                                             break;
                                        case "close":
                                             _stack.getStack().show("#library-ideadetail");
                                             spinner.spin(_widget.dom);
                                             _ideaDetail.refresh()
                                             .then(function(){
                                                     spinner.stop();
                                             });
                                             break;
                                        default:
                                             _stack.getStack().show("#library-ideadetail");
                                             break;
                                }       
                        };
			
			_widget.edit = function edit(id){
			        _edit.reset(id);
			        _stack.getStack().show("#library-edit");     
			};
			
			_widget.sendMail = function sendMail(idea){
			         _sendmail.reset(idea);
                                 _stack.getStack().show("#library-sendmail");        
			};
			
			_widget.share = function share(idea){
			         _share.reset(idea._id);
                                 _stack.getStack().show("#library-share");        
                        };
			
			_widget.displayEmpty = function displayEmpty(name){
                                _stack.getStack().show("#empty-list");                     
                        };
                        
                        // init
			_ideaDetail = new IdeaDetail(_widget.action);
			_edit = new Edit(_widget.action);
			_sendmail = new Sendmail(_widget.action);
			_share = new Share(_widget.action);
			
			_stack.getStack().add("#library-ideadetail", _ideaDetail);
                        _stack.getStack().add("#library-edit", _edit);
                        _stack.getStack().add("#library-sendmail", _sendmail);
                        _stack.getStack().add("#library-share", _share);
                        _stack.getStack().add("#empty-list", _emptyList);
                        
                        _observer.watch("library-viewidea", function(id){
			             _widget.viewIdea(id);       
			});
			
			_observer.watch("library-edit", function(id){
			             _widget.edit(id);        
                        });
                        
                        _observer.watch("library-sendmail", function(idea){
                                     _widget.sendMail(idea);        
                        });
                        
                        _observer.watch("library-share", function(idea){
                                     _widget.share(idea);        
                        });
			
		//return
			return _widget;
		};
	});
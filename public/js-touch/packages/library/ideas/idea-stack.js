/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "./detail-stack/library-idea", "./detail-stack/library-edit", "./detail-stack/library-sendmail", "./detail-stack/library-share", "service/config", "Store", "lib/spin.min"], 
	function(Widget, Map, Stack, IdeaDetail, Edit, Sendmail, Share, Config, Store, Spinner){
		return function IdeaStackConstructor(){
		//declaration
			var  _widget = new Widget(),
			     _ideaDetail, _sendmail, _share, _edit,
		             _stack = new Stack(),
		             _observer = Config.get("observer"),
		             _store = new Store(),
		             current = 0,
		             spinner = new Spinner({color:"#9AC9CD", lines:10, length: 12, width: 6, radius:10, top: 328}).spin();

		//setup
		        
			
			_widget.plugins.addAll({
			        "detailstack" : _stack
			});
			
			_widget.template = '<div class="detail-stack" data-detailstack="destination"></div>';

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
			
			// init
			_ideaDetail = new IdeaDetail(_widget.action);
			_edit = new Edit(_widget.action);
			_sendmail = new Sendmail(_widget.action);
			_share = new Share(_widget.action);
			
			_stack.getStack().add("#library-ideadetail", _ideaDetail);
                        _stack.getStack().add("#library-edit", _edit);
                        _stack.getStack().add("#library-sendmail", _sendmail);
                        _stack.getStack().add("#library-share", _share);
                        
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
/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "./detail-stack/library-idea", "./detail-stack/library-edit", "./detail-stack/library-sendmail", "./detail-stack/library-share", "service/config", "Store"], 
	function(Widget, Map, Stack, IdeaDetail, Edit, Sendmail, Share, Config, Store){
		return function IdeaStackConstructor(){
		//declaration
			var  _widget = new Widget(),
		             _stack = new Stack(),
		             _dom = Map.get("ideas-detail"),
		             _observer = Config.get("observer"),
		             _store = new Store(),
		             current = 0;

		//setup
		        
			
			_widget.plugins.addAll({
			        "detailstack" : _stack
			});
			
			_widget.alive(_dom);

		//library
			_widget.reset = function reset(viewStore, index){
			        _store = viewStore;
			        current = index;
			        _stack.getStack().get("#library-ideadetail").reset(viewStore, index);
			        _stack.getStack().show("#library-ideadetail");
			};
			
			_widget.action = function action(name){
                                switch(name){
                                        
                                        case "#library-edit":
                                                _stack.getStack().get("#library-edit").reset(_store.get(current).id);
                                                _stack.getStack().show('#library-edit');
                                             break;
                                        
                                        case "#library-favorites":
                                             break;
                                             
                                        case "#library-share":
                                                _stack.getStack().get("#library-share").reset(_store.get(current).doc);
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
			        _stack.getStack().get("#library-edit").reset(id);
			        _stack.getStack().show("#library-edit");     
			};
			
			_widget.sendMail = function sendMail(idea){
			         _stack.getStack().get("#library-sendmail").reset(idea);
                                 _stack.getStack().show("#library-sendmail");        
			};
			
			_widget.share = function share(idea){
			         _stack.getStack().get("#library-share").reset(idea);
                                 _stack.getStack().show("#library-share");        
                        };
			
			// init
			_stack.getStack().add("#library-ideadetail", new IdeaDetail(_widget.action));
                        _stack.getStack().add("#library-edit", new Edit(_widget.action));
                        _stack.getStack().add("#library-sendmail", new Sendmail(_widget.action));
                        _stack.getStack().add("#library-share", new Share(_widget.action));
                        
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
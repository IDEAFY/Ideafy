/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "./detail-stack/public-idea", "./detail-stack/public-edit", "./detail-stack/public-sendmail", "./detail-stack/public-share", "service/config", "Store"], 
	function(Widget, Map, Stack, IdeaDetail, Edit, Sendmail, Share, Config, Store){
		return function IdeaStackConstructor(){
		//declaration
			var  _widget = new Widget(),
		             _stack = new Stack(),
		             _dom = Map.get("public-detail"),
		             _observer = Config.get("observer"),
		             _store = new Store(),
		             current = 0;

		//setup
		        
			
			_widget.plugins.addAll({
			        "detailstack" : _stack
			});
			
			_widget.alive(_dom);

		//detail
			_widget.reset = function reset(viewStore, index){
			        _store = viewStore;
			        current = index;
			        _stack.getStack().get("#public-ideadetail").reset(viewStore, index);
			        _stack.getStack().show("#public-ideadetail");
			};
			
			_widget.action = function action(name){
                                switch(name){
                                        
                                        case "#public-edit":
                                                _stack.getStack().get("#public-edit").reset(_store.get(current).id);
                                                _stack.getStack().show('#public-edit');
                                             break;
                                        
                                        case "#public-favorites":
                                             break;
                                             
                                        case "#public-share":
                                                _stack.getStack().get("#public-share").reset(_store.get(current).doc);
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
			        _stack.getStack().get("#public-edit").reset(id);
			        _stack.getStack().show("#public-edit");     
			};
			
			_widget.sendMail = function sendMail(idea){
			         _stack.getStack().get("#public-sendmail").reset(idea);
                                 _stack.getStack().show("#public-sendmail");        
			};
			
			_widget.share = function share(idea){
			_stack.getStack().get("#public-share").reset(idea);
                                 _stack.getStack().show("#public-share");         
			};
			
			// init
			_stack.getStack().add("#public-ideadetail", new IdeaDetail(_widget.action));
                        _stack.getStack().add("#public-edit", new Edit(_widget.action));
                        _stack.getStack().add("#public-sendmail", new Sendmail(_widget.action));
                        _stack.getStack().add("#public-share", new Share(_widget.action));
                        
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
			
			
                        PDS = _stack;
		//return
			return _widget;
		};
	});
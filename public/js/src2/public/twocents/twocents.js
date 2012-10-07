define("Ideafy/TwoCents", 
	["Olives/OObject", "Map", "Config", "CouchDBStore", "Olives/Model-plugin"], 
	function(Widget, Map, Config, Store, Model){
		return function TwoCentsConstructor(){

		//declararation
			var _widget = new Widget(),
				_store = new Store();

		//setup
			_store.setTransport(Config.get("transport"));
			//see text plugin
			/*_widget.template = "<ul class='twocents-list' data-publictwocents='foreach'>" +
									"<li class='twocent-item'>" +
										"<div class='twocent-header'>"+
											"<div class='twocentAvatar' data-publictwocents='bind: setAvatar, author'></div>" +
											"<div class='twocentAuthor' data-publictwocents='bind: setFirstName, firstname'>Olivier</div>" +
											"<span class='commentLabel' data-labels='bind: innerHTML, twocentcommentlbl'></span>"+
											"<br/>" +
											"<div class='twocentDate date' data-publictwocents='bind: date, date'></div>"+
											"<div class='twocentMenu'>" +
												"<div class='twocentButton twocentEditButton' data-publictwocents='bind: setVisible, author' data-twocentevent='listen: click, edit'></div>" +
												"<div class='twocentButton twocentDeleteButton' data-publictwocents='bind: setVisible, author; bind: deleteOK, replies' data-twocentevent='listen: click, deleteTwocent'></div>" +
												"<div class='twocentButton twocentReplyButton' data-publictwocents='bind: setInVisible, author'></div>"+
											"</div>" +
										"</div>" +
										"<p class = 'twocentMessage' data-publictwocents='bind: innerHTML, message'>Well I believe this is a really really cool idea</p>" +
										"<div class'displayReplies' data-publictwocents='bind: displayReplies, replies'>" +
											"<div class='twocentreplylist'></div>" +
										"</div>" +
									"</li>"+
								"</ul>";*/
			_widget.template = "<ul class='twocents-list' data-publictwocents='foreach'>" +
									"<li class='twocent-item'>" +
										"<div class='twocent-header'>"+
											"<div class='twocentAvatar'></div>" +
											"<div class='twocentAuthor'>Olivier</div>" +
											"<span class='commentLabel'></span>"+
											"<br/>" +
											"<div class='twocentDate date'></div>"+
											"<div class='twocentMenu'>" +
												"<div class='twocentButton twocentEditButton'></div>" +
												"<div class='twocentButton twocentDeleteButton'></div>" +
												"<div class='twocentButton twocentReplyButton'></div>"+
											"</div>" +
										"</div>" +
										"<p class='twocentMessage'>Well I believe this is a really really cool idea</p>" +
										"<div class'displayReplies'>" +
											"<div class='twocentreplylist'></div>" +
										"</div>" +
									"</li>"+
								"</ul>";				

			_widget.plugins.addAll({
				"publictwocents" : new Model(_store)
			});
	        
	      //public
	      	_widget.reset = function(id){
	      		//unsync
	      		_store.unsync();
	      		//_store.reset();
	      		//sync
	      		_store.sync("ideafy", id).then(function(){
	      			console.log(_store.toJSON());
	      		});
	      	};

		//return
			return _widget;
		};
});
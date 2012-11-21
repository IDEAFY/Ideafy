//may be change the module id to have something nicer
define("Ideafy/Public/Idea-detail", 
	["Olives/OObject", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Map", "Ideafy/Utils",
	 "Ideafy/TwoCents", "Amy/Stack-plugin", "Ideafy/Public/Edit", "Ideafy/Public/Sendmail", "Ideafy/Avatar", "Config", "WriteTwocent", "TwocentList", "Observable"], 
	function(Widget, Store, Model, Event, Map, Utils, TwoCents, Stack, Edit, Sendmail, Avatar, Config, WriteTwocent, TwocentList, Observable){
		return function IdeaDetailConstructor(){
		//declaration
			var  _widget = new Widget(),
			     _twocentWriteUI = new WriteTwocent(),
			     _labels = Config.get("labels"),
			     vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
			     _voted = false,
			     user = Config.get("user"),
                             transport = Config.get("transport"),
		             _twocents = new TwoCents(),
		             _store = new Store(),
		             _stack = new Stack(),
		             _dom = Map.get("public-detail"),
		             _domWrite = Map.get("public-writetwocents"),
		             _obs = new Observable(),
		             _edit = new Edit(_obs),
		             _sendMail = new Sendmail(_obs);

		//setup
		         // DUMMY to fix stack hide problem
		         var dummy = new Widget();
		         dummy.template='<div></div>';
		              
			_stack.getStack().add("#public-edit", _edit);
			_stack.getStack().add("#public-sendmail", _sendMail);
			_stack.getStack().add("dummy", dummy);
			
			_obs.watch("hide", function(){
			     _stack.getStack().show("dummy");        
			});
			
			_twocentWriteUI.place(_domWrite);
			_widget.plugins.addAll({
			        "label" : new Model(_labels),
				"publicdetail" : new Model(_store, {
				        // toggle header buttons right
				        toggleRateEdit : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#public-edit") : this.setAttribute("href", "#public-favorites");       
                                        },
                                        // toggle header buttons left
                                        toggleTwocentShare : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#public-share") : this.setAttribute("href", "#public-2cents");       
                                        },
                                        // display twocents writing interface if applicable
                                        displayWriteTwocent : function(authors){
                                            (authors.indexOf(user.get("_id"))<0) ? this.classList.remove("invisible") : this.classList.add("invisible");    
                                        },
                                        // display twocentlist if present
                                        displayTwocentList : function(twocents){
                                                 var twocentUI, _frag = document.createDocumentFragment();
                                                 if (twocents && twocents.length){
                                                    // hide twocent write interface    
                                                    document.getElementById("public-writetwocents").classList.add("invisible");
                                                    twocentUI = new TwocentList(_store.get("id"), "public");
                                                    twocentUI.render();
                                                    twocentUI.place(_frag);
                                                    (this.hasChildNodes()) ? this.replaceChild(_frag, this.firstChild): this.appendChild(_frag);   
                                                }
                                                else {
                                                    // remove child if present
                                                    if (this.hasChildNodes()){
                                                            this.removeChild(this.firstChild);
                                                    }       
                                                }        
                                        },
					date : function date(date){
						this.innerHTML = Utils.formatDate(date);
					},
					setAuthor : function(authornames){
                                                if (authornames === user.get("username") && _store.get("doc").authors.indexOf(user.get("_id"))>-1){
                                                        this.innerHTML = Config.get("labels").get("youlbl");
                                                }
                                                else {
                                                        this.innerHTML = authornames;
                                                }
                                        },
					setAvatar : function setAvatar(authors){
					        var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar(authors);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
					},
					setRating : function setRating(rating) {
                                                this.innerHTML = rating;
                                                // this is necessary because the rating data is not supplied by the lucene design do --> to be investigated
                                                if (rating === undefined) {
                                                        var _id = this.getAttribute("data-listideas_id"),
                                                            _arr = _store.get(_id).doc.votes;
                                                        if (_arr.length === 0) this.innerHTML = ""
                                                        else {
                                                                this.innerHTML = Math.round(_arr.reduce(function(x,y){return x+y;})/_arr.length*100)/100;
                                                        }
                                                }
                                        },
                                        // display a vote button or the number of votes on an idea
					toggleVoteButton : function(votes){
                                                var idea = _store.get("id"),
                                                    authors = _store.get("doc").authors;   
                                                // check if user has already voted on this idea or if user is author
                                                if (user.get("rated_ideas").indexOf(idea)<0 && authors.indexOf(user.get("_id"))<0 && !_voted)
                                                {
                                                        this.setAttribute("name", "vote");
                                                        this.innerHTML = _labels.get("votebuttonlbl");
                                                        this.classList.remove("votes");
                                                        this.classList.add("publicButton");
                                                }
                                                else{
                                                        _voted = true;
                                                        this.classList.remove("publicButton");
                                                        this.setAttribute("name", "voted");
                                                        if (votes === 0){
                                                                this.innerHTML = "("+_labels.get("novotesyet")+")";
                                                        }
                                                        else if (votes === 1){
                                                                this.innerHTML = "("+ _labels.get("onevote")+")";
                                                        }
                                                        else{
                                                                this.innerHTML = "("+votes.length + " "+_labels.get("votes")+")";
                                                        }
                                                        this.classList.add("votes");
                                                }               
                                        }
				}),
				"vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background: url('../img/public/activeIdeaVote.png') no-repeat center center;",
                                                    styleInactive = "background: url('../img/public/rateForList.png') no-repeat center center;";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
				"publicdetailevent" : new Event(_widget),
				"detailstack" : _stack
			});
			_widget.alive(_dom);
			//_twocents.place(Map.get("public-twocents"));

		//public
			_widget.reset = function reset(viewStore, index){
			        // when clicking on a new idea -- reset _voted param to false, idea store and pass idea's id to twocents
			        _voted = false;
				_store.reset(viewStore.get(index));
				_twocentWriteUI.reset(_store.get("id"));
				//_twocents.reset(model._id);
				
				// watch viewStore for changes regarding this idea and update model accordingly
                                viewStore.watch("updated", function(idx, value){
                                        if (idx === parseInt(index)){
                                            _store.reset(value);        
                                        }
                                });
			};
			
			_widget.action = function(event, node){
                                var name = node.getAttribute("href");
                                switch(name){
                                        
                                        case "#public-2cents":
                                             _twocentWriteUI.reset(_store.get("id"));
                                             document.getElementById("public-writetwocents").classList.remove("invisible");
                                             break;
                                        
                                        case "#public-edit":
                                                _edit.reset(_store.get("id"));
                                                _stack.getStack().show('#public-edit');
                                             break;
                                        
                                        case "#public-favorites":
                                             break;
                                             
                                        case "#public-share":
                                                _stack.getStack().show("#public-sendmail");
                                             break;
                                }       
                        };
			
			_widget.edit = function(){
			     _stack.getStack().show("#public-edit");     
			};
			
			_widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
			
			_widget.vote = function(event, node){
                                if (!_voted){
                                        //display voting popup
                                        document.getElementById("ratingPopup").classList.add("appear");
                                }
                                node.classList.remove("pressed");
                        };
                        
                        _widget.previewVote = function(event, node){
                             var i=0, idx = node.getAttribute("data-vote_id");
                             vote.loop(function(v,i){
                                     (i<=idx) ? vote.update(i, "active", true):vote.update(i, "active",false);        
                             });            
                        };
                        
                        _widget.castVote = function(event, node){
                                var grade = parseInt(node.getAttribute("data-vote_id"))+1,
                                    id = _store.get("id"),
                                    json = {id : id, vote: grade, voter: user.get("_id")};
                                
                                // prevent multiple votes on the same idea -- if request fails or before database is updated 
                                if (!_voted){
                                        _voted = true;
                                        transport.request("Vote", json, function(result){
                                                if (result!="ok"){
                                                        console.log(result, "something went wrong, please try again later");
                                                        _voted = false;
                                                }
                                                else {
                                                        alert(Config.get("labels").get("thankyou"));
                                                        
                                                        //cleanup 1- remove popup 2- hide vote button 3- reset vote store
                                                        document.getElementById("ratingPopup").classList.remove("appear");
                                                        _node = _dom.querySelector("publicButton");;
                                                        vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                                }
                                        });
                                }
                        };

		//return
			return _widget;
		};
	}
);
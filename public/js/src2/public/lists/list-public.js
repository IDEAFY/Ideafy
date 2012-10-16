define("Ideafy/Public/List", ["Olives/OObject", "CouchDBStore", "Config", "Olives/Model-plugin", "Ideafy/Utils", "Ideafy/Avatar"], function(Widget, Store, Config, Model, Utils, Avatar) {
        function ListPublicConstructor($db, $design, $view, $query) {
                var _store = new Store([]),
                    _options = {
                        db : $db,
                        view : $view,
                        design : $design,
                        query : {
                                descending : true,
                                include_docs : true,
                                limit : 30
                        }
                };

                //setup
                _store.setTransport(Config.get("transport"));
                this.template = "<ul class='ideas-list' data-listideas='foreach'>" + "<li class='list-item'>" + "<div class='item-header'>" + "<div class='avatar' data-listideas='bind:setAvatar,doc.authors'></div>" + "<h2 data-listideas='bind:innerHTML,doc.authornames'></h2>" + "<span class='date' data-listideas='bind:date,doc.creation_date'></span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,doc.title'>Idea title</h3>" + "<p data-listideas='bind:innerHTML,doc.description'></p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span class='rating' data-listideas='bind:setRating, value.rating'></span>" + " </div>" + "</li>" + "</ul>";

                this.plugins.add(
                        "listideas", new Model(_store, {
                                date : function date(date) {
                                        this.innerHTML = Utils.formatDate(date);
                                },
                                setRating : function setRating(rating) {
                                        this.innerHTML = rating;
                                        if (rating === undefined) {
                                                var _id = this.getAttribute("data-listideas_id"),
                                                    _arr = _store.get(_id).doc.votes;
                                                if (_arr.length === 0) {this.innerHTML = ""}
                                                else {
                                                        this.innerHTML = Math.round(_arr.reduce(function(x,y){return x+y;})/_arr.length*100)/100;
                                                }
                                                
                                        }
                                },
                                setAvatar : function setAvatar(authors){
                                        var _ui, _frag;
                                        _frag = document.createDocumentFragment();
                                        _ui = new Avatar(authors);
                                        _ui.place(_frag);
                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                }
                        ));

                this.getModel = function() {
                        return _store;
                };
                this.resetQuery = function(query) {
                        _options.query = query;

                        _store.unsync();
                        _store.reset([]);
                        _store.sync(_options.db, _options.design, _options.view, _options.query);
                };

                // set default query parameters
                if ($query) {
                        _options.query = $query;
                }
                
                
                this.init = function init(initCallback){
                        _store.sync(_options.db, _options.design, _options.view, _options.query).then(function(){
                                initCallback(_store, 0);      
                        });        
                };

        }

        return function ListPublicFactory($db, $design, $view, $query) {
                ListPublicConstructor.prototype = new Widget();
                return new ListPublicConstructor($db, $design, $view, $query);
        };
}); 
define("Ideafy/Public/List", ["Olives/OObject", "CouchDBStore", "Config", "Olives/Model-plugin", "Ideafy/Utils"], function(Widget, Store, Config, Model, Utils) {
        function ListPublicConstructor($db, $design, $view, $query) {
                var _store = new Store([]), _options = {
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
                this.template = "<ul class='ideas-list' data-listideas='foreach'>" + "<li class='list-item'>" + "<div class='item-header'>" + "<div class='avatar'></div>" + "<h2 data-listideas='bind:innerHTML,doc.authornames'>Taiaut</h2>" + "<span class='date' data-listideas='bind:date,doc.creation_date'>jj/mm/aa</span>" + "</div>" + "<div class='item-body'>" + "<h3 data-listideas='bind:innerHTML,doc.title'>Idea title</h3>" + "<p data-listideas='bind:innerHTML,doc.description'>This is an idea description</p>" + "</div>" + "<div class='item-footer'>" + "<a class='idea-type'></a>" + "<a class='item-acorn'></a>" + "<span></span>" + " </div>" + "</li>" + "</ul>";

                this.plugins.add("listideas", new Model(_store, {
                        date : function date(date) {
                                this.innerHTML = Utils.formatDate(date);
                        },

                        rating : function rating(rating) {
                                this.innerHTMl = Utils.setRating(this, rating);
                        }
                }));

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
                _store.sync(_options.db, _options.design, _options.view, _options.query);

        }

        return function ListPublicFactory($db, $design, $view, $query) {
                ListPublicConstructor.prototype = new Widget();
                return new ListPublicConstructor($db, $design, $view, $query);
        };
}); 
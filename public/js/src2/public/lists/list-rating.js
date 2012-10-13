define("Ideafy/Public/ListRating", ["Olives/OObject", "CouchDBStore", "Config", "Olives/Model-plugin"], 
	function(Widget, Store, Config, Model){
		return function ListRatingConstructor(){
			var _widget = new Widget(),
			     _db = Config.get("db"),
				_store = new Store([]);

			//setup
			_store.setTransport(Config.get("transport"));
			_widget.template = "<ul>" +
									"<li>" +
									"<div class='item-header'>" +
                  						"<div class='avatar'></div>" + 
                  						"<h2 data-listideas='bind:innerHTML,value.doc.authornames'>Taiaut</h2>" + 
                  						"<span class='date' data-listideas='bind:date,value.doc.creation_date'>jj/mm/aa</span>" +
                					"</div>" + 
                					"<div class='item-body'>" + 
                  						"<h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3>" + 
                  						"<p data-listideas='bind:innerHTML,value.doc.description'>This is an idea description</p>" +
                					"</div>" + 
                					"<div class='item-footer'>" +
                  						"<a class='idea-type'></a>" + 
                  						"<a class='item-acorn'></a>" +
                  						"<span></span>" + 
               						" </div>" +
									"</li>"+
								"</ul>";



			_widget.plugins.add("listideas", new Model(_store));
			_store.sync(_db, "ideas", "_view/ideasbyvotes", {
				descending : true,
				limit : 30
			});

			return _widget;
		};
	}
);
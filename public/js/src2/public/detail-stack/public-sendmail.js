define("Ideafy/Public/Sendmail", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function PublicSendmailConstructor(){
		//declaration
			var _widget = new Widget();
		//setup
			_widget.alive(Map.get("public-sendmail"));

		//return
			return _widget;
		};
	}
);
define("Ideafy/Login", ["Olives/OObject" ,"Amy/Stack-plugin", 
	"Map", "Amy/Delegate-plugin", "Config", "Olives/Model-plugin"],
	function(Widget, Stack, Map, Event, Config, Model){
		return function LoginConstructor(){
		//declaration
			var _login = new Widget(),
				_loginForm = new Widget(),
				_signupForm = new Widget(),
				_loading = new Widget(),
				_stack = new Stack();
		//setup
			_loginForm.alive(Map.get("login-form"));
			_signupForm.alive(Map.get("signup-form"));
			_loading.alive(Map.get("loading"));

			
			_stack.getStack().setCurrentScreen(_loginForm);

			_login.plugins.addAll({
				"loginstack" : _stack,
				"label": new Model(Config.get("labels")),
				"loginevent" : new Event(this)
			});
			_login.alive(Map.get("login"));
			_stack.getStack().add("#login-screen", _loginForm);
			_stack.getStack().add("#signup-screen", _signupForm);
			_stack.getStack().add("#loading-screen", _loading);

		//logic
			_login.setScreen = function(name){
				_stack.getStack().show(name);
			};
		//return
		return _login;
		};
	}
);
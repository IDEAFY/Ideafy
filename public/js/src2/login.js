define("Ideafy/Login", ["Olives/OObject" ,"Amy/Stack-plugin", 
	"Map", "Amy/Delegate-plugin", "Config"],
	function(Widget, Stack, Map, Event, Config){
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

			/*this.resetError = function(){
				_store.set("error", "");
			};*/

			/*this.signup = function(){
				_login.setScreen("#signup-screen");
			};*/

			this.login = function(){
				/*var email = _store.get("email").toLowerCase(),
					password = _store.get("password"),
					transport = Config.get("transport");

					if(email && password){
						transport.request("Login", {name: email, password: password}, function (result) {
							if (result.login === "ok"){
								Config.set("uid", '"'+ email +'"');

								appData.set("currentLogin", email);
								appData.sync("ideafy_appData");

                                 //hide login screen
                                dom.classList.add("invisible");
                                Config.get("observer").notify("login-completed");
                            }else {
                            	_store.set("error", "Invalid user name or password");
                            }     
                       	});
					};
*/

			};


		//return
		return _login;
		};
	}
);
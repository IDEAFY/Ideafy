/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject" ,"Amy/Stack-plugin", 
	"service/map", "Amy/Delegate-plugin", "service/config", "Olives/Model-plugin"],
	function(Widget, Stack, Map, Event, Config, Model){
		return function LoginConstructor(){
		//declaration
			var _login = new Widget(),
				_loginForm = new Widget(),
				_signupForm = new Widget(),
				_loading = new Widget(),
				_serverdown = new Widget(),
				_internetdown = new Widget(),
				_stack = new Stack();
		//setup
			_loginForm.alive(Map.get("login-form"));
			_signupForm.alive(Map.get("signup-form"));
			_loading.alive(Map.get("loading"));
			_serverdown.alive(Map.get("serverdown"));
			_internetdown.alive(Map.get("nointernet"));

			_login.plugins.addAll({
				"loginstack" : _stack,
				"label": new Model(Config.get("labels")),
				"loginevent" : new Event(this)
			});
			
			_login.alive(Map.get("login"));
			_stack.getStack().add("#login-screen", _loginForm);
			_stack.getStack().add("#signup-screen", _signupForm);
			_stack.getStack().add("#loading-screen", _loading);
			_stack.getStack().add("#maintenance-screen", _serverdown);
			_stack.getStack().add("#nointernet", _internetdown);
			
                        _stack.getStack().setCurrentScreen(_loginForm);

		//logic
			_login.setScreen = function(name){
			        _stack.getStack().show(name);
			};
		//return
		return _login;
		};
	}
);
/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject" ,"Amy/Stack-plugin", 
	"service/map", "Amy/Delegate-plugin", "service/config", "Bind.plugin", "lib/spin.min"],
	function(Widget, Stack, Map, Event, Config, Model, Spinner){
		return function LoginConstructor(){
		//declaration
			var _login = new Widget(),
				_loginForm = new Widget(),
				_signupForm = new Widget(),
				_loading = new Widget(),
				_serverdown = new Widget(),
				_internetdown = new Widget(),
				_stack = new Stack(),
				spinner;
		//setup
		
		         _login.plugins.addAll({
                                "loginstack" : _stack,
                                "label": new Model(Config.get("labels")),
                                "loginevent" : new Event(this)
                        });
                        
                        _loading.plugins.add("label", new Model(Config.get("labels")));
		         
		        _loading.template = '<div id="loading"><p data-label="bind: innerHTML, loadingmessage"></p><div id="loadingspin"></div></div>';
			_loginForm.alive(Map.get("login-form"));
			_signupForm.alive(Map.get("signup-form"));
			//_loading.place(Map.get("loading"));
			_serverdown.alive(Map.get("serverdown"));
			_internetdown.alive(Map.get("nointernet"));

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
			        if (name === "#loading-screen"){
			                spinner = new Spinner({color:"#9AC9CD", lines:10, length: 20, width: 8, radius:15}).spin(document.getElementById("loadingspin"));
			        }
			        else{
			                spinner.stop();
			        }
			};
		//return
		return _login;
		};
	}
);
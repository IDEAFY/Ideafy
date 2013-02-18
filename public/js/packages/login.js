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
				_stack = new Stack();
		//setup
			_loginForm.alive(Map.get("login-form"));
			_signupForm.alive(Map.get("signup-form"));
			_loading.alive(Map.get("loading"));
			_serverdown.alive(Map.get("serverdown"));

			_login.plugins.addAll({
				"loginstack" : _stack,
				"label": new Model(Config.get("labels")),
				"loginevent" : new Event(this)
			});
			
			_login.template = '<div id="login-stack" data-loginstack="destination"><form id="login-form" data-event="selector:input,keypress,resetError;selector:.login-button,touchend,login"><p class="login-fields"><input data-loginmodel="bind:value,email" autofocus="autofocus" data-label="bind:placeholder, emailplaceholder" type="text"><input data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-event="listen:keypress, enterlogin"></p><p><label class="login-button pressed-btn" data-label="bind: innerHTML, loginbutton"></label></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><!-- may be set a instead label --><p><label id="signup-button" class="pressed-btn" name="#signup-screen" data-label="bind: innerHTML, newuserbutton" data-loginstack="show:touchstart,name"></label></p></form><form id="signup-form" data-event="selector:input,keypress,resetError;selector:#signup,touchend,signup"><p class="login-fields"><input data-loginmodel="bind:value,email" data-label="bind:placeholder, emailplaceholder" type="text"><input data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder"><input data-loginmodel="bind:value,confirm-password" type="password" data-label="bind:placeholder, repeatpasswordplaceholder"><input data-loginmodel="bind:value,firstname" type="text" data-label="bind:placeholder, firstnameplaceholder"><input data-loginmodel="bind:value,lastname" type="text" data-label="bind:placeholder, lastnameplaceholder" data-event="listen:keypress, entersignup"></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><p><label id="signup" class="login-button pressed-btn" data-label="bind:innerHTML, signupbutton"></label></p><p><label class="login-button pressed-btn" name="#login-screen" data-loginstack="show:touchstart,name" data-label="bind:innerHTML, loginbutton"></label></p></form><div id="loading" data-label="bind: innerHTML, loadingmessage">Loading...</div><div id="serverdown" data-label="bind: innerHTML, maintenancemessage">Server down for maintenance</div></div>';
			
			_login.place(Map.get("login"));
			_stack.getStack().add("#login-screen", _loginForm);
			_stack.getStack().add("#signup-screen", _signupForm);
			_stack.getStack().add("#loading-screen", _loading);
			_stack.getStack().add("#maintenance-screen", _serverdown);
			
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
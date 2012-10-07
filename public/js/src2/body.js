require(["Olives/OObject", "Olives/LocalStore" ,"Store", "Map", 
	"Amy/Stack-plugin", "Olives/Model-plugin", "Amy/Delegate-plugin",
	"Ideafy/Dock", "Ideafy/Login", "Config",  "CouchDBStore", "Ideafy/Utils"], 
	function(Widget, LocalStore, Store, Map, Stack, Model, Event, Dock, Login, Config, CouchDBStore, Utils){

		//declaration
		var _body = new Widget(),
		_login = null,
		_stack = new Stack({
			"#login" : _login
		}),
		_dock = new Dock(),
		_local = new LocalStore(),
		_store = new Store({
			"email" : "",
			"firstname" : "",
			"lastname" : "",
			"confirm-password" : "",
			"password" : "",
			"error" : ""
		}),
		_transport = Config.get("transport"),
		_user = Config.get("user");


	//setup
		_body.plugins.addAll({
			"event" : new Event(_body),
			"loginmodel" : new Model(_store),
			"stack" : _stack
		});
		_body.alive(Map.get("body"));
		_login = new Login();
		_stack.getStack().setCurrentScreen(_login);
		_local.sync("ideafy-data");

		var current = _local.get("currentLogin");
		if(!current){
		//display login
		_login.setScreen("#signup-screen");
	}else{
		//_login.setScreen("#signup-screen");
		_login.setScreen("#loading-screen");
		_transport.request("CheckLogin",{"id" : current},function(result){
			(result.authenticated) ? _body.init() : _login.setScreen("#login-screen");
		});
	}

	_stack.getStack().add("#dock", _dock);


//logic

_body.login = function(){
	var email = _store.get("email").toLowerCase(),
	password = _store.get("password");

	if(email && password){
		_transport.request("Login", {name: email, password: password}, function (result) {
			if (result.login === "ok"){
				Config.set("uid", '"'+ email +'"');
				_local.set("currentLogin", email);
				_local.sync("ideafy-data");

				_body.init();
			}else {
				_store.set("error", "Invalid user name or password");
			}     
		});
	}
};

_body.signup = function(){
	var email = _store.get("email"),
		password = _store.get("password"),
		pwdConfirm = _store.get("confirm-password"),
		fn = _store.get("firstname"),
		ln = _store.get("lastname"),
		user = new CouchDBStore();

	if (email === ""){
		_store.set("error", "Please enter your email and address in the field above");        
	}
	else if (password === ""){
		_store.set("error", "A password is required");
	}
	else if (pwdConfirm === ""){
		_store.set("error", "Please confirm the password");
	}
	else if (fn === ""){
		_store.set("error", "Please enter your first name");
	}
	else if (ln === ""){
		_store.set("error", "Please enter your last name");
	}
	else {

    	// check if email address is valid -- in the future an activation mechanism should be envisioned to screen fake addresses
    	var userid = email.toLowerCase(),
    	emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

    	if (!emailPattern.test(userid)){
    		_store.set("error", "Invalid email address");        
    	}else {
        	// check if passwords match
        	if (password !== pwdConfirm){
        		_store.set("error", "Passwords do not match");        
        	}
        	else{
        		_transport.request("Signup", {
        			name: userid,
        			password: password
        		}, function (result) {
        			console.log("transport signup handler:", result);
        			if (result.signup === "ok"){
                            // create user
                            user.reset(Config.get("userTemplate"));
                            user.set("fistname", fn);
                            user.set("lastname", ln);
                            user.set("username", fn+" "+ln);

                            // add welcome notification
                            var now = new Date();
                                                                        
                             user.set("notifications", [{
                                "type": "MSG",
                                "date": [
                                     now.getFullYear(),
                                     now.getMonth(),
                                     now.getDate(),
                                     now.getHours(),
                                     now.getMinutes(),
                                     now.getSeconds()
                                ],
                                "object": "Welcome to Ideafy",
                                "status": "unread",
                                "author": "IDEAFY",
                                "body": "Thank you for trying Ideafy. We hope you'll enjoy it. We designed it so you can manage ideas that matter to you or just play around. But don't keep what you're doing to yourself."
                             }]);

                             // upload to database
                             user.setTransport(_transport);

                             user.sync("ideafy", userid);
                             console.log(user.toJSON());
                             user.upload().then(function(){
                             	console.log(user.toJSON());
                             // alter local
                             	_local.set("currentLogin", userid);
                             	_local.sync("ideafy-data");
                            	 Config.set("uid", '"'+userid+'"');
                                                                               
                            	 _body.init();
                             	user.unsync();
              				});


						}
						else{
							_store.set("error", "error : " + result.message);
							_store.set("email", "");
						}
					}, this);
				}

			}

		}
	};

	_body.resetError = function(){
		_store.set("error", "");
	};

	_body.init = function(){
 		_user.sync("ideafy", _local.get("currentLogin")).then(function(){
 			Utils.getAvatar(user.get("_id"), user.get("picture_file"));       
 		});
 		        
 		test = _user;
		_dock.init();

		//if everything is downloaded
		_stack.getStack().show("#dock");
	};

});
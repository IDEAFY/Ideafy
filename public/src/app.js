require(["Container", "Config", "DBUtils"], function(Container, Config, DBUtils){
	
	// login or signup
        console.log(Config.toJSON());
	if (Config.get("firstStart")){
	        Container("signup");
	}
	else if (Config.get("login").id === ""){
	        Container("login");
	}
	else {
	        var transport =  Config.get("Transport"), json = Config.get("login");
	        transport.request("CheckLogin", json, function(result){
	               (result.authenticated) ? Container("startup") : Container("login");     
	        });
	}
		
	/*
	* Totally private: to run batch operations on the database to change existing documents structure etc.
	*/
		
        // DBUtils();
	 });
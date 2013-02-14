/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Olivier Wietrich <olivier.wietrich@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

/* deps load before main script??*/
require.config({
	baseUrl : "js/packages",
    deps : ["lib/socket.io.min", "lib/CouchDBTools","lib/emily.min",  "lib/Olives", "lib/amy2", "body"],
    paths: {
        lib : "../libs",
        service : "../services",
        public : "public",
        connect : "connect",
        dashboard : "dashboard",
        library : "library",
        brainstorm : "brainstorm",
        twocents : "twocents"
    }
});
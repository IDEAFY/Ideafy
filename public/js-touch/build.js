/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Olivier Wietrich <olivier.wietrich@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

/* deps load before main script??*/
require.config({
	baseUrl : "js/packages",
        paths: {
                lib : "../libs",
                service : "../services",
                public : "public",
                connect : "connect",
                dashboard : "dashboard",
                library : "library",
                brainstorm : "brainstorm",
                twocents : "twocents"
        },
        deps: ["lib/socket.io.min", "lib/couchdbtools","lib/emily",  "lib/olives", "lib/amy2", "lib/spin.min"]
        
});
/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

require.config({
        waitSeconds: 60,
        baseUrl : "js-default/packages",
        paths: {
                lib : "../libs",
                service : "../services",
                public : "public",
                connect : "connect",
                dashboard : "dashboard",
                library : "library",
                brainstorm : "brainstorm",
                twocents : "twocents",
                attachments : "attach"
        },
        deps: ["lib/socket.io.min", "lib/Emily.min",  "lib/Olives.min", "lib/CouchDBTools", "lib/amy2", "lib/spin.min"]
        
});

require(["main"]);
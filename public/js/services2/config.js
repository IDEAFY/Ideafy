define("Config", ["Store", "Olives/Transport", "CouchDBStore"], function(Store, Transport, CouchDBStore){
	var _transport = new Transport(io, location.origin),
		_user = new CouchDBStore();

	_user.setTransport(_transport);
	//change location for device
	return new Store({
		transport : _transport,
		user : _user,
		userTemplate : {
                "lastname": "",
                "firstname": "",
                "address": {"street1": "", "street2": "", "zip code": null, "city": "", "country": ""},
                "gender": 1,
                "lang": "US",
                "birthdate": [],
                "connections": [],
                "taiaut_decks": ["INT"],
                "custom_decks": [],
                "occupation": { "description": "", "details": {"situation": "", "job": "", "organization": ""}},
                "family": {"couple": null, "children": null},
                "leisure_activities": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""} ],
                "interests": [{"name": "", "comment": ""}, {"name": "", "comment": "" }],
                "useascharacter": 0,
                "type": 7,
                "notifications": [],
                "facebook": "",
                "twitter": "",
                "username": "",
                "sessionInProgress": {},
                "organization": "",
                "groups": [],
                "rated": [],
                "rated_ideas": [],
                "favorites": [],
                "ip": 0,
                "picture_file": "img/userpics/deedee0.png",
                "title": null,
                "achievements": [],
                "ideas_count": 0,
                "su_sessions_count": 0,
                "twocents_count": 0,
                "twoquestions_count": 0,
                "tutorial_complete": false,
                "profile_complete": true,
                "news": [],
                "twocents": [],
                "twoquestions": []
        },
        avatars : new Store({}),
        publicAvatars : new Store({})
	});
});
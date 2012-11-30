define("Config", ["Store", "Olives/Transport", "CouchDBStore", "Observable"], function(Store, Transport, CouchDBStore, Observable) {
        var _transport, _user, _observer, _config = new Store();
        
        this.reset = function(){
                _transport = new Transport(io, location.origin);
                _user =  new CouchDBStore();
                _observer = new Observable();
                _user.setTransport(_transport);
                
                _config.reset({
                        transport : _transport,
                        db : "ideafy",
                        user : _user,
                        observer : _observer,
                        userTemplate : {
                                "lastname" : "",
                                "firstname" : "",
                                "address" : {
                                        "street1" : "",
                                        "street2" : "",
                                        "zip code" : null,
                                        "city" : "",
                                        "country" : ""
                                },
                                "gender" : 1,
                                "lang" : "US",
                                "birthdate" : [],
                                "connections" : [],
                                "taiaut_decks" : ["INT"],
                                "custom_decks" : [],
                                "active_deck": ["INT"],
                                "occupation" : {
                                        "description" : "",
                                        "details" : {
                                                "situation" : "",
                                                "job" : "",
                                                "organization" : ""
                                        }
                                },
                                "family" : {
                                        "couple" : null,
                                        "children" : null
                                },
                                "leisure_activities" : [
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : "" }
                                ],
                                "interests" : [
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : ""},
                                        {"name" : "", "comment" : ""}],
                                "useascharacter" : 0,
                                "type" : 7,
                                "notifications" : [],
                                "facebook" : "",
                                "twitter" : "",
                                "gplus" : "",
                                "linkedin" : "",
                                "username" : "",
                                "sessionInProgress" : {},
                                "organization" : "",
                                "groups" : [],
                                "rated" : [],
                                "rated_ideas" : [],
                                "favorites" : [],
                                "ip" : 0,
                                "picture_file" : "img/userpics/deedee0.png",
                                "title" : null,
                                "achievements" : [],
                                "ideas_count" : 0,
                                "su_sessions_count" : 0,
                                "twocents_count" : 0,
                                "twoquestions_count" : 0,
                                "tutorial_complete" : false,
                                "profile_complete" : false,
                                "news" : [],
                                "twocents" : [],
                                "twoquestions" : []
                        },
                        ideaTemplate:{
                                "title": "",
                                "sessionId": "",
                                "sessionReplay": false,
                                "authors": [],
                                "description": "",
                                "solution": "",
                                "creation_date": [],
                                "character": "",
                                "problem": "",
                                "context": "",
                                "techno": [],
                                "type": 6,
                                "sharedwith": [],
                                "modification_date": [],
                                "inspired_by": "",
                                "visibility": "private",
                                "votes": [],
                                "rating": "",
                                "authornames": "",
                                "twocents": []
                        },
                        sessionTemplate : {
                                "title" : "",
                                "description" : "",
                                "initiator" : {
                                        "id" : "",
                                        "username" : "",
                                        "picture_file" : ""
                                },
                                "participants" : [],
                                "date" : [],
                                "startTime" : null,
                                "resumeTime" : null,
                                "duration" : null,
                                "elapsedTime" : 0,
                                "elapsedTimers" : {},
                                "mode" : "",
                                "type" : 8,
                                "deck" : "",
                                "status" : "in progress",
                                "step" : "",
                                "characters" : [],
                                "contexts" : [],
                                "problems" : [],
                                "scenarioWB" : [],
                                "scenario" : [], //{"title" : "", "story" : "", "solution" : ""}
                                "techno" : [[]],
                                "ideaWB" : [],
                                "idea" : [], //{"title" : "", "description" : "", "solution" : "", "visibility" : "private", "id" : "" }
                                "score" : ""
                        },
                        avatars : new Store({}), // to keep frequently used avatars (.e.g connections)
                        avatar : null, // user's avatar
                        defaultLabels : {
                                "language" : "US",
                                "emailplaceholder" : "Email",
                                "passwordplaceholder" : "Password",
                                "repeatpasswordplaceholder" : "Confirm password",
                                "loginbutton" : "Log in",
                                "newuserbutton" : "New user",
                                "invalidlogin" : "Invalid username or password",
                                "missingloginparam" : "Please enter both username and password or register",
                                "signupmissingemail" : "Please enter your email address in the field above",
                                "signupmissingpwd" : "A password is required",
                                "signupmissingpwdok" : "Please confirm your password",
                                "signupmissingfn" : "Please enter your first name",
                                "signupmisingln" : "Please enter your last name",
                                "signupinvalidemail" : "Invalid email address",
                                "signuppwdnomatch" : "Passwords do not match",
                                "signupwelcomeobject" : "Welcome to Ideady",
                                "signupwelcomebody" : "Thank you for trying Ideafy. We hope you'll enjoy it. We designed it so you can manage ideas that matter to you or just play around. But don't keep what you're doing to yourself.",
                                "signupbutton" : "Sign up",
                                "firstnameplaceholder" : "First name",
                                "lastnameplaceholder" : "Last name",
                                "publicideasheadertitle" : "Public Ideas",
                                "searchplaceholder" : "Search ideas...",
                                "ideadetailsheadertitle" : "Idea Overview",
                                "votebuttonlbl" : "Vote",
                                "twocentcommentlbl" : "commented:",
                                "twocentreplycommentlbl" : "replied:",
                                "addtwocentplaceholder" : "Add your two cents",
                                "addtwocentreplyplaceholder" : "Respond to this comment",
                                "twocentcreationdate" : "Creation date: ",
                                "twocentmodificationdate" : "Last modified: ",
                                "cancellbl" : "Cancel",
                                "publishlbl" : "Publish",
                                "somethingwrong" : "Something went wrong, please try again"
                        },
                        labels : new Store({})        
                        });
                };
        
        // init
        this.reset();
        
        return _config;
});

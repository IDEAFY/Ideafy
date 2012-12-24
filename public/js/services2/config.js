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
                                        "state" :"",
                                        "country" : ""
                                },
                                "gender" : 1,
                                "lang" : "en-us",
                                "birthdate" : [],
                                "connections" : [],
                                "taiaut_decks" : ["INT"],
                                "custom_decks" : [],
                                "active_deck": "INT",
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
                                "type" : 7,
                                "notifications" : [],
                                "facebook" : "",
                                "twitter" : "",
                                "gplus" : "",
                                "linkedin" : "",
                                "username" : "",
                                "sessionInProgress" : {},
                                "organization" : "",
                                "rated" : [],
                                "rated_ideas" : [],
                                "favorites" : [],
                                "ip" : 0,
                                "picture_file" : "img/avatars/deedee0.png",
                                "intro" : "Ideafyer",
                                "title" : null,
                                "achievements" : [],
                                "ideas_count" : 0,
                                "su_sessions_count" : 0,
                                "mu_sessions_count": 0,
                                "twocents_count" : 0,
                                "twoquestions_count" : 0,
                                "tutorial_complete" : false,
                                "profile_complete" : false,
                                "news" : [],
                                "twocents" : [],
                                "twoquestions" : [],
                                "settings": {"notifyPopup": true, "useascharacter": false}
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
                                "lang": "en-us",
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
                                "lang" : "en-us",
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
                                "language": "US",
                                "emailplaceholder": "Email",
                                "passwordplaceholder": "Password",
                                "repeatpasswordplaceholder": "Confirm password",
                                "loginbutton": "Log in",
                                "newuserbutton": "New user",
                                "invalidlogin": "Invalid username or password",
                                "missingloginparam": "Please enter both username and password or register",
                                "signupmissingemail": "Please enter your email address in the field above",
                                "signupmissingpwd": "A password is required",
                                "signupmissingpwdok": "Please confirm your password",
                                "signupmissingfn": "Please enter your first name",
                                "signupmisingln": "Please enter your last name",
                                "signupinvalidemail": "Invalid email address",
                                "signuppwdnomatch": "Passwords do not match",
                                "signupwelcomeobject": "Welcome to Ideady",
                                "signupwelcomebody": "Thank you for trying Ideafy. We hope you'll enjoy it. We designed it so you can manage ideas that matter to you or just play around. But don't keep what you're doing to yourself.",
                                "signupbutton": "Sign up",
                                "Initialization": "Initializing user data. Please wait ...",
                                "firstnameplaceholder": "First name",
                                "lastnameplaceholder": "Last name",
                                "createidealbl" : "Enter a new idea",
                                "ideatitleplaceholder": "Enter a title for your idea",
                                "ideadescplaceholder": "Enter a description of your idea in non technical terms",
                                "ideasolplaceholder": "Describe how your idea would work, what components, products, services or technologies you would  use",
                                "privatelbl": "Private",
                                "publiclbl": "Public",
                                "ideavisiblelbl": "Your idea is ",
                                "setideavisiblelbl" : "Change status:",
                                "ideafyreplaylbl": "Ideafy Replay is",
                                "ideafysetreplaylbl": "Change Ideafy Replay status: ",
                                "enabledreplaylbl": "Enabled",
                                "disabledreplaylbl": "Disabled",
                                "enablereplaylbl": "Enable",
                                "disablereplaylbl": "Disable",
                                "oklbl": "Ok",
                                "continuelbl": "Continue",
                                "setpublicquestion": "Warning, every Ideafy user will be able to view your idea. This operation is irreversible. Do you want to proceed?",
                                "publicideasheadertitle": "Public Ideas",
                                "searchpublicplaceholder": "Search public ideas...",
                                "ideadetailsheadertitle": "Idea Overview",
                                "idealistheadertitle": "My Ideas",
                                "searchprivateplaceholder": "Search your ideas...",
                                "modifyidealbl": "Modify your idea",
                                "votebuttonlbl": "Vote",
                                "novotesyet": "No vote yet",
                                "onevote": "1 vote",
                                "votes": "votes",
                                "ideawrotelbl": " wrote : ",
                                "twocentcommentlbl": "commented :",
                                "youwrotelbl": "wrote :",
                                "youcommentedlbl": "commented :",
                                "youlbl" : "You",
                                "hidetwocentreplies": "Hide replies",
                                "showonetcreply": "Reply",
                                "showtcrepliesbefore": "",
                                "showtcrepliesafter": " Replies",
                                "twocentreplycommentlbl": "replied :",
                                "yourepliedlbl": "replied :",
                                "addtwocentplaceholder": "Add your two cents",
                                "addtwocentreplyplaceholder" : "Respond to this comment",
                                "twocentcreationdate":"Creation date: ",
                                "twocentmodificationdate": "Last modified: ",
                                "cancellbl": "Cancel",
                                "publishlbl": "Publish",
                                "titlefield" : "Title field",
                                "descriptionfield": "Description field",
                                "solutionfield": "Solution field",
                                "emptyfielderror": " cannot be left empty",
                                "somethingwrong": "Something went wrong, please try again",
                                "thankyou": "Thank you",
                                "loadingmessage": "Application loading, please wait...",
                                "library-ideas": "My Ideas",
                                "library-sessions": "My Ideafy Sessions",
                                "sbytitle": "Session title",
                                "sbydate": "Date",
                                "sbyidea": "Idea title",
                                "sbyscore": "Score",
                                "searchsessions": "Search previous sessions...",
                                "foundlbl": "Found",
                                "matchingsessions": "matching session(s)",
                                "noideayet": "---",
                                "completed": "completed",
                                "inprogress": "in progress",
                                "noscore": "no score yet",
                                "library-decks": "My Ideafy decks",
                                "brainstormheadertitle": "Brainstorm",
                                "brainstormchoosemode": "Choose your Ideafy mode",
                                "continuesession": "Continue last session",
                                "quickbmode" : "Quick mode session",
                                "quickstart" : "Describe your session",
                                "quickstarthelp" : "<h2>Why is this step important?</h2><p>Giving your session a name and other background information will make it easier to retrieve later on from your library. Besides, it's always interesting to keep track of the particular context in which ideas or other contents were generated. If you are setting up a multi-user session, this will provide important context information to invitees and may persuade them to join.</p>",
                                "quickstarttitle" : "Name your session",
                                "quickstarttitleplaceholderpre" : "",
                                "quickstarttitleplaceholderpost" : "'s session",
                                "quickstartdesc": "Enter a description of your session",
                                "quickstartdescplaceholder": "Date, context, purpose, ...",
                                "nextbutton": "Next",
                                "finishbutton": "Ready",
                                "quicksetup": "Set up a situation",
                                "quicksetuphelp": "<h2>Setting the stage</h2><p>This step lets you setup a random situation. Draw and select one card of each of the following categories: character, context, problem. They will be the starting point of your session. You can zoom in on each card to get additional information, select a different one by clicking on the deck icon at the top or accept it (thumbs-up button).</p><p>Which is it going to be ? Will you let fortune decide what situation you are going to deal with or will you work the stacks until you get one you are comfortable with? Ideafy encourages you to pick random situations because they force you to think outside the box.</p><p>Note that when you start a <i>Custom session</i> you can specify one or more of your starting cards to address specific situations.</p>",
                                "credits": "Credits : ",
                                "source": "Source : ",
                                "dyknow": "Did you know ?",
                                "agelbl": " year old",
                                "hobbieslbl": "Leisure activities",
                                "interestslbl": "Centers of interest",
                                "commentslbl": "Comments",
                                "singlelbl": "single",
                                "marriedlbl": "married",
                                "divorcedlbl": "divorced",
                                "widowlbl": "widow",
                                "nochildlbl": "no children",
                                "onechildlbl": " child",
                                "childrenlbl": " children",
                                "siblingslbl": " siblings",
                                "onesiblinglbl": " sibling",
                                "quickscenario": "Write your story",
                                "quickscenariohelp": "<p>This is your <strong>whiteboard.</strong></p><p>Now is the time to show your creativity and imagination. The cards you just picked give you a scope, a set of directions to project your thoughts. Use them as hints but do not feel overly constrained: they are here to help you <strong>write your own story and describe your own use case</strong>.</p><p>Finding the problem to solve is often the most important step of an innovation. So get started and use the tools below to <strong>post any thought, drawing or picture that will help you focus on a story.</strong></p><br><p>When you are done, click on the <strong>ready</strong> button at the bottom to write up your story.</p>",
                                "choosecolorlbl": "Choose a color",
                                "importlbl": "Choose a picture",
                                "pencilsizelbl": "Size",
                                "pencilcolorlbl": "Color",
                                "drawbgcolorlbl": "Background",
                                "cleardrawinglbl": "Clear",
                                "storytitleplaceholder": "Enter the title of your story",
                                "storydescplaceholder": "Tell your story, describe the problem your character is facing",
                                "storysolplaceholder": "How would you plan to fix this problem ?",
                                "quicktech": "Assign technologies",
                                "quicktechhelp":"<h2>Draw technologies</h2><p>The next phase of your session consists in finding a way to implement your solution using state of the art technologies. In this step you will draw three technology cards that you will try to include in your design.</p>",
                                "tech1lbl": "Techno 1",
                                "tech2lbl": "Techno 2",
                                "tech3lbl": "Techno 3",
                                "scenariolbl": "Scenario",
                                "storytitlelbl": "Your Story",
                                "cdtitlelbl": "Title : &nbsp",
                                "scenariodesclbl": "Scenario description",
                                "soldesclbl": "Solution description",
                                "quickidea": "Describe your idea",
                                "quickideahelp": "<p>Welcome back to your <strong>whiteboard.</strong></p><p>Your goal now is to try to apply the technologies that you just picked to design a solution to the use case described in your scenario.</p><p>Again do not feel too constrained: at this stage you can either alter your scenario to accomodate a technology, add additional technologies to the ones you have drawn to complete your solution or skip some of these if they do not fit in your design.</p><p>You are almost done: at the end of this step you will be able to refine your use case and turn it into an <strong>idea</strong>. You will be asked to provide a description in layman terms and also to describe how you would implement it with your chosen technologies.</p><br><p>When you are done, clik on the <strong>ready</strong> button at the bottom to write up your story.</p>",
                                "quickwrapup": "Summary",
                                "quickstepstart": "Session description",
                                "quickstepsetup": "Setup",
                                "quickstepscenario": "Scenario",
                                "quicksteptech": "Technologies",
                                "quickstepidea": "Solution",
                                "quickstepwrapup": "Summary",
                                "congratulations": "Congratulations !",
                                "sessioncompleted": "You successfully completed your Ideafy session",
                                "ideatitlelbl": "Your Idea",
                                "scenarioheader": "Scenario",
                                "scenariosolution": "Solution",
                                "ideadescription": "Idea description",
                                "ideaimplementation": "Technical implementation",
                                "yourtime": "Your time",
                                "yourscore": "Your score",
                                "musession": "Multi-user session",
                                "customsession": "Custom session",
                                "ideafytutorial": "ideafy tutorial",
                                "connect-contacts": "Contacts",
                                "connect-messages": "Messages",
                                "connect-twocent": "Two cents",
                                "dashboard-profile": "My profile",
                                "dashboard-settings": "Settings",
                                "dashboard-about": "About Ideafy"
                        },
                        labels : new Store({})        
                        });
                };
        
        // init
        this.reset();
        
        return _config;
});

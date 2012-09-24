define("Contacts", ["Olives/OObject", "Map", "Config", "Stack", "ContactList", "ContactDetails", "AddContact", "GroupDetails", "ContactShare"] ,
	function(OObject, Map, Config, Stack, ContactList, ContactDetails, AddContact, GroupDetails, ContactShare){
		
		return function ContactsConstructor(cObserver){
			
			var Contacts = new OObject(),
                            contentStack = new Stack(Map.get("contactcontentbox"));
			
			// build stack
			contentStack.addAll({"contactdetails" : ContactDetails(cObserver), "addcontact" : AddContact(cObserver), "groupdetails" : GroupDetails(cObserver), "contactshare" : ContactShare(cObserver)});
			
			// handle events
			cObserver.watch("show-addcontact", function(){
				contentStack.show("addcontact");
			});
			
			cObserver.watch("show-contactdetails", function(){
				contentStack.show("contactdetails");
			});
			
			cObserver.watch("show-groupdetails", function(){
				contentStack.show("groupdetails");
			});
			
			// in case of a share-idea event switch stack to contacts
			Config.get("observer").watch("select-share", function(){
				contentStack.show("contactshare");
			});
			
			// initialize
			ContactList(cObserver);
			
			Contacts.alive(Map.get("connections"));
			
			return Contacts;
			
		};
	})

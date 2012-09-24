define("ContactShare", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "SyncUtils"],
	function(OObject, Map, ModelPlugin, EventPlugin, Config, Store, SyncUtils){
		
		return function ContactShareConstructor(cObserver){
			
			var ContactShare = new OObject();
			var share = new Store({"shareOk": false, "intro": "Select aquaintances or groups you want to share your idea with from the list on your left"});
			var list = new Store([]);
			
			ContactShare.plugins.addAll({
				"share": new ModelPlugin(share,{
					setVisible : function(ok){
						(ok) ? this.classList.remove("invisible") : this.classList.add("invisible");
					}
				}),
				"model": new ModelPlugin(list, {
					formatName : function(name){
						if (name){
						 	this.innerHTML = name.substring(0,1).toUpperCase() + name.substring(1).toLowerCase();
						}
					}
				}),
				"shareevent": new EventPlugin(ContactShare)
			});
			
			var addContact = function (contact){
				
				var add = true,
				    contacts = JSON.parse(list.toJSON());
				// check if contact is already in the list
				for (i=0, l=contacts.length; i<l; i++){
					if (contacts[i].userid ===  contact.userid) {add = false;}
				}
				// check if idea is already shared with this contact
				if (share.get("sharedWith").indexOf(contact.userid) >= 0) {
					add = false;
					alert("You already shared this idea with "+ contact.firstname);
				}
				
				if (add){
					contacts.push(contact);
					list.reset(contacts);
				}
				
				if (list.getNbItems()>0){
				        share.set("shareOk", true);
				}
			};
			
			var addGroupContacts = function (groupId){
				var allGroups = Config.get("user").get("groups").concat();
				var existingContacts = JSON.parse(list.toJSON());
				var newContacts = [];
				
				// retrieve group contacts to be added
				for (i=0, l=allGroups.length; i<l; i++){
					if (allGroups[i].lastname == groupId) newContacts = allGroups[i].contacts.concat();
				};
				
				for (i=0, l= newContacts.length; i<l; i++){
					add = true;
					// check if contact is already in the list
					for (j=0, m=existingContacts.length; j<m; j++){
						if (existingContacts[j].userid ==  newContacts[i].userid) add = false;
					};
					// check if idea has been shared with contact already
					if (share.get("sharedWith").indexOf(newContacts[i].userid) >= 0) {
						add = false;
						alert("You already shared this idea with "+ contact.firstname);
					};
					if (add) existingContacts.push(newContacts[i]);
				};

				list.reset(existingContacts);
				if (list.getNbItems()>0) share.set("shareOk", true);
			};
			
			ContactShare.cancel = function(event, node){
				
				// reset store and go back to library (displayIdea) -- do nothing (abort share)
				Config.get("observer").notify("select-screen", "library");
				list.reset([]);
				share.reset({"shareOk": false, "intro": "elect acquaintances or groups you want to share your idea with from the list on your left"});
				
				// notify connect stack to display default screen
				cObserver.notify("show-allcontacts");
			};
			
			ContactShare.remove = function(event, node){
				var id = node.getAttribute("data-model_id");
				list.del(id);
				if (list.getNbItems() == 0) share.set("shareOk", false);
			};
						
			ContactShare.share = function(event, node){
				
				// notify displayIdea with the list of user ids
				var arr = [];	
				list.loop(function(value, idx){
					arr.push(value.userid);
				});
				Config.get("observer").notify("share-list", share.get("id"), share.get("title"), arr);
				
				// go back to library
				Config.get("observer").notify("select-screen", "library");
				
				// notify connect stack to display default screen
				cObserver.notify("show-allcontacts");
				 
				 // reset stores
				list.reset([]);
				share.reset({"shareOk": false, "intro": "Select acquaintances or groups you want to share your idea with from the list on your left"});
			};
			
			cObserver.watch("contact-selected", function(contact, mode){
				
				// only do something if select mode is on and there is an idea to be shared
				if (mode =="select" && share.get("id")){
					(contact.lastname.substring(0,1) == "#") ? addGroupContacts(contact.lastname) : addContact(contact);
				}
			});
			
			Config.get("observer").watch("select-share", function(id, title, sharedWith){
				
				list.reset([]);
				share.reset({"shareOk": false, "intro": "Select acquaintances or groups you want to share your idea with from the list on your left"});
				
				cObserver.notify("select-mode", "select");
				share.set("id", id);
				share.set("title", title);
				share.set("sharedWith", sharedWith.concat());
			});
			
			ContactShare.alive(Map.get("contactshare"));
			
			return ContactShare;
			
		}
		
	})

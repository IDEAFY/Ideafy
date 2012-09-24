define("GroupDetails", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "SyncUtils"],
	function(OObject, Map, ModelPlugin, EventPlugin, Config, Store, SyncUtils){
		
		return function GroupDetailsConstructor(cObserver){
			
			var GroupDetails = new OObject();
			var group = new Store({"edit": false});
			var list = new Store([]);
			
			GroupDetails.plugins.addAll({
				"group": new ModelPlugin(group,{
					setVisible : function(edit){
						(edit) ? this.classList.remove("invisible") : this.classList.add("invisible");
					},
					setInvisible : function(edit){
						(edit) ? this.classList.add("invisible") : this.classList.remove("invisible");
					},
					setReadOnly : function(edit){
						(edit)? this.removeAttribute("readonly") : this.setAttribute("readonly", "readonly")
					}
				}),
				"model": new ModelPlugin(list, {
					formatName : function(name){
						if (name){
						 	this.innerHTML = name.substring(0,1).toUpperCase() + name.substring(1).toLowerCase();
						}
					}
				}),
				"groupevent": new EventPlugin(GroupDetails)
			});
			
			var addContact = function (contact){
				
				var add = true;
				var contacts = JSON.parse(list.toJSON());
				// check if contact is already in the list
				for (i=0, l=contacts.length; i<l; i++){
					if (contacts[i].userid ==  contact.userid) add = false;
				}
				if (add){
					contacts.push(contact);
					sortContacts(contacts);
					list.reset(contacts);
				};
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
					if (add) existingContacts.push(newContacts[i]);
				};
				
				sortContacts(existingContacts);
				list.reset(existingContacts);
			};
			
			var getGroupDetails = function (groupId){
				var allGroups = Config.get("user").get("groups").concat();
				
				for (i=0, l=allGroups.length; i<l; i++){
					if (allGroups[i].lastname == groupId) {
						sortContacts(allGroups[i].contacts);
						list.reset(allGroups[i].contacts);
						group.set("groupname", allGroups[i].lastname.substring(1));
					};
				};
				
			};
			
			var sortContacts = function(arr){
				arr.sort(function(x,y){
					var _x, _y;
					_x = x.lastname.toLowerCase();
					_y = y.lastname.toLowerCase();
					if (_x<_y) return -1;
					else if (_x>_y) return 1;
					else {
						var _xfn = x.firstname.toLowerCase();
						var _yfn = y.firstname.toLowerCase();
						if (_xfn<_yfn) return -1;
						if (_xfn>_yfn) return 1;
						return 0;
					};
				});
			};
			
			GroupDetails.cancel = function(event, node){
				
				// exit edit mode
				group.set("edit", false);
				getGroupDetails("#"+group.get("groupname"));
				
				// notify contact list that selected contacts should be added
				cObserver.notify("select-mode", "view");
			};
			
			GroupDetails.modify = function(event, node){
				
				group.set("edit", true);
				// notify contact list that selected contacts should be added
				cObserver.notify("select-mode", "add");
			};
			
			GroupDetails.ok = function(event, node){
				
				// exit edit mode
				group.set("edit", false);
				
				// add group to user localstore
				var added = false;
				var allGroups = [];
				if (Config.get("user").get("groups")) allGroups = Config.get("user").get("groups").concat();
				
				// if group exists then replace it else add new group
				for (i=0, l=allGroups.length; i<l; i++){
					if (allGroups[i].lastname == ("#"+group.get("groupname"))) {
						allGroups[i].contacts = JSON.parse(list.toJSON());
						added = true;
					};
				};
				if (!added) {
					var newGroup = {"lastname" : ("#"+group.get("groupname")), "contacts": JSON.parse(list.toJSON())};
					allGroups.push(newGroup);
				}
				Config.get("user").set("groups", allGroups);
				
				// save user doc to couchDB
				SyncUtils.lsDocToCDB(Config.get("user"));
				
				// if new group tell contact list to refresh and select new group
				if (!added) cObserver.notify("new-group", ("#"+group.get("groupname")));
				
				// notify contact list to change select mode
				cObserver.notify("select-mode", "view");
			};
			
			GroupDetails.remove = function(event, node){
				var id = node.getAttribute("data-model_id");
				list.del(id);
			};
			
			cObserver.watch("contact-selected", function(contact, mode){
				
				if (mode =="view" && contact.lastname.substring(0,1) == "#") {
					list.reset([]);
					group.reset({"edit": false});
					getGroupDetails(contact.lastname);
				};
				if (mode == "add") {
					if (contact.lastname.substring(0,1) != "#") addContact(contact);
					else addGroupContacts(contact.lastname);
				};
			});
			
			cObserver.watch("show-groupdetails", function(type){
				if (type == "new") {
					group.reset({"groupname": "", "edit": true});
					list.reset([]);
				};
			});
			
			GroupDetails.alive(Map.get("groupdetails"));
			
			return GroupDetails;
			
		}
		
	})

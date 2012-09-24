define("ContactDetails", ["Olives/OObject", "Map", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Stack", "Store", "SyncUtils", "AppData", "Utils"],
	function(OObject, Map, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin, Stack, Store, SyncUtils, AppData, Utils){
		
		return function ContactDetailsConstructor(cObserver){
			
			var ContactDetails = new OObject(),
			     userCDB = Config.get("user"),
			     details = new Store({}),
			     avatar = new Store({"image": "images/userpics/deedee0.png"}),
			     profileTabs = new Store([
			             {"button": "dashboard", "label": "Dashboard", "isVisible": true},
			             {"button": "whatsnew", "label": "What's new?", "isVisible": true},
			             {"button": "miscinfo", "label": "Misc. Info", "isVisible": true},
			             {"button": "notes", "label": "Notes", "isVisible": true},
			             ]),
			     innerContactStack = new Stack(Map.get("innercontactstack")),
			
			
			ContactDashboard = function(cObserver){
			        
			        var Dashboard = new OObject();
			        
			        Dashboard.alive(Map.get("contactdashboard"));
			        
			        return Dashboard;

			},
			ContactNotes = function(cObserver){
				
				var Notes = new OObject(),
				    notes = new Store({}),
				    idx = -1; // used to keep track of contact position in user connections array
				
				Notes.plugins.addAll({
					"note": new ModelPlugin(notes,{
						isReadonly : function(bool){
							if (bool){
								this.setAttribute("readonly", "readonly");
								document.getElementById("notebuttons") && document.getElementById("notebuttons").classList.add("invisible");
							}
							else {
								this.removeAttribute("readonly");
								document.getElementById("notebuttons") && document.getElementById("notebuttons").classList.remove("invisible");
							};
						}
					}),
					"eventnote": new EventPlugin(Notes)
				});
				
				Notes.cancelNote = function(event, node){
					(userCDB.get("connections")[idx].notes) ? notes.set("notes", userCDB.get("connections")[idx].notes) : notes.set("notes", "");
					notes.set("readonly", true);
				};
				
				Notes.edit = function(event,node){
					notes.set("readonly", false);
				};
				
				Notes.saveNote = function(event, node){
					// change textarea status to readonly
					notes.set("readonly", true);
					// update connection list
					var arr = userCDB.get("connections");
					arr[idx].notes = notes.get("notes");
					userCDB.set("connections", arr);
					// update user localstore
					userCDB.upload();
				};
				
				cObserver.watch("contact-details", function(store){
					notes.reset({"id": store.get("_id"), "notes": "", "readonly" : true});
					for (i=0, l=userCDB.get("connections").length; i<l; i++){
							if (userCDB.get("connections")[i].userid === notes.get("id")) {
							        idx = i;
							}
					}
					if (userCDB.get("connections")[idx].notes) {notes.set("notes", userCDB.get("connections")[idx].notes);}
				});
				
				Notes.alive(Map.get("contactnotes"));
				
				return Notes;
			},
			
			ContactWhatsNew = function(cObserver){
			  
			     var WhatsNew = new OObject();
			     
			     WhatsNew.alive(Map.get("contactwhatsnew"));
			     
			     return WhatsNew;      
			},
			
			MiscInfo = function(cObserver){
				
				var MiscInfo = new OObject();
				var info = new Store({});
				
				MiscInfo.plugins.add("model", new ModelPlugin(info, {
					displayInfo: function(array){
						var res="";
						if (array && array.length>0) {
						        for (i=0, length=array.length; i<length; i++){
							 if (i < length-1) res = res + array[i].name + " (" + array[i].comment + ")<br/>"
							 else res = res + array[i].name + " (" + array[i].comment + ")";
						          }
						  }
						this.innerHTML = res;
					}
				}));
				
				cObserver.watch("contact-details", function(store){
					info.reset({"leisure_activities" : store.get("leisure_activities"), "interests": store.get("interests"), "comments": store.get("comments")});
				});
				
				MiscInfo.alive(Map.get("contactmiscinfo"));
				
				return MiscInfo;
			},
			
			getAvatar = function(id, file){
			        console.log(id, file);
                                if (!Config.get("avatars").get(id)){
                                        Utils.getAvatar(id, file);
                                }
                                avatar.set("image", Config.get("avatars").get(id));
                                // check for avatar changes
                                Config.get("observer").watch("avatar-loaded", function(uid){
                                        if (uid === id){
                                                avatar.set("image", Config.get("avatars").get(uid));
                                        }      
                                });         
			};
			
			getContactDetails = function(id){
				var contactCDB = new CouchDBStore();
				contactCDB.setTransport(Config.get("Transport"));
				contactCDB.sync("taiaut", id).then(function(){
					details.reset(JSON.parse(contactCDB.toJSON()));
					getAvatar(id, details.get("picture_file"));
					// check if profile is filled with misc info, and if yes display button and info, if not hide misc info button
					var misc;
					(contactCDB.get("leisure_activities") || contactCDB.get("interests") || contactCDB.get("comments")) ? misc = true : misc = false;
					if (misc){
						document.getElementById("miscinfobutton") && document.getElementById("miscinfobutton").classList.remove("invisible");
						innerContactStack.show("miscinfo");
					}
					else {
						document.getElementById("miscinfobutton") && document.getElementById("miscinfobutton").classList.add("invisible");
						innerContactStack.show("notes");
					};
					cObserver.notify("contact-details", details);
				});
			};
			
			ContactDetails.plugins.addAll({
                                "model" : new ModelPlugin(details,{
                                        setVisible : function(input){
                                                (input && input != "") ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        formatDate : function(date){
                                                (date) ? this.innerHTML = new Date(date[0], date[1], date[2]).toDateString() : this.innerHTML = "";
                                        },
                                        getLocation : function(address){
                                                this.innerHTML = "";
                                                if (address){
                                                        if (address.city && address.country) this.innerHTML = address.city+", "+address.country;
                                                        else if (address.city) this.innerHTML = address.city;
                                                }
                                        },
                                        setFamilyStatus : function(digit){
                                                if (digit >0) this.innerHTML = AppData.get("family_status")[digit];
                                                else if (digit === 0) this.innerHTML = AppData.get("family_status")[0];
                                                else this.innerHTML = "";
                                        },
                                        showFamily : function(input){
                                                (isNaN(input))? this.classList.add("invisible") : this.classList.remove("invisible");
                                        },
                                        setValue : function(value){
                                                (value || value==0) ? this.innerHTML=value : this.innerHTML="";
                                        }
                                }),
                                "avatar" :  new ModelPlugin(avatar),
                                "profiletabs": new ModelPlugin(profileTabs, {
                                        setVisible: function(isVisible){
                                                (isVisible) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
                                }),
                                "profileevent" : new EventPlugin(ContactDetails),
                                "eventoption" : new EventPlugin(ContactDetails)
                        });
                        
                        ContactDetails.sendmsg = function(event, node){
                                cObserver.notify("message-contact", details.get("_id"), details.get("username"));      
                        };
			
			ContactDetails.switchTab = function(event, node){
			        innerContactStack.show(node.getAttribute("name"));
			};
			
			cObserver.watch("contact-selected", function(contact, mode){
				if (contact.lastname.substring(0,1) != "#" && mode == "view") {
				        // reset avatar
				        avatar.reset({"image": "images/userpics/deedee0.png"});
				        getContactDetails(contact.userid);
				}
			});
			
			
			// initialize the UI
			innerContactStack.addAll({"miscinfo" : MiscInfo(cObserver), "notes" : ContactNotes(cObserver), "dashboard": ContactDashboard(cObserver), "whatsnew":ContactWhatsNew(cObserver)});
			
			ContactDetails.alive(Map.get("contactdetails"));
			
			
			return ContactDetails;
			
		};
		
	});

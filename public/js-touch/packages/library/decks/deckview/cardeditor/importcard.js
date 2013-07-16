/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, Model, Event, Store){
           
           return function ImportCardConstructor($update, $close){
                   
                var importCard = new Widget(),
                    labels = Config.get("labels"),
                    deckId,
                    model = new Store();
                    
                
                importCard.template = '<div class="importcard"><div class="importfrom"><label data-labels="bind:innerHTML, importfrom">Select deck to import from</label><select data-model="bind:setDecks, decks" data-settingsevent="listen: change, updateDeck"></select></div><div>Deck card list</div><div>Transfer buttons<button>Add/remove</button><button>Add all/remove all</button><button>Clear selection</button></div><div>Current deck card list</div><div class="cancelmail" data-importevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div>';
                
                importCard.plugins.addAll({
                        "label" : new Model(labels),
                        "model" : new Model(model,{
                                setDecks: function(decks){
                                        var i, l, res="", selected, idx;
                                        if (decks){
                                                for (i=0, l=decks.length; i<l; i++){
                                                        if (decks[i]._id !== deckId) res+="<option>"+decks[i].title+"</option>";
                                                }
                                        }
                                        this.innerHTML=res;
                                   }        
                        }),
                        "importevent" : new Event(importCard)
                });
                
                importCard.cancel = function(event, node){
                        $close();        
                };
                
                importCard.reset = function reset($deckId){
                        model.reset();
                        
                        deckId = $deckId;
                        console.log(deckId);
                        
                        Config.get("observer").notify("getImportableDecks", function(result){
                                if (result && result.length){
                                        // remove currently edited deck
                                        result.sort(function(x,y){
                                                var a = x.title, b = y.title;
                                                if (a<b) return -1;
                                                if (a>b) return 1;
                                                if (a===b) return 0;
                                        });
                                }
                                model.set("decks", result);
                        });
                };
                
                IMPORTMODEL = model;
                
                return importCard;
                   
           }
});
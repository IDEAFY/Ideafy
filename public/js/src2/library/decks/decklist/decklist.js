define("Ideafy/Library/DeckList", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
                return function DeckListConstructor(){
                        
                        var deckList = new Widget();
                        
                        deckList.template = '<ul class="deck-list" data-decks="foreach"><li class="list-item" data-decklistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class="item-header"><div class="avatar" data-decks="bind:"></div><h2 data-decks="bind:innerHTML,doc.authornames"></h2><span class="date" data-decks="bind:date,doc.creation_date"></span></div><div class="item-body"><h3 data-decks="bind:innerHTML,doc.title"></h3><p data-decks="bind:innerHTML,doc.description"></p></div><div class="item-footer"><a class="idea-type"></a><a class="item-acorn"></a><span class="rating" data-decks="bind:setRating, value.rating"></span></div></li></ul>';
                        
                        deckList.place(Map.get("decklist"));
                        
                        deckList.reset = function reset(){
                                
                        };
                        
                        deckList.init = function init(){
                                
                        };
                        
                        return deckList;
                        
                };
        });
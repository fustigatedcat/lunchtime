var startGameButton;
var playerList;
var currentCard;
var myCardList;

window.onload = () => {
    startGameButton = (() => {

        return new Vue({
            el: '#start-game-button',
            data: {
                isDisabled: true
            },
            methods: {
                startGame: function() {
                    axios.post('/api/games/' + gameName + '/start', {}, {
                        headers: {
                            uuid: myUser.uuid
                        }
                    }).then(_ => {
                        startGameButton.isDisabled = true;
                    }).catch(ex => {
                        alert(ex);
                    });
                }
            }
        });
    })();

    currentCard = (() => {
        return new Vue({
            el: '#current-card',
            data: {
                name: ''
            }
        })
    })();

    playerList = (() => {
        return new Vue({
            el: '#player-list',
            data: {
                players: []
            }
        });
    })();

    myCardList = (() => {
        return new Vue({
            el: '#my-cards',
            data: {
                cards: [],
                myTurn: false
            },
            methods: {
                play: function(card) {
                    if(myTurn) {
                        axios.post('/api/games/' + gameName + '/play', {
                            uuid: myUser.uuid,
                            card: card.id
                        }).then(response => {
                            currentCard.name = card.name;
                            myCardList.cards = myCardList.cards.filter(f => f.id != card.id);
                            myCardList.myTurn = false;
                        });
                    }
                }
            }
        });
    })();
    
    axios.get('/api/games/' + gameName, {
        params: {
            state: 'initial'
        },
        headers: {
            uuid: myUser.uuid
        }
    }).then(response => {
        if(response.data.isOwner) {
            startGameButton.isDisabled = response.data.isGameStarted;
        }
        currentCard.name = response.data.currentCardName;
        playerList.players = response.data.players;
        myCardList.cards = response.data.myCards;
        myCardList.myTurn = response.data.myTurn;
        setInterval(() => {
            axios.get('/api/games/' + gameName, {
                params: {
                    state: 'update'
                },
                headers: {
                    uuid: myUser.uuid
                }
            }).then(response => {
                currentCard.name = response.data.currentCardName;
                playerList.players = response.data.players;
                myCardList.cards = response.data.myCards;
                myCardList.myTurn = response.data.myTurn;
            });
        }, 1000);
    });
};
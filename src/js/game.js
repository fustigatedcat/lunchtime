var startGameButton;
var playerList;
var currentCard;
var myCardList;
var header;

window.onload = () => {
    header = (() => {
        return new Vue({
            el: '#header',
            data: {
                isGameOver: false
            }
        });
    });

    startGameButton = (() => {

        return new Vue({
            el: '#start-game-button',
            data: {
                isDisabled: true
            },
            methods: {
                startGame: function() {
                    axios.post('/api/games/' + gameName + '/start', {}, {
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
                    if(myCardList.myTurn) {
                        axios.post('/api/games/' + gameName + '/play', {
                            card: card
                        }).then(response => {
                            currentCard.name = card.name;
                            myCardList.cards = myCardList.cards.filter(f => f.id != card.id);
                            myCardList.myTurn = false;
                        });
                    }
                },
                stay: function() {
                    if(myCardList.myTurn) {
                        axios.post('/api/games/' + gameName + '/stay', {}).then(response => {
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
        }
    }).then(response => {
        if(response.data.isOwner) {
            startGameButton.isDisabled = response.data.isGameStarted;
        }
        currentCard.name = response.data.currentCard;
        playerList.players = response.data.players;
        myCardList.cards = response.data.myCards;
        myCardList.myTurn = response.data.myTurn;
        setInterval(() => {
            axios.get('/api/games/' + gameName, {
                params: {
                    state: 'update'
                }
            }).then(response => {
                currentCard.name = response.data.currentCard;
                playerList.players = response.data.players;
                myCardList.cards = response.data.myCards;
                myCardList.myTurn = response.data.myTurn;
                header.isGameOver = response.data.isGameOver;
            });
        }, 1000);
    });
};
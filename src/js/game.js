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
                    axios.post('/api/games/' + gameName + '/start', {
                        uuid: myUser.uuid
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
            }
        });
    })();
    
    axios.get('/api/games/' + gameName, {
        params: {
            uuid: myUser.uuid,
            state: 'initial'
        }
    }).then(response => {
        if(response.data.isOwner) {
            startGameButton.isDisabled = response.data.isGameStarted;
        }
        currentCard.name = 'El Cerro Grande';
        playerList.players = response.data.players;
        myCardList.cards = response.data.myCards;
        myCardList.myTurn = response.data.myTurn;
        setInterval(() => {
            axios.get('/api/games/' + gameName, {
                params: {
                    uuid: myUser.uuid,
                    state: 'update'
                }
            }).then(response => {
                playerList.players = response.data.players;
                myCardList.cards = response.data.myCards;
                myCardList.myTurn = response.data.myTurn;
            });
        }, 1000);
        console.log(response.data);
    });
};
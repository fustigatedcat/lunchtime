var startGameButton;
var playerList;

window.onload = () => {
    startGameButton = (() => {

        return new Vue({
            el: '#start-game-button',
            data: {
                isDisabled: true
            },
            methods: {
                startGame: function() {
                    startGameButton.isDisabled = true;
                    alert('Starting game ' + gameName);
                }
            }
        });
    })();

    playerList = (() => {
        return new Vue({
            el: '#player-list',
            data: {
                players: []
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
            playerList.players = response.data.players;
        }
        setInterval(() => {
            axios.get('/api/games/' + gameName, {
                params: {
                    uuid: myUser.uuid,
                    state: 'update'
                }
            }).then(response => {
                playerList.players = response.data.players;
            });
        }, 1000);
        console.log(response.data);
    });
};
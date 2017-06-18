var startGameButton;

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
    
    axios.get('/api/games/' + gameName, {
        params: {
            uuid: myUser.uuid,
            state: 'initial'
        }
    }).then(response => {
        if(response.data.isOwner) {
            startGameButton.isDisabled = response.data.isGameStarted;
        }
        console.log(response.data);
    })
};
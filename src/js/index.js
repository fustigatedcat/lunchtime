var restaurantSelections;
var timeSelection;
var createGameButton;

window.onload = () => {
    restaurantSelections = (() => {
        var restaurants = localStorage.getItem('game-restaurants');
        if (restaurants == null) {
            restaurants = [];
        } else {
            restaurants = JSON.parse(restaurants);
        }

        return new Vue({
            el: '#restaurant-management',
            data: {
                restaurants: restaurants,
                newName: ''
            },
            methods: {
                addRestaurant: function() {
                    restaurantSelections.restaurants.push({name: restaurantSelections.newName});
                    restaurantSelections.newName = '';
                    localStorage.setItem('game-restaurants', JSON.stringify(restaurantSelections.restaurants));
                },
                removeRestaurant: function(r) {
                    restaurantSelections.restaurants = restaurantSelections.restaurants.filter(r2 => r2 != r);
                    localStorage.setItem('game-restaurants', JSON.stringify(restaurantSelections.restaurants));
                }
            }
        })
    })();

    timeSelection = (() => {
        return new Vue({
            el: '#lunch-time',
            data: {
                hour: 11,
                minute: 30
            }
        });
    })();

    createGameButton = (() => {
        return new Vue({
            el: '#create-game-footer',
            data: {},
            methods: {
                createGame: function() {
                    axios.post('/api/games', {
                        restaurants: restaurantSelections.restaurants,
                        time: {
                            hour: timeSelection.hour,
                            minute: timeSelection.minute
                        }
                    }).then(response => {
                        window.location = '/games/' + response.data.name;
                    }).catch(response => {
                        console.log(response);
                    });
                }
            }
        })
    })();
};

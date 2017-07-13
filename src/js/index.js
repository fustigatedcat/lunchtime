window.onload = () => {
    var restaurantSelections = (() => {
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
                newName: '',
                autoPopulateEnabled: 'geolocation' in navigator,
                maxAutoPopulate: 10
            },
            methods: {
                addRestaurant: () => {
                    restaurantSelections.restaurants.push({name: restaurantSelections.newName});
                    restaurantSelections.newName = '';
                    localStorage.setItem('game-restaurants', JSON.stringify(restaurantSelections.restaurants));
                },
                removeRestaurant: r => {
                    restaurantSelections.restaurants = restaurantSelections.restaurants.filter(r2 => r2 != r);
                    localStorage.setItem('game-restaurants', JSON.stringify(restaurantSelections.restaurants));
                },
                autoPopulate: () => {
                    navigator.geolocation.getCurrentPosition(p => {
                        var position = {lat: p.coords.latitude, lng: p.coords.longitude};
                        var nonDisplayedMap = new google.maps.Map(document.createElement('div'), {
                            center: position,
                            zoom: 17
                        });
                        var service = new google.maps.places.PlacesService(nonDisplayedMap);
                        service.nearbySearch({
                            location: position,
                            radius: 500,
                            openNow: true,
                            types: ['restaurant']
                        }, function(restaurants) {
                            restaurantSelections.restaurants = restaurants.splice(0, restaurantSelections.maxAutoPopulate);
                            localStorage.setItem('game-restaurants', JSON.stringify(restaurantSelections.restaurants));
                        });

                    }, function(e) {
                        alert(e);
                    });
                }
            }
        })
    })();

    var timeSelection = (() => {
        return new Vue({
            el: '#lunch-time',
            data: {
                hour: 11,
                minute: 30
            }
        });
    })();

    var createGameButton = (() => {
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

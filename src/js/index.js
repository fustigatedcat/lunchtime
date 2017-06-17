/*$(document).ready(function() {
    class TimeInput extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                hour: 11,
                minute: 30
            }
        }

        handleMinuteUpdate(evt) {
            this.setState({
                minute : evt.target.value
            });
        }

        handleHourUpdate(evt) {
            this.setState({
                hour : evt.target.value
            });
        }

        render() {
            return <div className="row">
                <div className="col-lg-4">Time</div>
                <div className="col-lg-8">
                    <input type="number" style={{width:"20%"}} min="1" max="12" value={this.state.hour} onChange={evt => this.handleHourUpdate(evt)} />
                    <input style={{width:"20%"}} type="number" min="0" max="59" value={this.state.minute} onChange={evt => this.handleMinuteUpdate(evt)} />
                </div>
            </div>
        }
    }

    class RestaurantTag extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                name: props.name,
                fnRemove: props.remove
            };
        }

        render() {
            return <div><span>{this.state.name}</span> <span onClick={this.state.fnRemove}>x</span></div>;
        }
    }

    class ManualRestaurantList extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                list : props.restaurants,
                inputString : ''
            }
        }

        addRestaurant() {
            var maxId = 0;
            var newList = [];
            this.state.list.forEach(r => {
                if(r.id > maxId) { maxId = r.id; }
                newList.push(r);
            });
            newList.push({id : maxId + 1, name: this.state.inputString});
            localStorage.setItem('game-restaurants', JSON.stringify(newList));
            this.setState({
                list: newList,
                inputString: ''
            });
        }

        updateInputValue(evt) {
            this.setState({
                inputString: evt.target.value
            });
        }

        render() {
            return <div className="row">
                <div className="col-lg-4">Restaurants</div>
                <div className="col-lg-8">
                    <div><input type="text" value={this.state.inputString} onChange={evt => this.updateInputValue(evt)} /><button className='btn btn-success' onClick={() => this.addRestaurant()}>Add</button></div>
                    <div>{this.state.list.map(r => <RestaurantTag key={r.id} remove={this.props.removeRestaurant} name={r.name}/>)}</div>
                </div>
            </div>
        }
    }

    class NewGameButton extends React.Component {
        constructor(props) {
            super(props);
            var restaurants = localStorage.getItem('game-restaurants');
            if(restaurants == null) {
                restaurants = [];
            } else {
                restaurants = JSON.parse(restaurants);
            }
            this.state = {
                restaurants : restaurants
            }
        }

        removeRestaurant(r) {
            this.setState({
                restaurants: this.state.restaurants.filter(r2 => r2 != r)
            });
        }

        addRestaurant() {
            var maxId = 0;
            var newList = [];
            this.state.list.forEach(r => {
                if(r.id > maxId) { maxId = r.id; }
                newList.push(r);
            });
            newList.push({id : maxId + 1, name: this.state.inputString});
            localStorage.setItem('game-restaurants', JSON.stringify(newList));
            this.setState({
                list: newList,
                inputString: ''
            });
        }

        createGame() {
            console.log(this.state);
        }

        render() {
            return (<div><button className='btn btn-primary' data-toggle='modal' data-target='#bs-example-modal-sm'>New Game</button>
                <div id='bs-example-modal-sm' className='modal fade' tabindex='-1' role='dialog' aria-labelledby='mySmallModalLabel'>
                    <div className="modal-dialog modal-md" role="document">
                        <div className='modal-content'>
                            <div className='modal-header'><h4>Create Game</h4></div>
                            <div className='modal-body'>
                                <ManualRestaurantList restaurants={this.state.restaurants} removeRestaurant={this.removeRestaurant}/>
                                <TimeInput />
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-default' data-dismiss='modal'>Close</button>
                                <button className='btn btn-primary' onClick={() => this.createGame()}>Create Game</button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>);
        }
    }

    $("#new-game-button").each(function () {
        ReactDOM.render(<NewGameButton />, this);
    });
});*/


var restaurantSelections;

$(() => {
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
                }
            }
        })
    })();
});
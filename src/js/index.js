$(document).ready(function() {
    function reload() {
        $("#new-game-button").each(function () {
            ReactDOM.render(<NewGameButton />, this);
        });
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
                list : [{name: "Bens Kitchen"}, {name: "mother fucking Handley's"}],
                inputString : ''
            }
        }

        removeRestaurant(r) {
            this.setState({
                list: this.state.list.filter(r2 => r2 != r)
            });
        }

        addRestaurant() {
            var newList = [];
            this.state.list.forEach(r => newList.push(r));
            newList.push({name: this.state.inputString});
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
            return <div>
                <div><input type="text" value={this.state.inputString} onChange={evt => this.updateInputValue(evt)} /><button className='btn btn-success' onClick={() => this.addRestaurant()}>Add</button></div>
                <div>{this.state.list.map(r => <RestaurantTag remove={() => this.removeRestaurant(r)} name={r.name}/>)}</div>
            </div>
        }
    }

    class NewGameButton extends React.Component {
        render() {
            return (<div><button className='btn btn-primary' data-toggle='modal' data-target='#bs-example-modal-sm'>New Game</button>
                <div id='bs-example-modal-sm' className='modal fade' tabindex='-1' role='dialog' aria-labelledby='mySmallModalLabel'>
                    <div className="modal-dialog modal-sm" role="document">
                        <div className='modal-content'>
                            <div className='modal-header'><h4>Create Game</h4></div>
                            <div className='modal-body'>
                                <ManualRestaurantList />
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-default' data-dismiss='modal'>Close</button>
                                <button className='btn btn-primary'>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>);
        }
    }

    reload();
});

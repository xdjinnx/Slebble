var React = require('react');

var Menu = require('./menu/menu.js').Menu;

export class Start extends React.Component {
    render() {
        return (
            <div>
                <Menu />
                <main>
                    <h2>Stations</h2>

                    <ul id="adding" className="slebble-list">
                      <span>No stations set</span>
                    </ul>

                    <h2>Max depatures</h2>

                    <input
                        type="range"
                        id="depature-range"
                        min="1"
                        max="20"
                        value="15"
                        step="1"
                        // onChange="Slebble.changePerformance()"
                        // onInput="Slebble.changePerformance()"
                        />

                    <div style={{"width": "17px", "display": "inline-block"}}>
                      <span id="depature-number">15</span>
                    </div>
                    <span id="performance-display" className="theme--user-input">
                      <span className="icon-circle themed--background"><i className="icon icon-performance"></i></span>
                    </span>

                    <h2>Area</h2>

                    <select id="provider">
                      <option value="resrobot">Sweden</option>
                      <option value="sl">SL - Stockholm</option>
                    </select>
                    <p>Note: It is only possible to have stations from one area at a time. Current stations will be removed if you change.</p>

                </main>
            </div>
        )
    }
}

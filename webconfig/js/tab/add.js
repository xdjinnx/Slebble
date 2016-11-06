var React = require('react');

var Menu = require('./menu/menu.js').Menu;

export class Add extends React.Component {
    render() {
        return (
            <div>
                <Menu />
                <main>
                    <h2>Search</h2>

                    <input
                        type="text"
                        id="search-field"
                        // onKeyPress="Slebble.enterKeyPress(event)"
                        />
                    <a id="search-btn" className="button--primary">
                      <div className="mglass"></div>
                    </a>

                    <ul id="results" className="list-links list-links--primary"></ul>
                </main>
            </div>
        )
    }
}

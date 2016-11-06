var React = require('react');

var Menu = require('./menu/menu.js').Menu;

export class Filter extends React.Component {
    render() {
        return (
            <div>
                <Menu />
                <main>
                    <h2>Filtering</h2>

                    <ul id="filterAdding" className="slebble-list list-links--primary">
                      <span>No stations set</span>
                    </ul>

                    <div className="highlight-module  highlight-module--right   highlight-module--learning">
                      <div className="highlight-module__container  icon-exclamation">
                        <div className="highlight-module__content   g-wide--push-1 g-wide--pull-1  g-medium--pull-1   ">
                          <p className="highlight-module__title"> Help </p>

                          <p className="highlight-module__text"> Example \"514, 321, 534\" or \"514\". It's very important that it has \", \"between all the bus numbers!</p>
                        </div>
                      </div>
                    </div>
                </main>
            </div>
        )
    }
}

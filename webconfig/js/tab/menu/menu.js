var React = require('react');
var Link = require('react-router').Link;

export class Menu extends React.Component {
    render() {
        return (
            <nav className="navdrawer-container promote-layer">
                <ul>
                    <Navigation link="/" name="Start" />
                    <Navigation link="/add" name="Add" />
                    <Navigation link="/filter" name="Filter" />
                    <Navigation link="/reset" name="Reset Config" />
                    <Navigation link="/save" name="Save To App" />
                    <Navigation link="/exit" name="Exit" />
                </ul>
            </nav>
        );
    }
}

class Navigation extends React.Component {
    render() {
        return <li><Link to={this.props.link}>{this.props.name}</Link></li>;
    }
}

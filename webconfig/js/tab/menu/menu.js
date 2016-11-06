var React = require('react');
var Link = require('react-router').Link;

export class Menu extends React.Component {

    closeMenu() {
        var body = document.body;
        body.classList.remove('open');
        this.appbarElement.classList.remove('open');
        this.navdrawerContainer.classList.remove('open');
    }

    toggleMenu() {
        var body = document.body;
        body.classList.toggle('open');
        this.appbarElement.classList.toggle('open');
        this.navdrawerContainer.classList.toggle('open');
        this.navdrawerContainer.classList.add('opened');
    }

    closeMenuTrigger(event) {
        if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
            this.closeMenu();
        }
    }

    componentDidMount() {
        var querySelector = document.querySelector.bind(document);
        this.navdrawerContainer = querySelector('.navdrawer-container');
        this.appbarElement = querySelector('.app-bar');
        this.menuBtn = querySelector('.menu');
        this.main = querySelector('main');

        this.main.addEventListener('click', this.closeMenu.bind(this));
        this.menuBtn.addEventListener('click', this.toggleMenu.bind(this));
        this.navdrawerContainer.addEventListener('click', this.closeMenuTrigger.bind(this));
    }

    componentWillUnmount() {
        this.main.removeEventListener('click', this.closeMenu.bind(this));
        this.menuBtn.removeEventListener('click', this.toggleMenu.bind(this));
        this.navdrawerContainer.removeEventListener('click', this.closeMenuTrigger.bind(this));
    }

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

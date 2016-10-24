var React = require('react');
var ReactDOM = require('react-dom');

class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}

const element = <Welcome name="Slebble" />;
ReactDOM.render(
    element,
    document.getElementsByTagName('main')[0]
);
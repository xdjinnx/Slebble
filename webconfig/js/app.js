var React = require('react');
var ReactDOM = require('react-dom');

var Router = require('react-router').Router;
var Route = require('react-router').Route;
var hashHistory = require('react-router').hashHistory;

var Start = require('./tab/start.js').Start;
var Add = require('./tab/add.js').Add;
var Filter = require('./tab/filter.js').Filter;

ReactDOM.render((
    <Router history={hashHistory}>
        <Route path="/" component={Start} />
        <Route path="/add" component={Add} />
        <Route path="/filter" component={Filter} />
    </Router>
), document.getElementsByTagName('app')[0]);

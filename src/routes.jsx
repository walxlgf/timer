import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Games from './containers/games';
import EditGame from './containers/editGame';
import ViewGame from './containers/viewGame';
import Login from './containers/login';
import Signup from './containers/signup';
import Patterns from './containers/patterns';
import EditPattern from './containers/editPattern';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { subscribeGames, unsubscribeGames } from './actions/game';


class Routes extends Component {
    constructor(props) {
        super(props);
    }
    componentWillReceiveProps(nextProps) {
        //认证状态发生改变 对Games的监听也会改变
        if (this.props.isAuthenticated != nextProps.isAuthenticated) {
            //如果已经登录 注册对Games的监听
            if (nextProps.isAuthenticated) {
                this.props.subscribeGames();
            }
            //如果logout，取消对Games的监听 
            else {
                this.props.unsubscribeGames();
            }
        }
    }
    render() {
        const PrivateRoute = ({ component: Component, ...rest }) => (
            <Route {...rest} render={props => (
                this.props.isAuthenticated ? (
                    <Component {...props} />
                ) : (
                        <Redirect to={{
                            pathname: '/login',
                            state: { from: props.location }
                        }} />
                    )
            )} />
        )
        return (
            <div>
                <Router>
                    <Switch>
                        <PrivateRoute exact path="/" component={Games} />
                        <PrivateRoute path='/games' component={Games} />
                        <PrivateRoute path='/editGame' component={EditGame} />
                        <PrivateRoute path='/viewGame' component={ViewGame} />
                        <PrivateRoute exact path='/patterns' component={Patterns} />
                        <PrivateRoute exact path='/editPattern' component={EditPattern} />
                        <Route path='/login' component={Login} />
                        <Route path='/signup' component={Signup} />
                    </Switch>
                </Router>
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        subscribeGames: bindActionCreators(subscribeGames, dispatch),
        unsubscribeGames: bindActionCreators(unsubscribeGames, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Routes)


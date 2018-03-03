import Parse from 'parse';

export const LOGIN = "LOGIN"
export const LOGIN_FAILED = "LOGIN_FAILED"
export const LOGIN_SUCCESSFUL = "LOGIN_SUCCESSFUL"

export const SIGN_UP = "SIGN_UP"
export const SIGN_UP_FAILED = "SIGN_UP_FAILED"
export const SIGN_UP_SUCCESSFUL = "SIGN_UP_SUCCESSFUL"

export const LOGOUT = "LOGOUT"
export const LOGOUT_FAILED = "LOGOUT_FAILED"
export const LOGOUT_SUCCESSFUL = "LOGOUT_SUCCESSFUL"

export const CLEAR_STATE = "CLEAR_STATE"

export const signUp = (user) => {
    return dispatch => {
        dispatch({ type: SIGN_UP });
        let pUser = new Parse.User();
        pUser.set('username', user.username);
        pUser.set('password', user.password);
        pUser.signUp(null)
            .then(function (user) {
                console.log(`action:auth:signUp:user:${JSON.stringify(user)}`)
                dispatch({ type: SIGN_UP_SUCCESSFUL, user });
            }, function (error) {
                console.log(`action:auth:signUp:error:${JSON.stringify(error)}`)
                dispatch({ type: SIGN_UP_FAILED, error });
            });
    }
}

export const login = (user) => {
    return dispatch => {
        dispatch({ type: LOGIN });
        Parse.User.logIn(user.username, user.password)
            .then(function (user) {
                console.log(`action:auth:LOGIN_SUCCESS:user:${JSON.stringify(user)}`)
                dispatch({ type: LOGIN_SUCCESSFUL, user });
            }, function (error) {
                dispatch({ type: LOGIN_FAILED, error });
            });

    }
}

export const logout = (user) => {
    return dispatch => {
        dispatch({ type: LOGOUT });
        Parse.User.logOut()
            .then(function (user) {
                console.log(`action:auth:LOGOUT_SUCCESSFUL:user:${JSON.stringify(user)}`)
                dispatch({ type: CLEAR_STATE });
                dispatch({ type: LOGOUT_SUCCESSFUL, user });
            }, function (error) {
                dispatch({ type: LOGOUT_FAILED, error });
            });

    }
}


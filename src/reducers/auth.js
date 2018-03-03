import { LOGIN, LOGIN_FAILED, LOGIN_SUCCESSFUL, SIGN_UP, SIGN_UP_FAILED, SIGN_UP_SUCCESSFUL, LOGOUT_SUCCESSFUL } from '../actions/auth'

const initialState = {
    isAuthenticated: false,
    logining: false,
    signuping: false,
    logouting: false,
    error: null,
};

export function auth(state = initialState, action) {
    switch (action.type) {

        case LOGIN:
            return {
                ...state,
                logining: true,
                user: null,
                error: null,
                isAuthenticated: false
            }
        case LOGIN_FAILED:
            return {
                ...state,
                logining: false,
                user: null,
                error: action.error,
                isAuthenticated: false
            };
        case LOGIN_SUCCESSFUL:
            return {
                ...state,
                logining: false,
                user: action.user,
                isAuthenticated: true,
                error: null,
            };
        case SIGN_UP:
            return {
                ...state,
                signuping: true,
                user: null,
                error: null,
                isAuthenticated: false
            }
        case SIGN_UP_FAILED:
            return {
                ...state,
                signuping: false,
                user: null,
                error: action.error,
                isAuthenticated: false
            };
        case SIGN_UP_SUCCESSFUL:
            return {
                ...state,
                signuping: false,
                user: action.user,
                isAuthenticated: true,
                error: null,
            };
        case LOGOUT_SUCCESSFUL:
            return {
                ...initialState,
            };
        default:
            return state;
    }
}
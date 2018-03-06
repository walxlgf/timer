import { createStore, applyMiddleware, compose } from 'redux'
// import { appId, serverURL, liveQueryServerURL } from './config'
import rootReducer from './reducers'
import logger from 'redux-logger';
import thunk from 'redux-thunk';
//初始化Parse
import Parse from 'parse';

Parse.initialize('timer');
Parse.serverURL = process.env.REACT_APP_SERVER_URL;
Parse.liveQueryServerURL = process.env.REACT_APP_LIVEQUERY_SERVER_URL;

const win = window;
const middlewares = [];

let storeEnhancers;
if (process.env.NODE_ENV === 'production') {
    storeEnhancers = compose(
        applyMiddleware(
            ...middlewares,
            thunk,
            logger,
        )
    );
} else {
    storeEnhancers = compose(
        applyMiddleware(
            ...middlewares,
            thunk,
            logger,
        ),
        (win && win.devToolsExtension) ? win.devToolsExtension() : (f) => f,
    );
}

export default function configureStore(initialState = {}) {
    const store = createStore(rootReducer, initialState, storeEnhancers);
    return store;
}

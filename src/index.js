import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import registerServiceWorker from './registerServiceWorker';
import Routes from './routes';
import configureStore from './store'
const store = configureStore();

console.log(`index:process.env:${JSON.stringify(process.env)}`)
console.log(`index:process.env:SERVER_URL:${JSON.stringify(process.env.SERVER_URL)}`)
ReactDOM.render(
    <Provider store={store}>
        <Routes />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker(); 

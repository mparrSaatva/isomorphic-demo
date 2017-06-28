import express from 'express';
import http from 'http';
import compression from 'compression';
import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom/server';
import App from '../server/app';
//console.log(App.fetchData);
const app = express();
import path from 'path';
import colors from 'colors';
//import store from './src/redux/store';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reducers from '../client/redux/reducers/combine';
import { StaticRouter as Router, matchPath } from 'react-router';
import thunk from '../client/redux/middleware/thunk';

const port = process.env.PORT || 8080;

app.use(compression());
// serve our static stuff like index.css
app.use(express.static(path.join(__dirname, 'dist')));
// serve our static stuff like index.css
//app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    const store = createStore(reducers, {}, applyMiddleware(thunk));

    App.fetchData({ store }).then(() => {
        let preloadedState = store.getState();
        const html = ReactDOM.renderToString(
            <Provider store={store}>
                <App />
            </Provider>
        )
        res.send(renderFullPage(html, preloadedState))
    })
});


app.listen(port, function () {
    console.log('app running on localhost:' + port);
});

function renderFullPage(html, preloadedState) {
    return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/docs/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `
}
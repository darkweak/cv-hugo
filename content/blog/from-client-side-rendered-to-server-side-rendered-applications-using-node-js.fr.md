---
name: Du rendu côté client au rendu côté serveur en utilisant node.js
image: https://sylvaincdn.000webhostapp.com/devcv/blog/ssr.png
date: 2020-10-10
---

### Définition de l'image docker Node.js
Créez un serveur express en utilisant Nodejs. Tout d'abord créons le Dockerfile qui contiendra ceci.

```dockerfile
# client/Dockerfile-SSR
FROM node:alpine

WORKDIR /app

RUN apk update && \
 apk upgrade && \
 rm -rf /var/cache/apk/*

COPY package.json ./

COPY . .

RUN npm install
RUN npm run server-build

CMD [ "yarn", "server-start" ]
```

Mettez à jour vos scripts dans le `package.json` avec ceci :
```json
{
  "script": {
    "client-build": "webpack --config webpack.build.config.js",
    "server-build": "webpack --config webpack.server.config.js",
    "server-start": "node server.js",
  }
}
```
Puis définissez une image dans le fichier `docker-compose`.
```diff
# docker-compose.yml
...

+  nodejs-ssr:
+    build:
+      context: ./client
+      dockerfile: Dockerfile-ssr
+    volumes:
+      - ./client:/app:rw,cached
+      - ./client/node_modules:/app/node_modules
+    env_file:
+      - ./client/.env # Share client .env file between client and nodejs server
+    ports:
+      - "8082:8082" # Nodejs express server will run on port 8082
```

### Serveur express + mapping des routes + implémentation de redux
Installez toutes les dépendances nécessaires

```bash
$ docker-compose exec client yarn add axios express history react react-dom react-redux react-router-config react-router-dom recompose redux redux-form redux-thunk
```

Partons du principe que vous avez deux fichiers `Welcome.js` et `Book.js` situés dans `client/src` et une action utilisant axios ainsi qu'un reducer.

```jsx
// client/src/Welcome.js
import React from 'react';
import { Link } from 'react-router-dom';

export default () => <h1>You are on the welcome page, <Link to="/books">go to list of books</Link></h1>;
```
---
```jsx
// client/src/Book.js
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose, lifecycle, setStatic } from 'recompose';
import { fetchBooks } from './store/action';

export const List = compose(
 connect(
   reducers => ({
     ...reducers.BookReducer
   }),
   {
     fetchBooks
   }
 ),
 lifecycle({
   componentDidMount() {
     const { fetchBooks } = this.props;
     fetchBooks();
   }
 }),
 setStatic(
   'fetching', ({ dispatch }) => [dispatch(fetchBooks())]
 ))(({ books }) => (
   <React.Fragment>
     <h1>You are on the welcome page, <Link to="/">go to homepage</Link></h1>
     <ul>
       {
         books.map((book, index) => <li key={ index }>{ book.name }</li>)
       }
     </ul>
   </React.Fragment>
));
```
---
```jsx
// client/src/store/action.js
export const BOOKS_LIST_FAILED = 'BOOKS_LIST_FAILED';
export const BOOKS_LIST_SUCCESS = 'BOOKS_LIST_SUCCESS';

export const fetchBooks = () => async (dispatch) => {
   try {
         let headers = {
             Accept: 'application/ld+json',
             'Content-Type': 'application/ld+json'
         };
         const request = ({
             url: `${ process.env.REACT_APP_API_ENTRYPOINT }/books`,
             method: 'GET',
             headers
         });
         const res = await axios.request(request);
         dispatch({
             type: BOOKS_LIST_SUCCESS,
             payload: res.data[ 'hydra:member' ]
         });
     } catch (e) {
         dispatch({
             type: BOOKS_LIST_FAILED
         });
     }
};
```

Créez un dossier nommé `server` dans le dossier `client` puis créez deux fichiers `index.js` et `render.js`.

`index.js` contiendra l'initialisation du serveur express et `render.js` la partie rendu.

```jsx
// client/src/store/reducer.js
import * as actions from './action';

export const BookReducer = (state = {
 books: []
}, action) => {
 const {type, payload} = action;
 switch (type) {
   case actions.BOOKS_LIST_FAILED:
     return {
       ...state,
       books: []
     };
   case actions.BOOKS_LIST_SUCCESS:
     return {
       ...state,
       books: payload
     };
   default:
     return state;
 }
};
```
---
```jsx
// client/server/index.js
import express from 'express';
import React from 'react';
import thunk from 'redux-thunk';
import { render } from './render';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { matchRoutes } from 'react-router-config';
import { reducers } from "../src/reducers";
import { routes } from "../src/routes";

const PORT = 8082; // port defined in docker-compose file
const app = express();
const BUILD_DIR = 'dist';

app.use(`/${ BUILD_DIR }`, express.static(`./${ BUILD_DIR }`));

app.get('*', async (req, res) => {
 const store = createStore(
   combineReducers({
     ...reducers
   }),
   {},
   applyMiddleware(thunk)
 ); //define store depending on each request

 try {
   const actions = matchRoutes(routes, req.path)
     .map(({ route }) => route.component.fetching ? route.component.fetching({...store, path: req.path }) : null) // Static method named fetching defined below
     .map(async actions => await Promise.all(
       (actions || []).map(p => p && new Promise(resolve => p.then(resolve).catch(resolve)))
       ) // Execute static fetching method
     );

   await  Promise.all(actions);
   const context = {};
   const content = render(context, req.path, store);
   res.send(content);
 } catch (e) {
   console.log(e)
 }
});


app.listen(PORT, () => console.log(`SSR service listening on port: ${PORT}`));
```
---
```jsx
// client/server/render.js
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { routes } from "../src/routes";

export const render = (context, path, store) => {
 const content = renderToString(
   <Provider store={store}>
     <StaticRouter location={path} context={context}>
       {
         renderRoutes(routes)
       }
     </StaticRouter>
   </Provider>
 );


 return `
<!DOCTYPE html>
<html lang="en">
 <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
   <meta name="theme-color" content="#000000">
   <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
   <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
   <title>Welcome to API Platform</title>
 </head>
 <body>
   <noscript>
     You need to enable JavaScript to run this app.
   </noscript>
   <div id="root">${content}</div>
   <script>window.INITIAL_STATE = ${JSON.stringify(store.getState())}</script>
   <script src="/dist/bundle.js"></script>
 </body>
</html>
 `;
};
```

Vous pouvez remarquer dans le code l'appel aux chemin `../src/routes` et `../src/reducers`. Ces fichiers contiennent respectivement la liste de vos routes ainsi que la liste de vos reducers

```jsx
// client/src/routes.js
import Welcome from "./components/Welcome";
import { List } from "./components/Book";

export const routes = [
    {
        component: List,
        path: '/books'
    },
    {
        component: Welcome,
        path: '/'
    }
];
```
---
```jsx
// client/src/reducer.js
import { BookReducer } from './store/reducer';

export const reducers = {
 BookReducer
}
```

### Babel + Webpack

Ajoutez les dépendances de babel et webpack :
```bash
$ docker-compose exec client yarn add -D @babel/plugin-transform-runtime babel-plugin-css-modules-transform mini-css-extract-plugin webpack webpack-cli webpack-dev-server webpack-node-externals
```

Créez un fichier `.babelrc` dans le dossier client.
```json
{
    "plugins": [
        "css-modules-transform",
        "@babel/plugin-transform-runtime"
    ],
    "presets": [
        "@babel/react",
        "@babel/env"
    ]
}
```

Puis definissez deux fichiers nommés `webpack.build.config.js` et `webpack.server.config.js` dans le dossier client.

```jsx
// client/webpack.build.config.js
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.js',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        resolve: {
          extensions: ['.css'],
        },
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } }
        ],
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        REACT_APP_API_ENTRYPOINT: JSON.stringify(process.env.REACT_APP_API_ENTRYPOINT)
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  resolve: {
    extensions: [
      '.js',
      '.css'
    ]
  },
  output: {
    globalObject: 'typeof self !== \'undefined\' $1 self : this',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```
---
```jsx
// client/webpack.server.config.js
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
 target: 'node',
 mode: 'production',
 entry: './server/index.js',
 devtool: 'inline-source-map',
 module: {
   rules: [
     {
       test: /\.css$/,
       resolve: {
         extensions: ['.css'],
       },
       use: [
         MiniCssExtractPlugin.loader,
         { loader: 'css-loader', options: { sourceMap: true } },
         { loader: 'postcss-loader', options: { sourceMap: true } }
       ],
     },
     {
       test: /\.jsx?$/,
       loader: 'babel-loader',
       exclude: /node_modules/
     }
   ]
 },
 plugins: [
   new webpack.DefinePlugin({
     'process.env': {
       REACT_APP_API_ENTRYPOINT: JSON.stringify(process.env.REACT_APP_API_ENTRYPOINT)
     },
   }),
   new MiniCssExtractPlugin({
     filename: "[name].css",
     chunkFilename: "[id].css"
   })
 ],
 resolve: {
   extensions: [
     '.js',
     '.css'
   ]
 },
 output: {
   globalObject: 'typeof self !== \'undefined\' $1 self : this',
   path: path.resolve(__dirname),
   filename: 'server.js'
 },
};
```

Lancez un build de votre application React avec la commande `docker-compose exec client yarn client-build`.  
Minifiez vos scripts pour node en lançant `docker-compose exec client yarn server-build`.  
Construisez l'image nodejs pour mettre à jour le serveur.js généré et mettre à jour le cache `docker-compose build nodejs-ssr`.  
Puis il vous suffit de relancer le conteneur en lançant `docker-compose up -d` et rendez vous sur [http://localhost:8082](http://localhost:8082), vous verrez votre page pré-rendue.  

Enfin, testez votre page, elle devrait être rendue dans [l'outil Google search Console](https://search.google.com/search-console).

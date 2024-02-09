---
name: Cours Typescript
image: https://sylvaincdn.000webhostapp.com/devcv/blog/traefik.png
date: 2024-02-06
---

> TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
>
> —<https://www.typescriptlang.org>

### Démarrage du projet Typescript

Rendez-vous dans votre dossier préféré et lanceez la commande
```bash
npm create vite typescript-introduction
```

Sélectionnez le framework `React`, puis le variant `Typescript` seul, sans SWC, rendez-vous dans le dossier, installez les dépendances puis lancez le serveur de développement

```bash
cd typescript-introduction
npm install
npm run dev
```

Rendez-vous sur [localhost:5173](http://localhost:5173) pour voir votre page.

### Architecture et dépendances du projet
Tout d'abord nous allons architecturer notre projet de la manière suivante
```md
typescript-introduction
├── src
│   ├── components
│   │   ├── atomic
│   │   ├── layout
│   │   ├── molecule
│   │   └── page
├── package.json
├── ...
└── tsconfig.json
```
Les différents dossiers vont nous permettre de s'y retrouver plus simplement dans notre application.
Le dossier components contiendra tous nos composants (purs et des aggrégats).

* — `atomic` contiendra nos composants atomiques, c'est à dire ceux qui ne font que de l'affichage simple (exemple: un composant `H1` qui aura une propriété title et qui se contentera de rendre un élément HTML `h1` avec son contenu). Il faut les garder les plus purs possible.
* — `molecule` contiendra nos composants composés de plusieurs atomes (`atomic`) et/ou de molécules afin de rendre un composant plus complexe (exemple: un composant `Card` qui rendra une `div` avec pour enfant un composant `Image` un composant `H1` et un composant `Badge`).
* — `layout` contiendra les éléments complexes de mise en page, comme par exemple la `Navbar`, `Footer`, `Body` (pour mettre du padding automatiquement au contenu entre la `Navbar` et le `Body` par exemple).
* — `page` contiendra nos pages qui s'appuieront sur les éléments de `layout`, ceux de `molecule` et parfois aussi sur des composants `atomic` (cas très rares).
 
Nous allons maintenant passer à la mise en place de tailwindcss dans le projet afin de pouvoir gérer nos styles plus facilement. En effet tailwindcss est une librairie CSS qui met à disposition des classes CSS atomiques, ce qui permet de styliser les élément HTML directement via les classes plutôt que par du CSS custom. Visitez la documentation de [tailwindcss](https://tailwindcss.com) pour avoir plus de détails sur cette librairie.

Basons-nous sur [l'installation de tailwindcss depuis leur documentation](https://tailwindcss.com/docs/guides/vite), pour se fire nous allons installer les dépendances de développement `tailwindcss`, `autoprefixer` et `postcss` puis nous initialiserons la configuration de tailwindcss et postcss. Nous en profitons aussi pour installer des dépendances pour eslint.

```bash
npm install -D tailwindcss postcss autoprefixer eslint-import-resolver-typescript eslint-plugin-import eslint-plugin-react vite-tsconfig-paths
npx tailwindcss init -p
```

Vous devriez vous retrouver avec deux nouveaux fichiers de configuration `tailwind.config.js` et `postcss.config.js`.  
Ensuite nous allons expliciter l'écoute des fichiers `*.tsx` ainsi que notre fichier `index.html` pour générer les classes nécessaires.

```diff
/** @type {import('tailwindcss').Config} */
export default {
-  content: [],
+  content: [
+    "./index.html",
+    "./src/**/*.tsx",
+  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Nous allons ausi changer quelques directives Typescript afin de profiter des dernières nouveautés de Javascript en utilisant `esnext` et des règles de typage strict.
```diff
-    "target": "ES2020",
+    "alwaysStrict": true,
+    "esModuleInterop": true,
+    "forceConsistentCasingInFileNames": true,
+    "target": "ESNext",
    "useDefineForClassFields": true,
-    "lib": ["ES2020", "DOM", "DOM.Iterable"],
+    "lib": ["DOM", "DOM.Iterable", "ESNext"],
```

Ensuite, nous installerons `prettier`, `eslint-config-prettier` et `eslint-plugin-prettier` en dépendances de développement afin d'améliorer le lint et l'organisation du code (assurez-vous d'avoir le `format on save` activé dans votre IDE) puis nous créerons un fichier `.prettierrc` à la racine du projet pour configurer nos règles prettier.
```json
{
    "printWidth": 80,
    "trailingComma": "all",
    "singleQuote": true,
    "tabWidth": 2,
    "semi": true,
    "jsxSingleQuote": false,
    "quoteProps": "as-needed",
    "bracketSpacing": true,
    "jsxBracketSameLine": false,
    "arrowParens": "avoid"
}
```

Il faut maintenant indiquer à eslint d'utiliser prettier pour la validation, pour cela rien de plus simple, il nous suffit d'activer le plugin prettier dans le fichier `.eslintrc.cjs`
```diff
    'eslint:recommended',
+    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
+    'plugin:react/jsx-runtime',
...
  plugins: [
    'react-refresh',
+    "prettier",
+    "react",
+    "react-hooks",
+    "import",
    "@typescript-eslint"
  ],
...
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
+    'react/jsx-sort-props': [2, { ignoreCase: true }],
+    'react/sort-comp': 2,
+    'import/order': [
+      'error',
+      {
+        groups: ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
+        'newlines-between': 'always',
+        alphabetize: {
+          order: 'asc'
+        }
+      }
+    ],
  },
```

Nous allons remplacer le contenu de notre fichier `src/index.css` et lui indiquer qu'il doit utiliser les layers `base`, `components` et `utilities` ([se référer à la documentation MDN pour les layers CSS](https://developer.mozilla.org/fr/docs/Web/CSS/@layer)).
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Il faudra enfin relancer la commande pour voir les changements sur notre page.
```bash
npm run dev
```

### Création du premier composant
Maintenant que notre projet est mis en place, nous allons créer notre premier composant ReactJS en typescript. Pour se faire nous supprimerons tout le code dans le fichier `App.tsx`.

```diff
- import { useState } from 'react'
- import reactLogo from './assets/react.svg'
- import viteLogo from '/vite.svg'
- import './App.css'
- 
- function App() {
-   const [count, setCount] = useState(0)
- 
-   return (
-     <>
-       <div>
-         <a href="https://vitejs.dev" target="_blank">
-           <img src={viteLogo} className="logo" alt="Vite logo" />
-         </a>
-         <a href="https://react.dev" target="_blank">
-           <img src={reactLogo} className="logo react" alt="React logo" />
-         </a>
-       </div>
-       <h1>Vite + React</h1>
-       <div className="card">
-         <button onClick={() => setCount((count) => count + 1)}>
-           count is {count}
-         </button>
-         <p>
-           Edit <code>src/App.tsx</code> and save to test HMR
-         </p>
-       </div>
-       <p className="read-the-docs">
-         Click on the Vite and React logos to learn more
-       </p>
-     </>
-   )
- }
- 
- export default App
```

Nous définirons une constante `App` qui sera une fonction anonyme et qui retournera un simple élément HTML `h1` et contiendra le texte `Hello World`.
Ensuite si on regarde le type de la constante `App` nous pouvons voir qu'elle est de type `() => JSX.Element`, ce qui est vrai mais assez inexact. Si nous réfléchissons bien à notre composant, c'est un **composant fonctionnel**, appelé `functional component` (ce qui rentre en opposition avec les `class component` qui sont des composants React sous forme de classes Javascript).  

Pour typer un composant fonctionnel React, nous pouvons utiliser le templating suivant
```typescript
const MyComponent: React.FC = () => {
  // ...
};
```

Nous utilisons `React.FC` qui est un type fourni par la librairie ReactJS, 

Cependant, nous avons vu dans les TP précédents que nous pouvions passer des propriétés à nos composants. Si nous essayons de récupérer une propriété content à notre composant `App`, nous obtiendrons l'erreur suivante:  
`Property 'content' does not exist on type '{}'.ts(2339)`

Pour palier à ce soucis, nous allons expliciter les propriétés de notre composant `App`. Le type `FC` est un type générique, en Programmation Orientée Object (POO), la généricité est un concept permettant de définir des algorithmes (types de données et méthodes) identiques qui peuvent être utilisés sur de multiples types de données, c'est une forme de polymorphisme. Le type FC prend en paramètre les props du composant.
En typescript, la définition de type de notre type générique se fait de la manière suivante, avec les chevrons:
```typescript
FC<OUR_TYPE>
```

Pour déclarer un type en typescript nous utilisons le mot clé `type` suivi du nom du type que l'on veut créer et on assigne un objet qui contient cette déclaration de type.
```typescript
type MyType = {
  property_one: string;
  optional_property?: number;
  complex_property: MyOtherType;
  complex_property_2: {
    subProperty: string;
  }
  function_property: (u: string) => void;
}
```
Nous pouvons aussi déclarer un type comme étant une énumération de string par exemple
```typescript
type MyEnum = 'first' | 'second' | 'third'

const myEnum: MyEnum = 'second' // seules les valeurs first, second, third peuvent être assignées à un objet de type MyEnum
```

Ceci étant expliqué, à vous de typer le composant fonctionnel `App` pour qu'il reçoive un paramètre `content` obligatoire de type `string`.

En sauvegardant, une erreur survient dans le fichier `main.tsx` puisqu'il faut passer la propriété `content` à notre composant appelé. Résolvez cette erreur.

### Utilisation de tailwindcss dans nos composants
Comme expliqué plus tôt, nous utiliserons tailwindcss pour styliser nos composants. Ajoutons la classe `bg-red-500`, la couleur de fond de notre titre devrait être rouge.

### Création des atomes
Nous allons supprimer le contenu de notre composant `App` ainsi que la déclaration de ses props et retourner `null`

Voici la liste des éléments atomiques avec leurs api respectives (déclaration de leurs propriétés):  
**H1**  
– `classname`: string, optionnel  
– `content`: string

**H2**  
– `classname`: string, optionnel  
– `content`: string

**Icon**  
– `classname`: string, optionnel  
– `name`: AllowedIcon (type déclaré par vos soins, ce sera une énumération de chaînes de caractères)
Les icônes utiliseront la librairie `heroicons`

**Button**  
– `children`: ReactNode (possibilité d'utiliser le type générique `PropsWithChildren`)
– `classname`: string, optionnel  

**Image**  
– `classname`: string, optionnel  
– `src`: string

**Link**  
– `classname`: string, optionnel  
– `to`: string
– `children`


### Création des molécules

Voici la liste des molécules avec leurs api respectives (déclaration de leurs propriétés):  
**Card**  
– `classname`: string, optionnel  
– `title`: string (rendu dans un H2)  
– `children`
Il rendra le titre et haut et les children

**Counter**  
– `classname`: string, optionnel  
– `counter`: number
– `icon`: AllowedIcon, optionnel
– `increment`: number (étape d'incrémentation, +1, +2, +x, -y), optionnel, défaut +1
– `onClick`: callback avec en paramètre le nouveau nombre de clic
Il rendra un bouton avec une icône à gauche (si l'icône est définie), et le nombre de clic effectué à droite

**Reset**  
– `classname`: string, optionnel  
– `onClick`: callback
Il rendra un outlined button rouge avec  l'icône de la poubelle à gauche, et le texte `reset` à droite.

Vous êtes libre de créer davantage de composants et d'ajouter les props que vous jugerez nécessaires aux différents composants.

### Layout

**Navbar**
La navbar devra avoir une image sur la gauche qui sera un logo, et des liens sur la droite (rendre la navbar responsive n'est pas requis)

**Footer**
Le footer devra avoir un copyright au centre, des liens à droite (liens simples ou avec des icônes, au choix), une adresse à gauche

**Body**
Le composant body devra être un conteneur centré horizontalement avec un padding `8`

### Page
Nous créerons un fichier `home.tsx` dans le dossier `page`. Le composant `Home` se contentera d'afficher dans cet ordre
– La barre de navigation.
– Le contenu avec un titre de niveau 1 qui affichera `Cliquons sur les boutons`, des compteurs (nous en voulons 3) disposés à l'horizontal, un texte de niveau 2 qui affichera `Vous avez cliqué {nombre total de clic} fois.` uniquement si l'utilisateur a cliqué au moins une fois, `En attente de votre clic` sinon.
– Le bas de page.
Pour se faire, le composant `Home` aura la responsabilité de gérer l'état des compteurs au travers d'un contexte React.

### Voici le résultat escompté
![Premier rendu](/images/typescript-course.fr.render.1.png)
![Deuxième rendu](/images/typescript-course.fr.render.2.png)

### Aller plus loin dans le typage
Comme nous l'avons vu, nous pouvons typer les objets et utiliser des types génériques pour expliciter l'instance en cours, mais comment faire pour créer nos propres types génériques ?  
Partons du principe que vous voulez typer le contenu d'une réponse HTTP après votre parsing de JSON. Nous pouvons avoir un artiste, un album et une musique, mais nous pouvons aussi avoir ces objets en version liste (get many).
Nous aurons donc cette déclaration de type simpliste en ne faisant qu'une relation descendante et non bidirectionnelle.
```typescript
type Artist = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  albums: Album[];
}

type Album = {
  id: string;
  name: string;
  releasedAt: Date;
  tracks: Track[];
}

type Track = {
  id: string;
  name: string;
}
```

Nous pouvons déjà améliorer la déclaration de types en passant nos `Type[]` en `ReadonlyArray<Type>` car nos tableaux seront immutables et donc en lecture seules.  
Ensuite nous pouvons nous rendre compte que les propriétés `id` et `name` sont redondantes.  

Essayez par vous-mêmes d'améliorer la déclaration de types ci-dessus.  
Pour ceux qui veulent voir la solution ou se corriger, le code attendu est disponible en dessous.

```typescript
type IdProperty = { id: string };
type NameProperty = { name: string };

type Artist = IdProperty & NameProperty & {
  username: string;
  firstname: string;
  lastname: string;
  albums: Album[];
};

type Album = IdProperty & NameProperty & {
  releasedAt: Date;
  tracks: Track[];
};

type Track = IdProperty & NameProperty;
```

Nous pourrions aussi faire un seul type commun pour `id` et `name`

```typescript
type SingleResource = {
  id: string;
  name: string;
};

type Artist = SingleResource & {
  username: string;
  firstname: string;
  lastname: string;
  albums: Album[];
};

type Album = SingleResource & {
  releasedAt: Date;
  tracks: Track[];
};

type Track = SingleResource;
```

Cependant, nous aimerions tout de même créer un type générique qui prendrait en paramètre les données à étendre.  
Nous allons donc définir notre type `SingleResource` comme étant générique, avec les `<>`
```typescript
type MyGenericType<T = object> = {
  genericProperty: T
}

type MyOtherGenericType<T = object> = {
  commonProp: string;
} & T
```

La déclaration ci-dessus déclare un type générique qui prend en paramètre une valeur, par défaut cela sera un objet vide. En appliquant la généricité sur notre SignleResource voici ce que ça donnerait

```typescript
type SingleResource<T = object> = {
  id: string;
  name: string;
} & T;

type Artist = SingleResource<{
  username: string;
  firstname: string;
  lastname: string;
  albums: Album[];
}>;

type Album = SingleResource<{
  releasedAt: Date;
  tracks: Track[];
}>;

type Track = SingleResource;
```

Enfin, essayez de typer avec les génériques la partie ListResource pour `Artist`, `Album`, `Track` (qui se base du retour HTTP d'un get many sur une api platform, donc avec l'hydratation hydra).

### Aller plus encore plus loin
Recodez le TP 2 en Typescript.
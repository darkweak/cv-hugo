---
name: Cours Angular
image: https://sylvaincdn.000webhostapp.com/devcv/blog/traefik.png
date: 2024-02-06
---

> The framework for building scalable web apps with confidence · Productivity meets scalability · When performance matters.
>
> —<https://angular.dev>

### Démarrage du projet Angular

Rendez-vous dans votre dossier préféré et lancez les commandes suivantes pour installer le framework Angular CLI et créer le projet

```bash
npm install -g @angular/cli
ng new climber-dashboard
```

Activez ou non l'autocomplétion, n'activez pas la télémétrie (sauf si vous voulez envoyer vos données chez Google).  
Sélectionnez le style `TailwindCSS`, désactivez le SSR/SSG (ça rajoutera trop de complexité, mais pour la connaissance, voici [une doc sur le SSR/SSG](https://laconsole.dev/blog/differences-ssr-csr-ssg)).  
N'activez pas d'agents (sélectionnez None), on est là pour apprendre, pas pour expédier le sujet et prenez un café le temps de l'installation des différentes ressources.  
Enfin, une fois que tout est installé, il suffit de se rendre dans le dossier du projet et lancer `npm run start`.

```bash
cd climber-dashboard
npm run start
```

Rendez-vous sur [localhost:4200](http://localhost:4200) pour voir votre page.

### Architecture et dépendances du projet

Tout d'abord nous passer en revue les différents dossiers/fichiers importants du projet.

```md
climber-dashboard
├── src
│ ├── app
│ │ ├── app.config.ts
│ │ ├── app.css
│ │ ├── app.html
│ │ ├── app.routes.ts
│ │ └── app.ts
│ ├── index.html
│ ├── main.ts
│ └── styles.css
├── .postcssrc.json
├── angular.json
├── ...
└── tsconfig.json
```

- - `src` contient le code source de notre application.
- - `src/index.html` est le fichier HTML principal de notre application, c'est la coquille vide qui servira à charger notre application dans sa balise `<app-root>`, c'est l'équivalent de la `div#root` dans un projet React.
- - `src/main.ts` est le fichier principal de notre application, c'est dans ce fichier que nous pourrons configurer le bundler si nécessaire (nous n'en avons pas besoin dans ce projet, mais c'est toujorus bon à savoir qu'il existe).
- - `src/styles.css` est le fichier CSS principal de notre application, il va charger tailwindcss.
- - `src/app/app.config.ts` est le fichier de configuration de notre application, il va se charger de définir le routeur, gérer les erreurs/panic, c'est le cerveau de notre application.
- - `src/app/app.html` est le fichier HTML de base de notre application, c'est l'équivalent de la `index.html` dans un projet React ou du `base.html.twig` dans un projet Symfony.
- - `src/app/app.routes.ts` va contenir la liste des routes de notre application.
- - `src/app/app.ts` est notre entrypoint, il correspond au `App.jsx` dans un projet React.
- - `.postcssrc.json` est le fichier de configuration de postcss, ce qui servira à minifier le CSS et ne garder que les classes nécessaires.
- - `angular.json` définit des règles de build, des dépendances (le fichier CSS final à importer par exemple), quel gestionnaire de package nous utiliserons (npm, pnpm ou yarn).

Comme vous vous en doutez, le dossier qui nous intéresse le plus est le dossier `src`.

Nous allons mettre à jour notre fichier `tsconfig.json` avec cette configuration de `compilerOptions`:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    // ...
    "module": "preserve",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
    // ...
```

Cela va nous permettre d'avoir des paths plus sympathiques et surtout absolus plutôt que des paths relatifs.

## Structure des dossiers

Les différents dossiers vont nous permettre de s'y retrouver plus simplement dans notre application.
Le dossier `app/components` contiendra tous nos composants (purs et des aggrégats).

- `atomic` contiendra nos composants atomiques, c'est à dire ceux qui ne font que de l'affichage simple (exemple: un composant `H1` qui aura une propriété title et qui se contentera de rendre un élément HTML `h1` avec son contenu). Il faut les garder les plus purs possible.
- `molecule` contiendra nos composants composés de plusieurs atomes (`atomic`) et/ou de molécules afin de rendre un composant plus complexe (exemple: un composant `Card` qui rendra une `div` avec pour enfant un composant `Image` un composant `H1` et un composant `Badge`).
- `layout` contiendra les éléments complexes de mise en page, comme par exemple la `Navbar`, `Footer`, `Body` (pour mettre du padding automatiquement au contenu entre la `Navbar` et le `Body` par exemple).

Afin de séparer les préoccupations (separation of concerns), nous allons découpler la partie logique de la partie rendu de nos composants. Pour se faire, le dossier components ne contiendra que les fichier de logique (fichiers .ts) et nous créerons un dossier `app/templates` qui aura la même architecture que components mais ne contiendra que les fichier de template .html.

Nous créerons aussi un dossier `pages` qui contiendra nos pages qui s'appuieront sur les éléments de `layout`, ceux de `molecule` et parfois aussi sur des composants `atomic` (cas très rares) et pourra rajouter de la logique dans la page directement si besoin. La structure du dossier ressemblera à la suivante:

```md
climber-dashboard
├── src
│ ├── app
│ │ ├── pages
│ │ │ ├── {page_name}
│ │ │ │ ├── {page_name}.css
│ │ │ │ ├── {page_name}.html
│ │ │ │ └── page.ts
```

Enfin, nous créerons un dossier `src/routes`, et le fichier `src/routes/index.ts`. Ce fichier nous servira à exporter nos routes en les aggrégeant dans un unique tableau et nous créerons par la suite différents fichiers selon les différents domaines de notre application.

Cela va nous permettre de comprendre la liaison entre les différents fichiers et éviter de penser que angular fait de la magie. Cela sera un peu plus contraignant au début mais plus extensible et modulaire pour la suite.
Vous remarquerez que nous aurons à la fois le fichier .ts et aussi le fichier .html dans le même dossier, il est préférable pour les pages d'avoir les templates et la logique rassemblé pour des questions de DX (developer experience) mais vuos pouvez tout à fait les séparer.

## Routing et création de notre premier composant

Maintenant que nous avons posé les bases et l'architecture, attaquons-nous à notre premier composant. Le cas le plus complet sera de faire un navlink (lien de navigation de navbar). Pour se faire, nous allons devoir éditer le décorateur de notre `app.ts`.
Un décorateur (matérialisé par le sigil `@`, ici `@Component`) est une fonction pouvant être placée sur une classe, une fonction, une propriété afin de rajouter un comportement supplémentaire sans devoir étendre ou redéfinir la classe. Cela permet aussi de centraliser la logique au décorateur et donc d'éviter la duplication de code.

```ts
@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  protected readonly title = signal("climber-dashboard");
}
```

Ici nous indiquons à Angular que `App` sera un composant, que l'on pourra y accéder et le rendre dans les templates via le sélecteur `app-root`. Nous indiquons également que ce composant a besoin du routeur d'angular `RouterOutlet`, il utilisera le template `app.html` qui se trouve dans le même dossier et le fichier de style `app.css`.

On remarque aussi le

```ts
protected readonly title = signal('climber-dashboard');
```

Grâce à ça, nous pouvons modifier le titre de la page (le titre de l'onglet) en envoyant un `signal` pour le changer ce qui correspond à un `CustomEvent` natif de javascript ou un `setState` en React.

Nous allons changer le template url afin de respecter notre architecture souhaitée.

```diff
-  templateUrl: "./app.html",
+  templateUrl: './templates/layout/app.html',
```

Et dans `templates/layout/app.html` nous mettrons le contenu suivant:

```html
<main>
  <nav class="flex justify-between">
    <header class="brand-name">ClimberDashboard</header>
    <div class="flex gap-4"></div>
  </nav>
  <section class="content"></section>
</main>
```

Cela nous permettra d'avoir une navbar et de faire notre premier composant. Nous pouvons donc maintenant supprimer le fichier `src/app/app.html`.

Pour commencer, nous allons créer deux pages, la `Home` et `Details` qui serviront à découvrir le routing entre deux pages Il faudra créer les deux dossiers dans `pages` comme expliqué précédemment. Chaque page exportera un composant, avec comme sélecteur `page-{page_name}` (e.g. `page-home`), et utilisera le template HTML dans le même dossier.
Voici un template d'exemple

```ts
import { Component } from "@angular/core";

@Component({
  selector: "app-{page_name}",
  imports: [],
  templateUrl: "./{page_name}.html",
})
export class ComponentPageName {}
```

Il faudra aussi créer un fichier `index.ts` dans `src/pages`, ce sera ce fichier qui sera en charge d'exporter les différentes pages et cela permettra d'importer directement nos pages en utilisant `import {...} from @/app/pages` plutôt que `import {...} from @/app/pages/{page_name}/page` ce qui est un peu plus sympa et permet d'importer plusieurs pages d'un coup.

Voici ce que nous mettrons dans le `index.ts`:

```ts
export * from "./details/page";
export * from "./home/page";
```

Le `index.ts` sera juste un proxy pour rerouter les imports vers les bonnes dépendances.

Nous allons ensuite pouvoir supprimer le fichier `src/app/app.routes.ts`, et ajouter un fichier `base.ts` dans `src/routes` et y définir un tableau de routes qui sera exporté qui contiendra nos 2 routes. Voici l'exemple pour la route `home`

```ts
  {
    path: '',
    component: Home,
    title: 'Homepage',
  },
```

Le composant Home sera importé depuis `@/app/pages`, nous définissons le titre de la page à `Homepage`.
N'hésitez pas à jouer avec les propriétés pour vraiment comprendre les implications de ces dernières.

Une fois que nos routes sont définies dans `base.ts`, nous allons les importer dans `routes/index.ts` puis exporter un tableau de routes.

```ts
import { routes as baseRoutes } from "@/routes/base";

export default [...baseRoutes];
```

Enfin, il faudra importer ce tableau de routes dans `app.config.ts`, remplacer l'ancien import de routes par celui-ci:

```ts
import routes from "@/routes";
```

Enfin, dans `app/pages/{page_name}/{page_name}.html` nous allons mettre `<p>{the page name} works!</p>` en remplaçant le placeholder `{the page name}` par le nom de la page (e.g. `<p>Homepage works</p>`).

Maintenant nous pouvons vérifier que l'URL `http://localhost:4200` affiche ClimberDashboard et `http://localhost:4200/details` aussi. Cependant en allant sur `http://localhost:4200/inexistant`, vous remarquerez une redirection vers `/` car la route est introuvable.

Pour afficher le contenu de `details` et `home`, nous allons devoir insérer le composant `router-outlet` dans notre template `templates/layout/app.html` dans le `section.content`.

```html
<section class="content">
  <router-outlet />
</section>
```

Cela permet maintenant à Angular de rendre nos routes dans la section. Si vous allez sur `http://localhost:4200` vous verrez `Home works!` et sur `http://localhost:4200/details` vous verrez `details works!`

Maintenant que nous avons un routing fonctionnel, nous pouvons ajouter les navlink. Comme cette fonctionnalité est présente dans le core d'Angular, nous pouvons utiliser dans notre template HTML la balise `a` un peu glorifiée `<a [routerLink]="/somewhere">My link</a>`. Cependant en collant directement cette balise votre IDE ou votre navigateur doit afficher une erreur car nous n'avons pas dit à notre composant App d'utiliser les `RouterLink`. Sans cela, nos lien seraient des liens HTML classiques sans la propriété routerLink propre à Angular et donc rechargerait complètement toute la page (comme le fait un a href classique).
Nous ajoutons donc le composant `RouterLink` à notre tableau d'import dans le composant `App`.

Enfin, nous pourrions ajouter plusieurs links comme par exemple:

```html
<a [routerLink]="['/']">Home</a>
<a [routerLink]="['/details']">
  <header class="brand-name">Details</header>
</a>
```

Mais cela sera plutôt contraignant car si nous voulons ajouter des classes CSS il faudra les dupliquer sur chaque lien. Nous aimerions plutôt avoir un composant pouvant être utilisé de cette façon:

```html
<navlink label="Home" path="/" />
```

Nous allons donc créer un composant `Navlink`:

- `components/atomic/navlink.ts` qui contiendra le composant
- `templates/atomic/navlink.html` qui contiendra la vue du composant

Pour le composant, nous aurons la configuration suivante:

```ts
import { Component, ElementRef } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "navlink",
  templateUrl: "../../templates/atomic/navlink.html",
  imports: [RouterLink],
})
export class Navlink {
  label: string;
  path: string;

  constructor(private elementRef: ElementRef) {
    this.label = this.elementRef.nativeElement.getAttribute("label");
    this.path = this.elementRef.nativeElement.getAttribute("path");
  }
}
```

Grâce à ça, lorsque notre template va utiliser `navlink`, il pourra passer des propriétés `label` et `path` qui seront utilisées dans la vue du composant comme ci-dessous

```html
<a [routerLink]="[path]" class="underline">{{ label }}</a>
```

Vous noterez `[routerLink]` qui est une propriété interprétée et va faire un join sur tous les éléments du tableau. La variable `path` est injectée via le `this.path` du composant. Vous pouvez donc accéder à toutes les propriétés publiques du composant (`label` et `path`). Enfin, pour rendre une variable dans le template, nous utilisons la syntaxe mustache `{{ ... }}`.

Grâce à cela, nous pouvons utiliser dans notre app.html:

```html
<div class="flex gap-4">
  <navlink label="Home" path="/" />
  <navlink label="Details" path="/details" />
</div>
```

Sauf qu'en faisant cela, notre composant `App` n'a pas connaissance du composant `Navlink`, il faut donc l'ajouter au tableau d'imports.

### Récupération de données

Maintenant que nous savons comment rendre un composant custom, voyons comment requêter une API et afficher la donnée dans l'application.

---
name: Du cache pour vos applications : oui et sans Varnish
link: https://devfest.gdgstrasbourg.fr
date: 2021-11-09
place: 234 Avenue de Colmar
city: Strasbourg
postcode: 67100
image: https://devfest.gdgstrasbourg.fr/images/logos/logo_tigre_date_2021.png
---

Nous faisons tous aujourd’hui des services exposés - sur le web ou en interne - pour des clients. Pour la plupart il s’agit d’APIs, des interfaces pour récupérer ou gérer des données via des requêtes HTTP. Dans la majorité des cas nous servons le même contenu à maintes reprises et exécutons le code autant de fois que nécessaire. Avec l’arrivée des APIs et du stateless (avec Nodejs, PHP par exemple) cette exécution serait inévitable du fait que comme l’indique le principe il n’y a pas d’état sauvegardé entre les requêtes. Pour palier à cela nous pouvons implémenter du cache à plusieurs niveaux. Du cache applicatif, du cache HTTP devant notre service, et aussi du cache directement au niveau du reverse-proxy pour de meilleures performances.

Quand nous parlons de cache, nous pensons directement à Varnish, avec le fameux VCL que cela implique. Mais il existe d’autres solutions pour ne pas passer plusieurs jours à apprendre ce langage, qui sont plus facilement configurables et tout aussi performants.

Voyons ensemble comment mettre en place ces solutions avec leurs avantages et leurs inconvénients lors de cette conférence. 

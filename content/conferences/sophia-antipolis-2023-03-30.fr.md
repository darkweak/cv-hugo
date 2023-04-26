---
Name: Quoi de neuf dans le monde du cache HTTP
link: https://rivieradev.fr
publishDate: 2023-04-11
date: 2023-07-11
place: Sophia-Antipolis, Skema Business School, 60 Rue Fedor Dostoïevski
city: Valbonne
postcode: 06902
image: https://rivieradev.fr/public/images/photos/2018.webp
---

Depuis HTTP 1.1, nous avons accès au header Cache-Control pour gérer tout le cheminement de la mécanique de cache. Nous pouvons avoir une réponse considérée comme pouvant être servie malgré son état considéré comme n'étant pas assez frais. Obtenir une réponse moins fraîche si une erreur lors du contact avec le serveur survient ou dire de ne pas servir la réponse cachée si elle est stockée depuis plus de X secondes. Nous avons vu aussi l'apparition du header Age en accord avec la directive TTL dans des en-têtes de réponse afin de donner l'information à l'utilisateur depuis quand et pour encore combien de secondes la réponse sera conservée en cache. Il y a eu aussi le retrait des headers préfixés par X- dans la specification au profit des standards. Quelques compagnies on essayé d'ajouter à la norme des headers et des comportements pour les serveurs de bord mais cela sans succès. Lors du développement HTTP/2 et HTTP/3, il y a eu énormément de RFC soumises pour ajouter de nouveaux standards pour gérer le cache HTTP, grouper les clés de cache, ajouter de nouveaux headers. Voyons ensemble les améliorations et les nouvelles fonctionnalités qui peuvent être utilisées pour gérer le cache HTTP.
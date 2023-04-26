---
Name: What’s next in the HTTP caching world
link: https://rivieradev.fr
publishDate: 2023-04-11
date: 2023-07-11
place: Sophia-Antipolis, Skema Business School, 60 Rue Fedor Dostoïevski
city: Valbonne
postcode: 06902
image: https://rivieradev.fr/public/images/photos/2018.webp
---

Since HTTP 1.1, we have the Cache-Control HTTP header to manage the cache flow mechanism. You can get a stale response if an error occurs, get a cached response only if it’s a maximum X seconds old. We saw the Age header in addition to the TTL directive in the response, and the X- prefixed response headers in favor to standards. Some companies tried to add other caching and edge-side servers behaviors without success (e.g. the ESI tags). During the HTTP/2 and HTTP/3 developments, there was a lot of draft RFC to add more standards on the servers to handle the cache, be able to group cache keys, add newer HTTP response headers. See together the improvements and the new features that can be used to deal with the HTTP cache.
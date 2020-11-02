// https://github.com/sarmis/greekdev-template-vue-spa/blob/master/src/web/service-worker.js
// import service worker script
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js"
);

// Network First
[
  "/$", // Index
  "/*", // Anything in the same host
  ".+/*", // Anything in any host
].forEach((mask) => {
  workbox.routing.registerRoute(
    new RegExp(mask),
    new workbox.strategies.NetworkFirst({
      cacheName: "dynamic",
    })
  );
});

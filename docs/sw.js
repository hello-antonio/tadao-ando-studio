// https://github.com/sarmis/greekdev-template-vue-spa/blob/master/src/web/service-worker.js
// import service worker script
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js"
);

// Network First
[
  "/docs/$", // Index
  // "/$", // Index
  "/docs/*", // Anything in the same host
  "/docs/.+/*", // Anything in any host
].forEach((mask) => {
  workbox.routing.registerRoute(
    new RegExp(mask),
    new workbox.strategies.NetworkFirst({
      cacheName: "dynamic",
    })
  );
});

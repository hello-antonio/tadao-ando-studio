importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js"
);
// https://thecalicoder.github.io/tadao-ando-site/index.html
// Network First
[
  "/tadao-ando-site/$", // Index
  "/tadao-ando-site/*", // Anything in the same host
  "/tadao-ando-site/.+/*", // Anything in any host
].forEach((mask) => {
  workbox.routing.registerRoute(
    new RegExp(mask),
    new workbox.strategies.NetworkFirst({
      cacheName: "dynamic",
    })
  );
});

var version = "app-v1";
var filesToCache = [];

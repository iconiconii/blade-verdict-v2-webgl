const CACHE_NAME = "blade-verdict-v2-webgl-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/Build/WebGL.data")) {
    event.respondWith((async () => {
      const parts = await Promise.all([
        fetch("Build/WebGL.data.part1"),
        fetch("Build/WebGL.data.part2")
      ]);
      if (!parts.every(response => response.ok)) {
        throw new Error("Unable to load WebGL data parts");
      }
      const buffers = await Promise.all(parts.map(response => response.arrayBuffer()));
      const merged = new Uint8Array(buffers[0].byteLength + buffers[1].byteLength);
      merged.set(new Uint8Array(buffers[0]), 0);
      merged.set(new Uint8Array(buffers[1]), buffers[0].byteLength);
      return new Response(merged, {
        headers: { "Content-Type": "application/octet-stream" }
      });
    })());
  }
});

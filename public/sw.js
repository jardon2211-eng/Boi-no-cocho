// Service worker mínimo: não faz cache de nada (os dados do app são sempre
// dinâmicos e dependem de login), ele só precisa existir e estar ativo para
// que o navegador ofereça a opção de "instalar" o app na tela inicial.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Deixa toda requisição seguir normalmente pela rede (sem cache).
self.addEventListener("fetch", () => {});

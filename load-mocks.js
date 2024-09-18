console.info("Mock server loading...");
(async () => {
  await import('./mocks/index.js');
  console.info("Mock server loaded");
})();

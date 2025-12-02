export default defineNuxtPlugin(() => {
  // Inject critical CSS inline in head for SSR to prevent FOUC
  useHead({
    style: [
      {
        innerHTML: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

html {
  background: #0a0a0a;
}

body {
  color: #fdfdfd;
  background: #0a0a0a;
  position: relative;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
*::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

* {
  scrollbar-width: none !important;
}

#app {
  min-height: 100vh;
  opacity: 1;
}

.js-ready #app {
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.js-ready #app.app-loaded {
  opacity: 1;
}`,
        tagPriority: 'critical'
      }
    ]
  })
})

import{V as o,bI as p,bJ as u,bK as l,bL as c,bM as f,bN as d,bO as b,bP as m,bQ as h,bR as A,Y as g,d as P,u as _,k as v,y as R,bS as y,bT as w,bU as C,bV as E}from"./chunks/framework.D3rKSoAR.js";import{R as T}from"./chunks/theme.-HxWPvWl.js";function i(e){if(e.extends){const t=i(e.extends);return{...t,...e,async enhanceApp(a){t.enhanceApp&&await t.enhanceApp(a),e.enhanceApp&&await e.enhanceApp(a)}}}return e}const s=i(T),S=P({name:"VitePressApp",setup(){const{site:e,lang:t,dir:a}=_();return v(()=>{R(()=>{document.documentElement.lang=t.value,document.documentElement.dir=a.value})}),e.value.router.prefetchLinks&&y(),w(),C(),s.setup&&s.setup(),()=>E(s.Layout)}});async function V(){globalThis.__VITEPRESS__=!0;const e=L(),t=D();t.provide(u,e);const a=l(e.route);return t.provide(c,a),t.component("Content",f),t.component("ClientOnly",d),Object.defineProperties(t.config.globalProperties,{$frontmatter:{get(){return a.frontmatter.value}},$params:{get(){return a.page.value.params}}}),s.enhanceApp&&await s.enhanceApp({app:t,router:e,siteData:b}),{app:t,router:e,data:a}}function D(){return m(S)}function L(){let e=o,t;return h(a=>{let n=A(a),r=null;return n&&(e&&(t=n),(e||t===n)&&(n=n.replace(/\.js$/,".lean.js")),r=g(()=>import(n),[])),o&&(e=!1),r},s.NotFound)}o&&V().then(({app:e,router:t,data:a})=>{t.go().then(()=>{p(t.route,a.site),e.mount("#app")})});export{V as createApp};
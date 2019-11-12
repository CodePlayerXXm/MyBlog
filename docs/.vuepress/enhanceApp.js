/**
 * Client app enhancement file.
 *
 * https://v1.vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
 */
import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
// import createPersistedState from "vuex-persistedstate";

const debug = process.env.NODE_ENV !== "production";

// const createPersisted = createPersistedState({
//   storage: window.sessionStorage
// });

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  // ...apply enhancements for the site.
  Vue.use(Element);
  Vue.use(Vuex);
  const state = {
    selectedTag: null
  };

  // const modules = {};

  const mutations = {
    selectTag(state, lang) {
      console.log(window);

      state.selectedTag = lang;
    }
  };

  // const actions = {
  //   changeLang({ commit }, path) {
  //     const lang = path === "/" ? "jp" : "en";

  //     commit("changeLang", lang);
  //   }
  // };

  const store = new Vuex.Store({
    state,
    // modules,
    mutations,
    // actions,
    strict: debug,
    plugins: debug ? [createLogger()] : []
    // plugins: [createLogger(), createPersisted]
  });
  Vue.mixin({
    store
  });
};

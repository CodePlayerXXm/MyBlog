/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
/*
* 引入必须vuex分层文件
* */
import createLogger from 'vuex/dist/logger';
import getters from './getter';
import * as actions from './action';
import state from './state';
import mutations from './mutaition';
import createPersistedState from "vuex-persistedstate"
/*
* 引入开发环境 vuex debug 插件
* */

const debug = process.env.NODE_ENV !== 'production';

const createPersisted = createPersistedState({
  storage: window.sessionStorage
})
/*
* 加载 vuex
* */
Vue.use(Vuex);
/*
* 1.mutations_type 定义字面量
* 2.state 定义数据
* 3.actions 获取（异步）数据，处理获取的数据，通过 commit 修改数据,
* 4.通过 dispatch 触发 action 实现 commit , store.dispatch('getUserInfo')
* 5.mutations 定义 commit 的方法及接收参数
* 6.getter 获取数据的方法，getter 中可以进一步处理数据
*------------------------------------------------------
* vue 中 import { mapGetters, mapActions } from "vuex";
* computed 展开 ...mapGetters(["user"])
* methods 展开 ...mapActions(["getUserInfo"])
* methods 调用 this.$store.dispatch("getUserInfo");
* */
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: debug,
  // plugins: debug ? [createLogger(),createPersisted] : [createPersisted],
  plugins: [createLogger(),createPersisted],
});

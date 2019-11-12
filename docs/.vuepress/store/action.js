/*
 * 引入接口文件，$api.urls
 * 引入Ajax工具 $http()
 * 引入字面量
 * */
import * as types from './mutaitions-type';
// import * as $api from "../config/api";
import $http from '../plugin/$http';
import plugin from '../plugin/plugins';
import router from '../router'
import * as mock from '../mock';

// const prd = process.env.NODE_ENV === 'production';
function getMenu(store){  // serve端
  $http({
    url:$api.menus+'?_='+Math.random(),
    method:'GET',
    success:res=>{
      let newRouter = [];
      res.data.main.forEach((i) => {
        plugin.routerAdd(i,newRouter)
      });
      router.addRoutes(newRouter)
      store.commit('MENUS',res.data)
    }
  })
}

function getLocalMenu(store){ // 本地
  let newRouter = [];
  mock.menus.main.forEach(i=>{
    plugin.routerAdd(i,newRouter)
  })
  router.addRoutes(newRouter)
  store.commit('MENUS',mock.menus)
}
export const getMenus = (store) => {
    // getMenu()
    getLocalMenu(store)
};


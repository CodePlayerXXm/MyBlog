import * as types from './mutaitions-type';

/*
 * state => store.state
 * [commit Name](state,param2,...){
 * }
 * */

export default {
  [types.PAGENAMELIST](state, data) {
    state.pageNameList = data;
  },
  [types.MODENAMELIST](state, data) {
    state.modeNameList = data;
  },
  [types.CHANGETYPELIST](state, data) {
    state.changeTypeList = data;
  },
  [types.EXCHANGELIST](state, data) {
    state.exchangeList = data;
  },
  [types.HOMELIST](state, data) {
    state.homeList = data;
  },
  [types.BLACKLIST](state, data) {
    state.blackList = data;
  },
  [types.FREELIST](state, data) {
    state.freeList = data;
  },
  [types.ACTLIST](state, data) {
    state.actList = data;
  }
};

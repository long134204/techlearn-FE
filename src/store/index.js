import { createStore } from "vuex";
import axios from "axios";
import createPersistedState from "vuex-persistedstate";

const rootApi = process.env.VUE_APP_ROOT_API;

const store = createStore({
  state: {
    user: null,
    isLoggedIn: false,
    supportPoints: 0,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn;
    },
    setSupportPoints(state, points) {
      state.supportPoints = points;
    },
  },
  actions: {
    async fetchUser({ commit }) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        commit("setLoggedIn", true);
        try {
          const response = await axios.get(`${rootApi}/users/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response && response.data && response.data.result) {
            commit("setUser", response.data.result);
          } else {
            commit("setUser", null);
          }
        } catch (error) {
          commit("setUser", null);
          commit("setLoggedIn", false);
        }
      } else {
        commit("setLoggedIn", false);
        commit("setUser", null);
      }
    },
    async fetchSupportPoints({ commit }, userId) {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get(`${rootApi}/users/points`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          idUser: userId,
        },
      });

      if (response && response.data && response.data.result) {
        commit("setSupportPoints", response.data.result.points);
      }
    },
  },
  getters: {
    user: (state) => state.user,
    isLoggedIn: (state) => state.isLoggedIn,
    supportPoints: (state) => state.supportPoints,
  },
  plugins: [createPersistedState()],
});

export default store;

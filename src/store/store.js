import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    status: "",
    token: localStorage.getItem("token") || "",
    user: {}
  },
  mutations: {},
    actions: {
      login({commit}, user){
            return new Promise((resolve, reject) => {
        const url = "https://wims-mj.herokuapp.com/users/login";
      commit('auth_request')
                axios
                    .post(url, {
                        data: user
                    })
      .then(response => {
          const token = response.data.token;
          const user = response.data.user;
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = token;
          commit('auth_success', token, user);
          resolve(response);
      })
      .catch(err => {
        commit('auth_error')
        localStorage.removeItem('token')
        reject(err)
      })
    })

  },
  getters: {}
});

export default {
  getLoggedUserFromLocalStore() {
        return JSON.parse(localStorage.getItem("loggedUser"));
  }
};

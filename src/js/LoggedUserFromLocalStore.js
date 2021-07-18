export default {
  getLoggedUserFromLocalStore() {
    this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  }
};

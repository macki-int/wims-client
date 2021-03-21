<template>
<q-layout view="lHh Lpr lFf" container style="height: 100vh">
    <q-header elevated>
        <q-toolbar>
            <q-btn flat dense round icon="menu" aria-label="Menu" v-on:click="leftDrawerOpen = !leftDrawerOpen" />
            <q-toolbar-title>
                <q-btn v-if="auth == 'logged'" to="products" flat color="white" label="Produkty" no-caps />
                <q-btn v-if="auth == ''" to="login" flat color="white" label="Logowanie" no-caps />
                <q-btn v-if="auth == 'logged'" v-on:click="logout" flat color="white" label="Wyloguj" no-caps />
                <!-- <div>Wims v{{ $q.version }}</div> -->
            </q-toolbar-title>
            <div>
                <q-btn v-if="auth == 'logged'" flat label="Ustawienia" no-caps />
                <q-menu content-class="text-primary" inverted anchor="bottom left" self="top left">
                    <q-list style="min-width: 100px">
                        <q-item clickable v-on:click="showChangeUserPasswordDialog = true" v-close-popup>
                            <q-item-section>Zmiana hasła</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable to="users" v-close-popup>
                            <q-item-section>Admin</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </div>
        </q-toolbar>
    </q-header>
    <q-footer>
        <div class="q-ml-md text-caption">
            Zalogowany:
            <strong>{{
          loggedUser.firstName + " " + loggedUser.lastName
        }}</strong>
        </div>
    </q-footer>
    <template>
        <q-dialog v-model="showChangeUserPasswordDialog" persistent>
            <q-card style="min-width: 15vw">
                <q-card-section>
                    <div class="text-primary">Zmiana hasła</div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-input dense v-model="oldUserPassword" label="Aktualne hasło" type="password" :rules="[
                val => (val && val.length > 0) || 'Podaj aktualne hasło'
              ]" />
                    <q-input dense v-model="newUserPassword" label="Nowe hasło" type="password" :rules="[val => (val && val.length > 0) || 'Podaj nowe hasło']" />
                    <q-input dense v-model="newUserPassword2" label="Powtórz hasło" type="password" :rules="[
                val =>
                  newUserPassword === newUserPassword2 ||
                  'Hasła nie są identyczne'
              ]" />
                </q-card-section>
                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Anuluj" v-close-popup />
                    <q-btn flat label="Zapisz" v-on:click="updateUserPassword()" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </template>
    <q-drawer v-if="auth == 'logged'" v-model="leftDrawerOpen" min-width="10vw" show-if-above bordered content-class="bg-blue-8">
        <q-list ref="onUpdateProductTypeList">
            <q-item-label header class="text-white">KATEGORIA:</q-item-label>
            <ProductTypeMenuLink class="text-white" v-for="productType in productTypes" :key="productType.id" v-bind="productType" />
        </q-list>
        <div>
            <NewProductType />
        </div>
        <div class="q-mb-md q-ml-md fixed-bottom">
            <q-icon color="blue-3" size="30px" name="mood" v-on:click="showInfoDialog" />
        </div>
        <!-- TODO: add q-dialog info -->
    </q-drawer>

    <q-page-container>
        <q-page>
            <router-view />
        </q-page>
    </q-page-container>
</q-layout>
</template>

<script>
import ProductTypeMenuLink from "components/ProductTypeMenuLink.vue";
import NewProductType from "components/NewProductType.vue";
import axios from "axios";

export default {
    name: "MainLayout",

    components: {
        ProductTypeMenuLink,
        NewProductType,
    },

    mounted: function () {
        EventBus.$on("logged", user => {
            this.getLoggedUser(user);
            this.auth = "logged";
            // this.getLoggedUserFromLocalStore();
            this.getProductTypes();
        });

        if (localStorage.getItem("token")) {
            this.auth = "logged";
            this.getLoggedUserFromLocalStore();
            this.getProductTypes();
        };

        this.$root.$on("logout", (item, response) => {
            this.logout();
        });
    },

    destroyed: function () {
        EventBus.$off("logged");
        EventBus.$off("logout");
    },

    data() {
        return {
            leftDrawerOpen: false,

            showChangeUserPasswordDialog: false,
            oldUserPassword: "",
            newUserPassword: "",
            newUserPassword2: "",

            loggedUser: {
                username: "",
                firstName: "",
                lastName: "",
                role: "",
                active: ""
            },

            productTypes: [],
            auth: ""
        };
    },

    methods: {
        getLoggedUser: function (user) {
            const url = this.$API_URL + "users/logged/" + user;

            return axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.loggedUser = {
                        username: response.data.username,
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        role: response.data.role,
                        active: response.data.active
                    }
                    localStorage.setItem("loggedUser", JSON.stringify(this.loggedUser));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania informacji o zalogowanym użytkowniku",
                        icon: "report_problem",
                    });
                });

        },

        getProductTypes: function () {
            const url = this.$API_URL + "product-types";

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.productTypes = response.data;
                    // console.log('response: ' + JSON.stringify(response.data));
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                        // this.logout();
                    } else if (error.response.status === 500) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Strona nie istnieje",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                        // this.logout();
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd pobierania kategorii",
                            icon: "report_problem",
                        });
                    };
                });
        },

        updateUserPassword: function () {
            const url = this.$API_URL + "users/password";

            axios
                .patch(url, {
                    newPassword: this.newUserPassword,
                    oldPassword: this.oldUserPassword
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Hasło zostało zmienione",
                        icon: "check_circle_outline",
                    });
                    this.getUsers();
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login");
                        // this.logout();
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd zmiany hasła",
                            icon: "report_problem",
                        });
                    };
                });
        },

        showInfoDialog: function () {
            this.$q
                .dialog({
                    title: "<span class=text-primary><strong>WIMS</strong> v0.05(beta)",
                    message: "<span class=text-primary><strong> Warehouse Inventory Management System</strong>" +
                        "<br>" +
                        "TROLL-Systems Marek Janicki (C)" +
                        "<br>" +
                        "<br>" +
                        "<div class=text-caption> Zalogowany: <strong>" + this.loggedUser.firstName + " " + this.loggedUser.lastName + "</strong>" +
                        "<br>" +
                        " Uprawnienia: <strong>" + this.loggedUser.role + "</strong></div></span>",
                    html: true,
                })
        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        },

        logout: function () {
            this.auth = "";
            this.loggedUser = "";
            localStorage.clear();
            // location.reload();
            this.$q.notify({
                color: "positive",
                position: "top",
                message: "Wylogowano",
                icon: "check_circle_outline",
            });
            this.$router.push("/");
        }
    },
};
</script>

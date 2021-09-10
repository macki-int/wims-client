<template>
<q-layout view="lHh Lpr lFf" container style="height: 100vh">
    <q-header elevated>
        <q-toolbar>
            <q-btn flat dense icon="menu" aria-label="Menu" v-on:click="leftDrawerOpen = !leftDrawerOpen">
                <q-tooltip content-class="bg-blue-8">Panel boczny</q-tooltip>
            </q-btn>
            <q-toolbar-title>
                <q-btn flat dense v-if="auth == 'logged'" to="products" color="white" label="Produkty" no-caps />
            </q-toolbar-title>
            <div>
                <q-btn flat dense v-if="auth == 'logged'" @click="$q.fullscreen.toggle()" color="white" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" size="16px">
                    <q-tooltip content-class="bg-blue-8">Fullscreen</q-tooltip>
                </q-btn>
                <q-btn flat dense v-if="auth == 'logged'" icon="settings_applications" size="16px">
                    <q-tooltip content-class="bg-blue-8">Ustawienia</q-tooltip>
                </q-btn>
                <q-menu content-class="text-primary" inverted anchor="bottom left" self="top left">
                    <q-list style="min-width: 5vw">
                        <q-item clickable v-on:click="showChangeUserPasswordDialog = true" v-close-popup>
                            <q-item-section>Zmiana hasła</q-item-section>
                        </q-item>
                        <q-item clickable to="allReservations" v-close-popup>
                            <q-item-section>Wszystkie rezerwacje</q-item-section>
                        </q-item>
                        <q-item clickable to="reservationsAfterDeadline" v-close-popup>
                            <q-item-section>Rezerwacje po terminie</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item v-if="loggedUser.role=='ROLE_ADMIN'" clickable to="listProductTypes" v-close-popup>
                            <q-item-section>Kategorie</q-item-section>
                        </q-item>
                        <q-item v-if="loggedUser.role=='ROLE_ADMIN'" clickable to="users" v-close-popup>
                            <q-item-section>Użytkownicy</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </div>
            <div class="q-ml-md">
                <q-btn flat dense v-if="auth == ''" to="login" color="white" icon="login" >
                    <q-tooltip content-class="bg-blue-8">Logowanie</q-tooltip>
                </q-btn>
                <q-btn flat dense v-if="auth == 'logged'" v-on:click="logout" color="white" icon="logout" >
                    <q-tooltip content-class="bg-blue-8">Wyloguj</q-tooltip>
                </q-btn>
            </div>
        </q-toolbar>
    </q-header>
    <q-footer>
        <div class="q-ml-md text-caption">
            Zalogowany:
            <strong v-if="loggedUser.firstName">
                {{ loggedUser.firstName + " " + loggedUser.lastName }}
            </strong>
        </div>
    </q-footer>
    <template>
        <q-dialog v-model="showChangeUserPasswordDialog" persistent>
            <q-card style="min-width: 15vw">
                <q-card-section>
                    <div class="text-primary">Zmiana hasła</div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-input dense v-model="oldUserPassword" autofocus label="Aktualne hasło" type="password" :rules="[
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
    <q-drawer v-if="auth == 'logged'" v-model="leftDrawerOpen" :width="200" :breakpoint="700" elevated show-if-above bordered content-class="bg-blue-8">
        <q-list ref="onUpdateProductTypeList">
            <q-item-label header class="text-white">KATEGORIA:</q-item-label>
            <ProductTypeMenuLink class="text-white" v-for="productType in productTypes" :key="productType.id" v-bind="productType" />
        </q-list>
        <div class="q-mb-md q-ml-md fixed-bottom">
            <q-icon color="blue-3" size="30px" name="mood" v-on:click="showInfoDialog" class="cursor-pointer" />
        </div>
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
import About from "components/About.vue";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

import axios from "axios";

export default {
    name: "MainLayout",

    components: {
        ProductTypeMenuLink
    },

    mounted: function () {
        EventBus.$on("logged", user => {
            this.getLoggedUser(user);
            this.auth = "logged";
            this.getProductTypes();
        });

        if (localStorage.getItem("token")) {
            this.auth = "logged";
            this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
            this.getProductTypes();
        };

        this.$root.$on("refreshProductTypes", () => {
            this.getProductTypes();
        });

        this.$root.$on("logout", (item, response) => {
            this.logout();
        });
    },

    destroyed: function () {
        EventBus.$off("logged");
        $off("logout");
        $off("refreshProductTypes");
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
            infoDialog: null,
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
            this.infoDialog = this.$q
                .dialog({
                    component: About,
                })
        },

        logout: function () {
            this.auth = "";
            this.loggedUser = "";
            localStorage.clear();
            this.$q.notify({
                color: "positive",
                position: "top",
                message: "Wylogowano",
                icon: "check_circle_outline",
            });
            this.$router.push("login");
        }
    }
};
</script>

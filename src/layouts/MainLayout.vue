<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
        <q-toolbar>
            <q-btn flat dense round icon="menu" aria-label="Menu" v-on:click="leftDrawerOpen = !leftDrawerOpen" />
            <q-toolbar-title>
                <q-btn v-if="auth=='logged'" to="products" flat color="white" label="Produkty" no-caps />
                <q-btn v-if="auth==''" to="login" flat color="white" label="Logowanie" no-caps />
                <q-btn v-if="auth=='logged'" v-on:click="logout" flat color="white" label="Wyloguj" no-caps />
            </q-toolbar-title>
            <!-- <div>Wims v{{ $q.version }}</div> -->
            <q-btn v-if="auth=='logged'" to="users" flat label="Admin" no-caps />
        </q-toolbar>
    </q-header>

    <q-drawer v-if="auth=='logged'" v-model="leftDrawerOpen" :width="280" show-if-above bordered content-class="bg-blue-8">
        <q-list ref="onUpdateProductTypeList">
            <q-item-label header class="text-grey-1">KATEGORIA:</q-item-label>
            <ProductTypeMenuLink class="text-grey-1" v-for="productType in productTypes" :key="productType.id" v-bind="productType" />
        </q-list>
        <div>
            <NewProductType />
        </div>
        <div class="q-ml-md column justify-end" style="height: 65vh">
            <q-icon color="blue-3" size="30px" name="mood" v-on:click="showInfoDialog" />
        </div>
    </q-drawer>

    <q-page-container>
        <q-page padding>
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
        EventBus.$on("logged", status => {
            this.auth = status
            this.getProductTypes();
        });

        if (localStorage.getItem("token")) {
            this.auth = "logged";
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
            productTypes: [],
            auth: ""
        };
    },

    methods: {
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
                        // this.$router.push("/login")
                        this.logout();
                    } else if (error.response.status === 500) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Strona nie istnieje",
                            icon: "report_problem",
                        });
                        // this.$router.push("/login")
                        this.logout();
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

        showInfoDialog: function () {
            this.$q
                .dialog({
                    title: "<span class=text-primary><strong>WIMS</strong> v0.01(beta)",
                    message: "<span class=text-primary>Where Inventory Management System"
                    +"<br/>"
                    +"<strong>MJ</strong></span>",               
                    html: true,
                })
        },

        logout: function () {
            this.auth = "";
            localStorage.removeItem("token");
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

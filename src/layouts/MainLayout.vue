<template>

<q-layout view="lHh Lpr lFf">
    <q-header elevated>
        <q-toolbar>
            <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
            <q-toolbar-title>
                <q-btn to="/" flat color="white" label="Wims App" no-caps />
                <q-btn to="products" flat color="white" label="Produkty" no-caps />
            </q-toolbar-title>
            <div>Wims v{{ $q.version }}</div>
        </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-blue-8">
        <q-list ref="onUpdateProductTypeList">
            <q-item-label header class="text-grey-1">KATEGORIA:</q-item-label>
            <ProductTypeMenuLink class="text-grey-1" v-for="productType in productTypes" :key="productType.id" v-bind="productType" />

        </q-list>


        <NewProductType />
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
        NewProductType
    },

    mounted: function () {
        this.getProductTypes();
        // this.$root.$on('updateProductType', () => {
        //     // this.getProductTypes();
        //     location.reload();

        // });
    },

    data() {
        return {
            leftDrawerOpen: false,
            productTypes: []
        };
    },

    methods: {
        getProductTypes: function () {
            const url = "/api/product-types";

            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.productTypes = response.data;
                    // console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Products types loading failed",
                        icon: "report_problem"
                    });
                });
        },

        getAllProducts() {
            alert("Wszystkie produkty");
        },

        getProductsByProductType: function () {
            alert("Click Product Type: ");
        }

    }
};
</script>

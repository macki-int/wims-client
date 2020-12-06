<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card" style="width: 1500px">
            <div style="min-height: 800px">
                <q-card-section>
                    <div class="text-h6">Wszystkie produkty</div>
                </q-card-section>
                <q-markup-table dense class="no-shadow">
                    <thead>
                        <q-tr>
                            <th class="text-left">Id</th>
                            <th class="text-left">Nazwa</th>
                            <th class="text-right">Aktywny</th>
                            <th class="text-right"></th>
                        </q-tr>
                    </thead>
                    <tbody>
                        <q-tr v-for="(product, id) in products" :key="id">
                            <td class="text-left">{{ product.id }}</td>
                            <td class="text-left">{{ product.name }}</td>
                            <td class="text-right">
                                <q-checkbox size="xs" v-model="product.active" v-on:click.native="activateProduct(product)"></q-checkbox>
                            </td>
                            <td class="text-right">
                                <q-btn-group>
                                    <q-btn color="blue" icon="edit" @click="editProduct()" size=sm no-caps></q-btn>

                                    <q-btn color="red" icon="disabled_by_default" v-on:click="deleteProduct(product)" size=sm no-caps />

                                </q-btn-group>
                            </td>
                        </q-tr>
                    </tbody>
                </q-markup-table>
            </div>
        </q-card>
    </div>
</q-page>
</template>

<script>
import axios from "axios";

export default {
    name: "Products",

    mounted() {
        this.getProducts();
    },

    data() {
        return {
            products: [],
            confirmDelete: false,
            save: false
        };
    },

    methods: {
        getProducts: function () {
            const url =
                "http://localhost:8080/products";
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.products = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Products loading failed",
                        icon: "report_problem"
                    });
                });
        },

        editProduct: function () {
            const url = "http://localhost:8080/products";

            axios
                .put(url, {
                    id: this.id,
                    name: this.newNameProductType,
                })
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "The name of product saving failed",
                        icon: "report_problem",
                    });
                });
            // EventBus.$emit("productTypesUpdated");
        },

        deleteProduct: function (product) {
            const url = "http://localhost:8080/products";

            axios
                .delete(url + "/" + product.id)
                // .then((response) => {})
                .then(response => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Product deleted: " + product.name,
                            icon: "check_circle"
                        }),
                        location.reload();
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "The product deleting failed!",
                        icon: "report_problem",
                    });
                });
            //EventBus.$emit("productTypesUpdated");
        },

        activateProduct: function (product) {
            const url = "";

            if (product.active) {
                this.url = "http://localhost:8080/products/activate";

            } else {
                this.url = "http://localhost:8080/products/deactivate";
            };

            axios
                .patch(this.url + "/" + product.id)
                // .then((response) => {})
                .then(response => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product updated: " + product.name,
                        icon: "check_circle"
                    })
                })
                .catch(() => {
                    this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "The product updating failed!",
                            icon: "report_problem",
                        }),
                        location.reload();
                });
            // location.reload();
            //EventBus.$emit("productTypesUpdated");
        },

        getProductByProductId: function (id) {

            // alert("Clicked Product Type: " + id);
            this.$router.push({
                path: "/" + this.id,
            });

        },
    },
};
</script>

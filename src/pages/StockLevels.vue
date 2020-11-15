<template>
    <q-page class="flex flex-left">
        <div class="q-pa-md">
            <div class="row">
                <div class="col-6-md q-pr-md">
                    <q-card class="my-card" style="width: 1000px">
                        <div style="min-height: 700px">
                            <q-card-section>
                                <div class="text-h6">{{ productTypeName.name }}</div>
                            </q-card-section>
                            <q-markup-table dense class="no-shadow">
                                <thead>
                                    <tr>
                                        <th class="text-left">Id</th>
                                        <th class="text-left">Nazwa</th>
                                        <th class="text-right">Szerokość</th>
                                        <th class="text-right">Długość</th>
                                        <th class="text-right">Ilość</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(product, id) in products" :key="id">
                                        <td class="text-left">{{ product.id }}</td>
                                        <td class="text-left">{{ product.name }}</td>
                                        <!--td class="text-right">{{ product.width }}</td>
                                                    <td class="text-right">{{ product.lenght }}</td>
                                                    <td class="text-right">{{ product.quantity }}</td-->
                                    </tr>
                                </tbody>
                            </q-markup-table>
                        </div>
                    </q-card>
                </div>

                <div class="col-3-md" style="width: 500px">
                    <q-card class="my-card">
                        <div style="min-height: 700px">
                            <q-card-section>
                                <div class="text-h6">{{ nameSelectedProduct }}</div>
                            </q-card-section>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script>
import axios from "axios";

export default {
    name: "StockLevels",

    watch: {
        $route(to, from) {
            this.getProductTypeName();
            this.getProductsByProductTypeId();
        }
    },

    mounted() {
        this.getProductTypeName();
        this.getProductsByProductTypeId();

    },

    data() {
        return {
            productTypeName: [],
            products: [],
            nameSelectedProduct: ''
        }
    },

    methods: {
        getProductTypeName: function() {
            const url = "http://localhost:8080/product-types/" + this.$route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.productTypeName = response.data;
                    // alert(event.target.tagName);
                    //console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product type loading failed",
                        icon: "report_problem"
                    });
                });
        },

        getProductsByProductTypeId: function() {
            const url = "http://localhost:8080/products/product-types/" + this.$route.params.id;
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
        }
    }
};
</script>

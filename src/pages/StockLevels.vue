<template>
    <q-page class="flex flex-left">
        <div class="q-pa-md">
            <div class="row">
                <div class="col-6-md q-pr-md">
                    <q-card class="my-card" style="width: 1000px">
                        <div style="min-height: 800px">
                            <q-card-section>
                                <div class="text-h6">{{ productType.name }}</div>
                            </q-card-section>
                            <q-markup-table dense class="no-shadow">
                                <thead>
                                    <tr>
                                        <th class="text-left">Id</th>
                                        <th class="text-left">Nazwa</th>
                                        <th class="text-right">Szerokość</th>
                                        <th class="text-right">Długość</th>
                                        <th class="text-right">Ilość</th>
                                        <th class="text-right">Powierzchnia</th>
                                        <th class="text-right">Aktywny</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(product, id) in products" :key="id" @click="onRowClick(product)">
                                        <td class="text-left">{{ product.product.id }}</td>
                                        <td class="text-left">{{ product.product.name }}</td>
                                        <td class="text-right">{{ product.productWidth }}</td>
                                        <td class="text-right">{{ product.productLength }}</td>
                                        <td class="text-right">{{ product.quantity }}</td>
                                        <td class="text-right">
                                            {{ product.productWidth * product.productLength * product.quantity }}
                                        </td>
                                        <td class="text-right">
                                            <q-checkbox size="xs" disable v-model="product.product.active"></q-checkbox>
                                        </td>
                                    </tr>
                                </tbody>
                            </q-markup-table>
                        </div>
                    </q-card>
                </div>

                <div class="col-3-md" style="width: 500px">
                    <q-card class="my-card">
                        <div style="min-height: 800px">
                            <q-card-section>
                                <!--div class="text-h6">{{ productType.name }}</div-->

                                <div class="q-pa-md" style="max-width: 470px">
                                    <q-form @submit="onSubmit" @reset="onNewProduct" class="q-gutter-md">
                                        <q-input
                                        full-width
                                        no-outline
                                        readonly
                                        type="text"
                                        v-model="productType.name"
                                        label="Kategoria wyrobu"
                                         />
                                        <q-input
                                        @input="onChange"
                                        full-width
                                        no-outline
                                        type="text"
                                        v-model="formProductName"
                                        label="Nazwa"
                                        ref="productName"
                                        lazy-rules
                                        :rules="[
                            val => (val && val.length > 0) || 'Podaj nazwę wyrobu!'
                          ]" />
                                        <q-input @input="onChange" full-width no-outline type="number" v-model="formWidth" label="Szerokość" />
                                        <q-input @input="onChange" full-width no-outline type="number" v-model="formLength" label="Długość" />
                                        <q-input @input="onChange" full-width no-outline type="number" v-model="formQuantity" label="Ilość" />
                                        <q-input full-width no-outline readonly v-model="formArea" type="number" label="Powierzchnia" />
                                        <q-toggle @input="onChange" v-model="formActiveValue" label="Produkt aktywny" />
                                        <q-input @input="onChange" full-width no-outline v-model="formDescription" type="textarea" label="Uwagi" />

                                        <div>
                                            <q-btn :disabled="disabled" label="Zapisz" type="submit" color="primary" />
                                            <q-btn label="Nowy" type="reset" color="primary" flat class="q-ml-sm" />
                                        </div>
                                    </q-form>
                                </div>
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
            this.getproductType();
            this.getProductsAndQuantityByProductTypeId();
        }
    },

    mounted() {
        this.getproductType();
        this.getProductsAndQuantityByProductTypeId();
    },

    data() {
        return {
            disabled: true,
            newProduct: false,
            productType: [],
            products: [],
            product: "",
            nameSelectedProduct: "",
            formProductName: "",
            formWidth: "5.0",
            formLength: "100.0",
            formQuantity: "0",
            formArea: "",
            formActiveValue: true,
            formDescription: "",
            info: null
        };
    },

    methods: {
        getproductType: function() {
            const url =
                "http://localhost:8080/product-types/" + this.$route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.productType = response.data;
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

        getProductsAndQuantityByProductTypeId: function() {
            const url =
                "http://localhost:8080/products/product-types/" + this.$route.params.id;
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

        onRowClick: function(product) {
            this.formProductName = product.product.name;
            this.formWidth = product.productWidth;
            this.formLength = product.productLength;
            this.formQuantity = product.quantity;
            this.formArea = product.productWidth * product.productLength * product.quantity;
            this.formActiveValue = product.product.active;

            this.newProduct = false;
        },

        onSubmit: function() {
            const url = "http://localhost:8080/products";
            axios
                .post(url, {
                    name: this.formProductName,
                    productType: this.productType
                })
                // .then(response => (this.info = response))
                .then(response => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product saving OK",
                        icon: "check_circle"
                    });
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product saving failed",
                        icon: "report_problem"
                    });
                });

        },

        onNewProduct: function() {
            this.formProductName = "";
            this.formWidth = 5.0;
            this.formLength = 100.0;
            this.formQuantity = 0;
            this.formArea = "";
            this.formActiveValue = true;

            this.setFocusProductName();
            this.newProduct = true;
        },

        onChange: function() {
            this.disabled = false;
        },

        setFocusProductName: function()
    {
           this.$refs.productName.focus();
    }
    }
};
</script>

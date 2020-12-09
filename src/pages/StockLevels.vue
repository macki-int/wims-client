<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <div class="row">
            <div class="col-6-md q-pr-md">
                <q-card class="my-card" style="width: 1000px">
                    <div style="min-height: 800px">
                        <q-card-section>
                            <div class="text-h6">{{ productType.name }} <span class="text-subtitle1">(data aktualizacji: {{ maxUpdateDate[0] }})</span> </div>
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
                                <tr v-for="(product, id) in products" :key="id" v-on:click="onRowClick(product)">
                                    <td class="text-left">{{ product.product.id }}</td>
                                    <td class="text-left">{{ product.product.name }}</td>
                                    <td class="text-right">{{ product.productWidth }}</td>
                                    <td class="text-right">{{ product.productLength }}</td>
                                    <td class="text-right">{{ product.quantity }}</td>
                                    <td class="text-right">
                                        {{ product.productWidth * product.productLength * product.quantity }}
                                    <td>
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
                            <div class="q-pa-md" style="max-width: 470px">
                                <q-form @submit="onSubmit" @reset="onNewInventory" class="q-gutter-md">
                                    <q-input full-width no-outline readonly type="text" v-model="productType.name" :options="productType" label="Kategoria wyrobu" />
                                    <q-input readonly full-width no-outline type="text" v-model="formProductName" label="Nazwa" lazy-rules :rules="[
                                            val => (val && val.length > 0) || 'Wybierz wyróbgit  z listy!'
                                          ]" />
                                    <q-toggle disable size="xs" v-model="formActiveValue" label="Produkt aktywny" left-label />
                                    <q-input @input="onChange" full-width no-outline type="number" :decimals="2" :step="0.01" v-model="formWidth" label="Szerokość" ref="width" />
                                    <q-input @input="onChange" full-width no-outline type="number" :decimals="2" :step="0.01" v-model="formLength" label="Długość" />
                                    <q-input @input="onChange" full-width no-outline type="number" v-model="formQuantity" label="Ilość" />
                                    <q-input full-width no-outline readonly type="number" v-model="formArea" label="Powierzchnia" />
                                    <q-input @input="onChange" full-width no-outline type="textarea" v-model="formDescription" label="Uwagi" />
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
            this.getProductType();
            this.getProductsAndQuantityByProductTypeId();
            this.recalculateArea();
            this.getMaxUpdateDateByProductType();
        }
    },

    mounted() {
        this.getProductType();
        this.getProductsAndQuantityByProductTypeId();
        this.getMaxUpdateDateByProductType();

        // this.addProductAndInventory();
        // this.addProduct();
        // this.addInventory();
    },

    data() {
        return {
            addNewProductId: [],
            disabled: true,
            newProduct: false,
            productType: [],
            maxUpdateDate: [],
            products: [],
            product: "",
            formProductName: "",
            formWidth: "5.00",
            formLength: "100.00",
            formQuantity: "0",
            formArea: "",
            formActiveValue: true,
            formDescription: ""

        };
    },

    methods: {
        getProductType: function () {
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

        // computed: {
        //     calculateArea: function (){
        //         alert(this.formWidth * this.formLength * this.formQuantity);
        //         return this.formWidth * this.formLength * this.formQuantity;
        //     }
        // },

        getProductsAndQuantityByProductTypeId: function () {
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
            // console.log("test obiektu")
            // console.log(this.products[0]);
        },
        getMaxUpdateDateByProductType: function () {
            const url =
                "http://localhost:8080/products/product-types/max/" + this.$route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.maxUpdateDate = response.data;
                    // alert(event.target.tagName);
                    //console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Last update date loading failed",
                        icon: "report_problem"
                    });
                });
        },

        addProductAndInventory: function () {
            this.addNewProductId = this.addProduct();
            console.log(this.addNewProductId);

            this.formProductId = this.addNewProductId;
            this.addInventory(this.addNewProductId);

            this.newProduct = false;
            this.disabled = true;
        },

        updateProductAndInventory: function () {

        },

        addProduct: function () {
            const url = "http://localhost:8080/products";
            return axios
                .post(url, {
                    name: this.formProductName,
                    productType: this.productType
                })

                .then(response => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product saving OK with id: " + response.data.id,
                        icon: "check_circle"
                    })
                    console.log("post product:" + response.data.id);
                    return response.data;
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

        updateProduct: function () {
            const url = "http://localhost:8080/products";
            axios
                .put(url, {
                    id: this.formProductId,
                    active: this.formActiveValue,
                    name: this.formProductName,
                    productType: this.productType
                })

                .then(response => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product update OK",
                        icon: "check_circle"
                    });
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product update failed",
                        icon: "report_problem"
                    });
                });
        },

        onSubmit: function () {
            if (this.newInventory) {
                this.addInventory();
            } else {
                this.updateInventory();
            }
        },

        addInventory: function () {
            const url = "http://localhost:8080/inventories";

            axios
                .post(url, {
                    productWidth: this.formWidth,
                    productLength: this.formLength,
                    quantity: this.formQuantity,
                    updateDate: new Date().toJSON().slice(0, 10),
                    product: {
                        id: this.formProductId
                    },
                    description: this.formDescription
                })
                .then(response => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Inventory of product saving OK",
                            icon: "check_circle"
                        }),
                        this.getProductsAndQuantityByProductTypeId();
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Inventory of product saving failed",
                        icon: "report_problem"
                    });
                });
        },

        updateInventory: function () {
            const url = "http://localhost:8080/inventories";

            axios
                .put(url, {
                    id: this.formInventoryId,
                    productWidth: this.formWidth,
                    productLength: this.formLength,
                    quantity: this.formQuantity,
                    updateDate: new Date().toJSON().slice(0, 10),
                    product: {
                        id: this.formProductId
                    },
                    description: this.formDescription
                })
                .then(response => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Inventory of product updating OK",
                            icon: "check_circle"
                        }),
                        // location.reload();
                        this.getProductsAndQuantityByProductTypeId();
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Inventory of product updating failed",
                        icon: "report_problem"
                    });
                });
        },

        onRowClick: function (product) {
            this.formProductId = product.product.id;
            this.formProductName = product.product.name;
            this.formInventoryId = product.id;
            this.formWidth = product.productWidth;
            this.formLength = product.productLength;
            this.formQuantity = product.quantity;
            this.formActiveValue = product.product.active;

            this.newProduct = false;
            this.disabled = true;
            this.recalculateArea();
        },

        onNewInventory: function () {
            this.formWidth = 5.0;
            this.formLength = 100.0;
            this.formQuantity = 0;
            this.formArea = 0;

            this.newInventory = true;
            this.setFocusFormWidth();
        },

        onChange: function () {
            this.disabled = false;
            this.recalculateArea();
        },

        recalculateArea: function () {
            this.formArea = this.formWidth * this.formLength * this.formQuantity;
        },

        setFocusFormWidth: function () {
            this.$refs.width.focus();
        }
    }
};
</script>

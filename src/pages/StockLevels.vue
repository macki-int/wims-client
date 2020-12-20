<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <div class="row">
            <div class="col-6-md q-pr-md">
                <q-card class="my-card" style="width: 900px">
                    <div style="min-height: 800px">
                        <q-card-section>
                            <div class="text-h6">
                                {{ productType.name }}
                                <span class="text-subtitle1">(data aktualizacji: {{ maxUpdateDate[0] }})</span>
                            </div>
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
                                        {{
                        product.productWidth * product.productLength * product.quantity
                      }}
                                    </td>

                                    <td class="text-right">
                                        <q-checkbox size="xs" disable color="grey" v-model="product.product.active"></q-checkbox>
                                    </td>
                                </tr>
                            </tbody>
                        </q-markup-table>
                    </div>
                </q-card>
            </div>

            <div class="col-3-md" style="width: 400px">
                <q-card class="my-card">
                    <div style="min-height: 300px">
                        <q-card-section>
                            <div class="q-pa-md" style="max-width: 470px">
                                <q-form @submit="onSubmit" @reset="onNewInventory" class="q-gutter-md">
                                    <q-input
                                     :rules="[
                        (val) => (val && val.length > 0) || 'Wybierz wyrób z listy!',
                      ]"
                                    full-width
                                    no-outline
                                    type="text"
                                    v-model="formProductName"
                                    label="Nazwa"
                                    lazy-rules
                                    />

                      <q-btn label="Nowy" color="primary"  v-on:click="save = true" />

    <q-dialog v-model="save" persistent>
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-primary">Nazwa produktu</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-input dense v-model.trim="newProduct" autofocus v-on:keyup.enter="save = false" v-close-popup />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Anuluj" v-close-popup />
                <q-btn flat label="Zapisz" v-on:click="addProduct" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>

                      <q-separator color="primary" class="q-ml-sm" size="3px"/>
                                    <!-- <q-toggle
                      disable
                      size="xs"
                      v-model="formActiveValue"
                      label="Produkt aktywny"
                      left-label
                    /> -->
                                    <q-input @input="onChange"
                                    full-width
                                    no-outline
                                    type="number"
                                    :decimals="2"
                                    :step="0.01"
                                    v-model="formWidth"
                                    label="Szerokość"
                                    ref="width" />
                                    <q-input @input="onChange" full-width no-outline type="number" :decimals="2" :step="0.01" v-model="formLength" label="Długość" />
                                    <q-input @input="onChange" full-width no-outline type="number" v-model="formQuantity" label="Ilość" />
                                    <q-input full-width no-outline readonly type="number" v-model="formArea" label="Powierzchnia" />
                                    <q-input @input="onChange" full-width no-outline type="textarea" autogrow v-model="formDescription" label="Uwagi" />
                                    <div>
                                        <q-btn :disabled="disabled" label="Zapisz" type="submit" color="primary" />
                                        <q-btn label="Nowy" type="reset" color="primary"  class="q-ml-sm" />
                                    </div>
                                    <q-badge v-if="newInventory" outline color="primary" align="middle" label="Dodajesz nowy asortyment" />
                                    <q-badge v-if="!newInventory && !disabled" outline color="primary" align="middle" label="Edytujesz istniejący asortyment" />
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
        },
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
            newInventory: false,
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
            formDescription: "",
            newProduct: "",
            save: false
        };
    },

    methods: {
        getProductType: function () {
            const url = "/api/product-types/" + this.$route.params.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.productType = response.data;
                    // alert(event.target.tagName);
                    // console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product type loading failed",
                        icon: "report_problem",
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
            const url = "/api/products/product-types/" + this.$route.params.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.products = response.data;
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Products loading failed",
                        icon: "report_problem",
                    });
                });
            // console.log("test obiektu")
            // console.log(this.products[0]);
        },
        getMaxUpdateDateByProductType: function () {
            const url = "/api/products/product-types/max/" + this.$route.params.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.maxUpdateDate = response.data;
                    // alert(event.target.tagName);
                    //console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Last update date loading failed",
                        icon: "report_problem",
                    });
                });
        },

        addProductAndInventory: function () {
            this.addNewProductId = this.addProduct();
            console.log(this.addNewProductId);

            this.formProductId = this.addNewProductId;
            this.addInventory(this.addNewProductId);

            this.newProduct = false;
            this.newInventory = false;
            this.disabled = true;
        },

        updateProductAndInventory: function () {},

        addProduct: function () {
            const url = "/api/products";
            return axios
                .post(url, {
                    // name: this.formProductName,
                    name: this.newProduct,
                    productType: this.productType,
                })

                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product saving OK with id: " + response.data.id,
                        icon: "check_circle",
                    });
                    // console.log("post product:" + response.data.id);
                    this.formProductId = response.data.id;
            this.formProductName = response.data.name;
                    return response.data;
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product saving failed",
                        icon: "report_problem",
                    });
                });
        },

        updateProduct: function () {
            const url = "/api/products";
            axios
                .put(url, {
                    id: this.formProductId,
                    active: this.formActiveValue,
                    name: this.formProductName,
                    productType: this.productType,
                })

                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product update OK",
                        icon: "check_circle",
                    });
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product update failed",
                        icon: "report_problem",
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
            const url = "/api/inventories";

            axios
                .post(url, {
                    productWidth: this.formWidth,
                    productLength: this.formLength,
                    quantity: this.formQuantity,
                    updateDate: new Date().toJSON().slice(0, 10),
                    product: {
                        id: this.formProductId,
                    },
                    description: this.formDescription,
                })
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Inventory of product saving OK",
                            icon: "check_circle",
                        }),
                        this.getProductsAndQuantityByProductTypeId();
                    this.getMaxUpdateDateByProductType();
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Inventory of product saving failed",
                        icon: "report_problem",
                    });
                });
        },

        updateInventory: function () {
            const url = "/api/inventories";

            axios
                .put(url, {
                    id: this.formInventoryId,
                    productWidth: this.formWidth,
                    productLength: this.formLength,
                    quantity: this.formQuantity,
                    updateDate: new Date().toJSON().slice(0, 10),
                    product: {
                        id: this.formProductId,
                    },
                    description: this.formDescription,
                })
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Inventory of product updating OK",
                            icon: "check_circle",
                        }),
                        this.getProductsAndQuantityByProductTypeId();
                    this.getMaxUpdateDateByProductType();
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Inventory of product updating failed",
                        icon: "report_problem",
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
            this.formDescription = product.description;
            this.formActiveValue = product.product.active;

            this.newProduct = false;
            this.newInventory = false;
            this.disabled = true;
            this.recalculateArea();
        },

        onNewInventory: function () {
            this.formWidth = 5.0;
            this.formLength = 100.0;
            this.formQuantity = 0;
            this.formArea = 0;
            this.formDescription = "";

            this.newInventory = true;
            this.disabled = true;
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
        },
    },
};
</script>

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
                                <q-checkbox v-on:input="getProductsAndQuantityByProductTypeId" class="text-body2 q-pl-xl" size="xs" color="grey" v-model="showZeroValue" label="Pokaż stany zerowe"></q-checkbox>
                                <q-checkbox v-on:input="getProductsAndQuantityByProductTypeId" class="text-body2 q-pl-md" size="xs" color="grey" v-model="showActiveProduct" label="Pokaż nieaktywne produkty"></q-checkbox>
                                <q-badge class="float-right" outline color="primary">stan na {{ maxUpdateDate[0] }}</q-badge>
                            </div>
                        </q-card-section>
                        <q-markup-table dense class="no-shadow">
                            <thead>
                                <tr>
                                    <th class="text-left" hidden>Id</th>
                                    <th class="text-left">Nazwa</th>
                                    <th class="text-right">Szerokość</th>
                                    <th class="text-right">Długość</th>
                                    <th class="text-right">Ilość</th>
                                    <th class="text-right">Powierzchnia</th>
                                    <th class="text-right">Aktywny</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="cursor-pointer" v-for="(product, id) in products" :key="id" v-on:click="onRowClick(product)">
                                    <td class="text-left" hidden>{{ product.product.id }}</td>
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
                                        <q-icon class="q-pr-md text-weight-bolder" color="primary" v-if="product.product.active" name="check" />
                                        <!-- <q-checkbox size='xs' disable color='grey' v-model='product.product.active'></q-checkbox> -->
                                    </td>
                                </tr>
                            </tbody>
                        </q-markup-table>
                    </div>
                </q-card>
            </div>

            <div class="col-3-md" style="width: 400px">
                <q-card class="my-card">
                    <div style="min-height: 800px">
                        <q-card-section>
                            <div class="q-pa-md" style="max-width: 470px">
                                <q-form v-on:submit="updateInventory" v-on:reset="dialogNewInventory=true" class="q-gutter-md">
                                    <template>
                                        <div>
                                            <q-input full-width no-outline type="text" v-model="formProductName" label="Nazwa" readonly />
                                            <q-btn flat label="Nowy produkt" color="primary" v-on:click="dialogNewProduct = true" />
                                            <q-dialog v-model="dialogNewProduct" persistent>
                                                <q-card style="min-width: 350px">
                                                    <q-card-section>
                                                        <div class="text-primary">Nazwa nowego produktu:</div>
                                                    </q-card-section>

                                                    <q-card-section class="q-pt-none">
                                                        <q-input dense v-model.trim="newProduct" :rules="[(val) => val && val.length > 0 || 'Podaj nazwę produktu']" v-on:keyup.enter="dialogNewProduct = false" autofocus />
                                                    </q-card-section>

                                                    <q-card-actions align="right" class="text-primary">
                                                        <q-btn flat label="Anuluj" v-close-popup />
                                                        <q-btn flat label="Zapisz" v-on:click="addProduct" v-close-popup />
                                                    </q-card-actions>
                                                </q-card>
                                            </q-dialog>
                                        </div>
                                    </template>
                                    <q-separator color="primary" class="q-ml-sm" size="2px" />

                                    <q-input v-on:input="onChange" full-width no-outline type="number" :decimals="2" :step="0.01" v-model="formWidth" label="Szerokość" ref="width" />
                                    <q-input v-on:input="onChange" full-width no-outline type="number" :decimals="2" :step="0.01" v-model="formLength" label="Długość" />
                                    <q-input v-on:input="onChange" full-width no-outline type="number" :decimals="2" v-model="formQuantity" label="Ilość" />
                                    <q-input full-width no-outline readonly type="number" v-model="formArea" label="Powierzchnia" />
                                    <q-input full-width no-outline type="textarea" autogrow v-model="formDescription" label="Uwagi" />
                                    <div>
                                        <q-btn flat :disabled="disabled" label="Nowy asortyment" type="reset" color="primary" />
                                        <q-dialog v-model="dialogNewInventory" persistent>
                                            <q-card style="min-width: 350px">
                                                <q-card-section>
                                                    <div class="text-primary">Dodawanie nowego asortymentu:</div>
                                                </q-card-section>
                                                <q-card-section class="q-pt-none">
                                                    <q-input dense v-model="formWidth" label="Szerokość" type="number" :decimals="2" :rules="[(val) => val > 0 && val.length > 0]" autofocus />
                                                    <q-input dense v-model="formLength" label="Długość" type="number" :decimals="2" :rules="[(val) => val > 0 && val.length > 0]" />
                                                    <q-input dense v-model="formQuantity" label="Ilość" type="number" :decimals="2" :rules="[(val) => val > 0 && val.length > 0]" />
                                                    <q-input dense v-model="formDescription" label="Uwagi" type="textarea" autogrow />
                                                </q-card-section>
                                                <q-card-actions align="right" class="text-primary">
                                                    <q-btn flat label="Anuluj" v-close-popup />
                                                    <q-btn flat label="Zapisz" v-on:click="addInventory" v-close-popup />
                                                </q-card-actions>
                                            </q-card>
                                        </q-dialog>

                                        <q-btn flat :disabled="disabled" label="Zapisz" type="submit" color="primary" />
                                    </div>
                                    <!-- <q-badge v-if="newInventoryIndicator" outline color="primary" align="middle" label="Dodajesz nowy asortyment" />
                                    <q-badge v-if="!newInventoryIndicator && !disabled" outline color="primary" align="middle" label="Edytujesz istniejący asortyment" /> -->

                                    <q-separator color="primary" class="q-ml-sm" size="2px" />
                                    <ProductReservation ref="refReservation" />
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
import ProductReservation from "components/ProductReservation.vue";

export default {
    name: "StockLevels",

    components: {
        ProductReservation,
    },

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
    },

    data() {
        return {
            productType: [],
            maxUpdateDate: [],
            newProduct: "",
            product: "",
            products: [],

            formInventoryId: "",
            formProductName: "",
            formWidth: "5.00",
            formLength: "100.00",
            formQuantity: "0.00",
            formArea: "",
            formActiveValue: true,
            formDescription: "",

            showZeroValue: false,
            showActiveProduct: false,

            disabled: true,
            dialogNewProduct: false,
            dialogNewInventory: false
        };
    },

    methods: {
        getProductType: function () {
            const url = "https://wims-mj.herokuapp.com/product-types/" + this.$route.params.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.productType = response.data;
                    // alert(event.target.tagName);
                    // console.log('response: ' + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania kategorii",
                        icon: "report_problem",
                    });
                });
        },

        getProductsAndQuantityByProductTypeId: function () {
            const url =
                "https://wims-mj.herokuapp.com/products/product-types/" + this.$route.params.id;

            axios
                .get(url, {
                    dataType: "json",
                    params: {
                        withZeroValue: this.showZeroValue,
                        withInactiveValue: this.showActiveProduct,
                    },
                    headers: {},
                })
                .then((response) => {
                    this.products = response.data;
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania stanów magazynowych",
                        icon: "report_problem",
                    });
                });
        },

        getMaxUpdateDateByProductType: function () {
            const url =
                "https://wims-mj.herokuapp.com/products/product-types/max-update-date/" +
                this.$route.params.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.maxUpdateDate = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania daty odstatniej aktualizacji stanów magazynowych",
                        icon: "report_problem",
                    });
                });
        },

        addProduct: function () {
            const url = "https://wims-mj.herokuapp.com/products";
            return axios
                .post(url, {
                    name: this.newProduct,
                    productType: this.productType,
                })

                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nowy produkt",
                        icon: "check_circle",
                    });
                    this.formProductId = response.data.id;
                    this.formProductName = response.data.name;
                    this.dialogNewInventory = true;

                    // console.log('post product:' + response.data.id);
                    // return response.data;
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd dodawania noweg produktu",
                        icon: "report_problem",
                    });
                });
        },

        updateProduct: function () {
            const url = "https://wims-mj.herokuapp.com/products";
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
                        message: "Zaktualizowano nazwę produktu",
                        icon: "check_circle",
                    });
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd aktualizacji nazwy produktu",
                        icon: "report_problem",
                    });
                });
        },

        addInventory: function () {
            const url = "https://wims-mj.herokuapp.com/inventories";

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
                            message: "Dodano nowy stan magazynu",
                            icon: "check_circle",
                        }),
                        (this.disabled = true);

                    this.getProductsAndQuantityByProductTypeId();
                    this.getMaxUpdateDateByProductType();
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd dodawania nowego stanu magazynu",
                        icon: "report_problem",
                    });
                });
        },

        updateInventory: function () {
            const url = "https://wims-mj.herokuapp.com/inventories";

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
                            message: "Zaktualizowano stan magazynu",
                            icon: "check_circle",
                        }),
                        (this.disabled = true);
                    this.getProductsAndQuantityByProductTypeId();
                    this.getMaxUpdateDateByProductType();
                })

                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Bład aktualizacji stanu magazynu",
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

            this.newProduct = "";
            this.disabled = false;
            this.recalculateArea();

            EventBus.$emit("click", product);
            this.$refs.refReservation.getReservationsByInventoryId();
        },

        onNewInventory: function () {
            this.formWidth = 5.0;
            this.formLength = 100.0;
            this.formQuantity = 0.0;
            this.formArea = 0.0;
            this.formDescription = "";
        },

        onChange: function () {
            if (this.formProductName.length > 0) {
                this.disabled = false;
            }
            this.recalculateArea();
        },

        recalculateArea: function () {
            this.formArea = this.formWidth * this.formLength * this.formQuantity;
        }
    },
};
</script>

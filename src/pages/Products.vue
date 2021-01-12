<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card" style="min-width: 700px">
            <q-card>
                <q-table dense flat :data="products" :columns="columns" row-key="name" :pagination.sync="pagination" v-bind:request="getProducts">
                    <q-tr slot="body" slot-scope="props" :props="props">
                        <q-td key="product" :props="props">
                            {{ props.row.name }}
                        </q-td>
                        <q-td key="type" :props="props">
                            {{ props.row.productType.name }}
                        </q-td>
                        <q-td key="active" :props="props">
                            <q-checkbox dense v-model="props.row.active" size="sm" color="grey" v-on:click.native="activateProduct(props)" />
                        </q-td>
                        <q-td key="action" :props="props">
                            <q-btn size="sm" dense unelevated color="positive" icon="more_horiz" class="q-mr-xs" v-on:click="detailProduct(props.row)" />

                            <q-btn size="sm" dense unelevated color="primary" icon="create" class="q-mr-xs" v-on:click="editProduct(props)" />

                            <q-btn size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)" />
                        </q-td>
                    </q-tr>
                </q-table>

            </q-card>

            <q-dialog v-model="showDetailProductDialog">
                <q-card style="min-width: 350px">
                    <q-card-section>
                        <div class="text-primary">Szczegóły produktu: {{detailedProduct.name}} </div>
                    </q-card-section>
                    <q-card-section >
                        <template>
                        <ProductDetail ref="refProductDetail" />
                        </template>
                        <!-- <q-input dense v-model="detailedProduct.name" label="Nazwa produktu" /> 
                        <q-input dense v-model="detailedProduct.productType.name" label="Typ produktu" />  -->
                    </q-card-section>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="OK" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <q-dialog v-model="showEditProductDialog">
                <q-card style="min-width: 350px">
                    <q-card-section>
                        <div class="text-primary">Edycja produktu:</div>
                    </q-card-section>

                    <!-- <q-card-section class="q-pt-none">
                                        <q-select dense v-model="productType" :options="filteredProductTypes" label="Kategoria produktu" @filter="filterProductTypes" :display-value="productType.name" autofocus>
                                            <template #option="{ opt, toggleOption }">
                                                <q-item dense clickable @click="toggleOption(opt)">
                                                    <q-item-section>
                                                        <q-item-label>
                                                            {{ `${opt.name}` }}
                                                        </q-item-label>
                                                    </q-item-section>
                                                </q-item>
                                                <q-separator class="q-virtual-scroll--with-prev"></q-separator>
                                            </template>
                                        </q-select>
                                    </q-card-section> -->
                    <!-- <q-input dense v-model="editedProduct.name" label="Nazwa produktu" />
                                    <q-input dense v-model="editedProduct.active" label="Nazwa produktu" /> -->
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Anuluj" v-close-popup />
                        <q-btn flat label="Zapisz" v-on:click="updateProduct(editedProduct)" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </q-card>
    </div>

</q-page>
</template>

<script>
import axios from "axios";
import ProductDetail from "components/ProductDetail.vue";

export default {
    name: "Products",

    components: {
        ProductDetail
    },

    mounted() {
        this.getProductTypes();
        this.getProducts();
    },

    data() {
        return {
            showEditProductDialog: false,
            showDetailProductDialog: false,

            productType: "",
            productTypes: [],
            filteredProductTypes: [],

            editedProduct: [],
            products: [],

            detailedProduct: [],

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 25,
            },

            columns: [{
                    name: "product",
                    label: "Nazwa",
                    field: "name",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "type",
                    label: "Typ",
                    field: (row) => row.productType.name,
                    align: "left",
                    sortable: true,
                },

                {
                    name: "active",
                    label: "Aktywny",
                    field: "active",
                    align: "center",
                    sortable: true,
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                },
            ],
        };
    },

    methods: {
        getProductTypes: function () {
            const url = "https://wims-mj.herokuapp.com/product-types";

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.productTypes = response.data;
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

        getProducts: function () {
            const url = "https://wims-mj.herokuapp.com/products";

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
        },

        editProduct: function (props) {
            this.editedProduct = Object.assign({}, props.row);
            // console.log(this.editedProduct);
            // console.log(this.editedProduct.name);
            // console.log(this.editedProduct.productType.name);
            // this.$q.notify({
            //     color: "primary",
            //     position: "center",
            //     message: `${JSON.stringify(this.editedProduct)}`,

            // });
            this.showEditProductDialog = true;
        },

        updateProduct: function (editedReservation) {
            const url = "https://wims-mj.herokuapp.com/products";

            axios
                .put(url, {
                    id: this.editedReservation.id,
                    name: this.editedReservation.name,
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product name saving OK",
                        icon: "check_circle",
                    });
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "The name of product saving failed",
                        icon: "report_problem",
                    });
                });
        },

        detailProduct: function (props) {
            this.detailedProduct = Object.assign({}, props);
            // this.$q.notify({
            //     color: "positive",
            //     position: "center",
            //     message: `${JSON.stringify(this.detailedProduct)}`,

            // });
            EventBus.$emit("click", this.detailedProduct);
            // this.showDetailProductDialog = true;
            // this.$refs.refProductDetail.getInventoriesByProductId();
        },

        activateProduct: function (props) {
            const url = "";
            const message = "";

            if (props.row.active) {
                this.message = "Aktywowano";
                this.url = "https://wims-mj.herokuapp.com/products/activate/" + props.row.id;
            } else {
                this.message = "Dezaktywowano";
                this.url = "https://wims-mj.herokuapp.com/products/deactivate/" + props.row.id;
            }

            axios
                .patch(this.url)
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: this.message + " produkt: " + props.row.name,
                        icon: "check_circle",
                    });
                })
                .catch(() => {
                    this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd aktywacji/desaktywacji produktu!",
                            icon: "report_problem",
                        }),
                        this.getProducts();
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie productu</span>",
                    message: "<span class=text-negative>Czy usunąć produkt: <strong>" +
                        props.row.name +
                        "?",
                    color: "negative",
                    html: true,
                    persistent: true,
                    ok: {
                        label: "usuń",
                        flat: true,
                    },
                    cancel: true,
                })
                .onOk(() => {
                    this.deleteProduct(props.row.id);
                });
        },

        deleteProduct: function (id) {
            const url = "https://wims-mj.herokuapp.com/products/" + id;

            axios
                .delete(url)
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Usunięto produkt",
                            icon: "check_circle",
                        }),
                        this.getProducts();
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd usuwania produktu!",
                        icon: "report_problem",
                    });
                });
        },
        filterProductTypes(val, update, abort) {
            update(() => {
                if (!val) return (this.filteredProductTypes = [...this.productTypes]);

                const needle = val.toLowerCase();
                this.filteredProductTypes = this.users.filter((v) => `${v.name}`.indexOf(needle) > -1);
            });
        }
    }
}
</script>

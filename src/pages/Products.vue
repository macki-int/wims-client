<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card" style="min-width: 700px">
            <div style="min-height: 800px">
                <q-card-section>
                    <div class="text-h6">Wszystkie produkty</div>
                </q-card-section>
                <!-- <q-markup-table dense class='no-shadow'>
                    <thead>
                        <q-tr>
                            <th class='text-left'>Id</th>
                            <th class='text-left'>Nazwa</th>
                            <th class='text-left'>Typ</th>
                            <th class='text-right'>Aktywny</th>
                            <th class='text-right'></th>
                        </q-tr>
                    </thead>
                    <tbody>
                        <q-tr v-for='(product, id) in products' :key='id'>
                            <td class='text-left'>{{ product.id }}</td>
                            <td class='text-left'>{{ product.name }}</td>
                            <td class='text-left'>{{ product.productType.name }}</td>
                            <td class='text-right'>
                                <q-checkbox size='xs' color='grey' v-model='product.active' v-on:click.native='activateProduct(product)'>
                                </q-checkbox>
                            </td>
                            <td class='text-right'>
                                <q-btn-group>
                                    <q-btn color='blue' icon='edit' v-on:click='save = true' size=sm></q-btn>
                                    <q-btn color='red' icon='disabled_by_default' v-on:click='deleteProduct(product)' size=sm no-caps />
                                </q-btn-group>
                            </td>
                        </q-tr>
                    </tbody>
                </q-markup-table> -->

                <q-table flat :data="products" :columns="columns" row-key="name" :pagination.sync="pagination" v-bind:request="getProducts" dense>
                    <q-tr slot="body" slot-scope="props" :props="props">
                        <q-td key="name" :props="props">
                            {{ props.row.name }}
                        </q-td>
                        <q-td key="type" :props="props">
                            {{ props.row.productType.name }}
                        </q-td>
                        <q-td key="active" :props="props">
                            {{ props.row.active }}
                        </q-td>
                        <q-td key="action" :props="props">
                            <q-btn size="xs" unelevated dense color="primary" icon="create" class="q-mr-xs" v-on:click="editProduct(props)" />
                            <!-- <q-dialog v-model="showEditProductDialog">
                                <q-card style="min-width: 350px">
                                    <q-card-section>
                                        <div class="text-primary">Edycja produktu:</div>
                                    </q-card-section>
                                    <q-card-section class="q-pt-none">
                                        <q-select dense v-model="productType" :options="filteredProductTypes" label="Użytkownik" @filter="filterProductTypes" :display-value="product.nick" autofocus>
                                            <template #option="{ opt, toggleOption }">
                                                <q-item dense clickable @click="toggleOption(opt)">
                                                    <q-item-section>
                                                        <q-item-label>
                                                            {{ `${opt.nick}` }}
                                                        </q-item-label>
                                                    </q-item-section>
                                                </q-item>
                                                <q-separator class="q-virtual-scroll--with-prev"></q-separator>
                                            </template>
                                        </q-select>
                                        <q-input dense v-model.trim="editedProduct.xx" label="Ilość" type="number" :decimals="2" :rules="[(val) => val >= 0 && val.length > 0]" />
                                    </q-card-section>

                                    <q-card-actions align="right" class="text-primary">
                                        <q-btn flat label="Anuluj" v-close-popup />
                                        <q-btn flat label="Zapisz" v-on:click="updateProduct(editedProduct)" v-close-popup />
                                    </q-card-actions>
                                </q-card>
                            </q-dialog> -->
                            <q-btn size="xs" unelevated dense color="negative" icon="clear" v-on:click="confirmDelete(props)" />
                        </q-td>
                    </q-tr>
                </q-table>
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
        this.getProductTypes();
    },

    data() {
        return {

            showEditProductDialog: false,

            productType: "",
            productTypes: [],
            filteredProductTypes: [],

            editedProduct: "",
            products: [],
            
            pagination: {
                sortBy: 'type',
                descending: false,
                rowsPerPage: 25
            },

            columns: [{
                    name: "name",
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
                }
            ],
        };
    },

    methods: {
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
            this.showEditProductDialog = true;
        },

        uodateProduct: function (props) {
            const url = "https://wims-mj.herokuapp.com/products";

            axios
                .put(url, {
                    id: this.id,
                    name: this.newProductName,
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

        activateProduct: function (id) {
            const url = "";

            if (product.active) {
                this.url = "https://wims-mj.herokuapp.com/products/activate/" + product.id;
            } else {
                this.url = "https://wims-mj.herokuapp.com/products/deactivate/" + product.id;
            }

            axios
                .patch(this.url)
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Product updated: " + product.name,
                        icon: "check_circle",
                    });
                })
                .catch(() => {
                    this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "The product updating failed!",
                            icon: "report_problem",
                        }),
                       this.getProducts(); 
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie productu</span>",
                    message: "<span class=text-negative>Czy usunąć produkt: <strong>" + props.row.name + "?",
                    color: 'negative',
                    html: true,
                    persistent: true,
                    ok: {
                        label: 'usuń',
                        flat: true
                    },
                    cancel: true,
                }).onOk(() => {
                    this.deleteProduct(props.row.id);
                })
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

    },
};
</script>

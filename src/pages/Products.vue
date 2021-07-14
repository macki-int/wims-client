<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card fit" style="min-width: 45vw; min-height: 75vh">
            <q-card>
                <q-table dense flat :data="products" :columns="columns" row-key="name" :filter="filter" :pagination.sync="pagination" hide-no-data color="primary" v-bind:request="getProducts">
                    <template slot="top-left">
                        <div class="q-pa-sm text-h6 text-primary">
                            Lista produktów
                        </div>
                    </template>
                    <template slot="top-right">
                        <q-input dense v-model="filter" clear-icon="close" clearable>
                            <template v-slot:prepend>
                                <q-icon name="search" color="primary" />
                            </template>
                        </q-input>
                    </template>
                    <template slot="body" slot-scope="props">
                        <q-tr class="cursor-pointer" :props="props" @click.native="onRowClick(props)" :class="props.rowIndex===activeRowIndex?'bg-blue-1':''">
                            <q-td key="index" :props="props" auto-width>
                                {{ props.rowIndex + 1 }}.
                            </q-td>
                            <q-td key="product" :props="props">
                                {{ props.row.name }}
                            </q-td>
                            <q-td key="type" :props="props">
                                {{ props.row.productType.name }}
                            </q-td>
                            <q-td key="description" :props="props">
                                {{ props.row.description }}
                            </q-td>
                            <q-td key="active" :props="props">
                                <q-icon class="q-pr-md text-weight-bolder" color="primary" v-if="props.row.active" size="16px" name="radio_button_checked" />
                                <!-- <q-checkbox dense v-model="props.row.active" size="sm" color="grey" v-on:click.native="activateProduct(props)" /> -->
                            </q-td>
                            <q-td key="action" :props="props">
                                <q-btn flat size="sm" dense unelevated color="positive" icon="more_horiz" v-on:click="showDetailProduct(props.row)">
                                    <q-tooltip content-class="bg-blue-8">Pokaż stany magazynowe produktu</q-tooltip>
                                </q-btn>
                                <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editProduct(props)">
                                    <q-tooltip content-class="bg-blue-8">Edytuj produkt</q-tooltip>
                                </q-btn>
                                <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                                    <q-tooltip content-class="bg-red">Usuń produkt</q-tooltip>
                                </q-btn>
                            </q-td>
                        </q-tr>
                    </template>
                </q-table>
            </q-card>

            <q-dialog v-model="showDetailProductDialog">
                <q-card style="min-width: 40vw">
                    <q-card-section>
                        <div class="text-primary">Szczegóły produktu: <strong>{{detailProduct.name}}</strong> </div>
                    </q-card-section>
                    <q-card-section>
                        <q-table dense flat :data="inventories" :columns="columnsDetails" row-key="name" :visible-columns="visibleColumns" v-bind:request="getInventoriesByProductId">
                            <q-tr slot="body" slot-scope="props" :props="props">
                                <q-td key="index" :props="props" auto-width>
                                    {{ props.rowIndex + 1 }}.
                                </q-td>
                                <q-td key="productWidth" :props="props">
                                    {{ setNumericFormat(props.row.productWidth) }}
                                </q-td>
                                <q-td key="productLength" :props="props">
                                    {{ setNumericFormat(props.row.productLength) }}
                                </q-td>
                                <q-td key="quantity" :props="props">
                                    {{ props.row.quantity }}
                                </q-td>
                                <q-td key="area" :props="props">
                                    {{ setNumericFormat(props.row.productWidth * props.row.productLength * props.row.quantity) }}
                                </q-td>
                                <q-td key="description" :props="props">
                                    {{ props.row.description }}
                                </q-td>
                                <q-td key="updateDate" :props="props">
                                    {{ props.row.updateDate }}
                                </q-td>
                            </q-tr>
                        </q-table>
                        <div v-if="visibleColumns.includes('area')" class="text-primary">
                            Razem powierzchnia: <strong>{{ sumArea() }}</strong> m2
                            </div>
                    </q-card-section>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="OK" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <q-dialog v-model="showEditProductDialog" persistent>
                <q-card style="min-width: 15vw">
                    <q-card-section>
                        <div class="text-primary">Edycja produktu</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <q-select dense v-model="productType" :options="filteredProductTypes" label="Kategoria produktu" v-on:filter="filterProductTypes" :display-value="productType.name" selected="productType.name" autofocus>
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
                        <q-input dense v-model="editedProduct.name" label="Nazwa produktu" :rules="[(val) => val && val.length > 0 || 'Podaj nazwę produktu']" />
                        <q-input dense v-model="editedProduct.description" label="Opis" />
                        <q-checkbox class="q-pt-md" dense v-model="editedProduct.active" size="sm" label="Aktywny" />
                    </q-card-section>
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
import { setNumericFormat } from "../js/setNumericFormat.js";

export default {
    name: "Products",

    mounted() {
        this.getLoggedUserFromLocalStore();
        this.getProductTypes();
        this.getProducts();

    },

    data() {
        return {
            activeRowIndex: "",

            showEditProductDialog: false,
            showDetailProductDialog: false,

            filter: "",

            loggedUser: "",

            productType: "",
            productTypes: [],
            filteredProductTypes: [],

            editedProduct: [],
            products: [],
            inventories: [],

            detailProduct: [],

            search: "",

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 20,
            },

            columns: [{
                name: "index",
                label: "Lp",
                field: "",
                align: "right"
            }, {
                name: "product",
                label: "Nazwa",
                field: "name",
                align: "left",
                sortable: true,
                style: "max-width: 70px",
                headerStyle: "max-width: 70px"
            }, {
                name: "type",
                label: "Typ",
                field: (row) => row.productType.name,
                align: "left",
                sortable: true,
                style: "max-width: 50px",
                headerStyle: "max-width: 50px"
            }, {
                name: "description",
                label: "Opis",
                field: "description",
                align: "left",
                sortable: true,
                style: "max-width: 50px",
                headerStyle: "max-width: 50px"
            }, {
                name: "active",
                label: "Aktywny",
                field: "active",
                align: "center",
                sortable: true,
                style: "max-width: 30px",
                headerStyle: "max-width: 30px"
            }, {
                name: "action",
                align: "right",
                field: "",
                style: "max-width: 30px",
                headerStyle: "max-width: 30px"
            }],

            visibleColumns: ["index", "productWidth", "productLength", "quantity", "area", "description", "updateDate"],

            columnsDetails: [{
                    name: "index",
                    label: "Lp",
                    field: "",
                    align: "right"
                }, {
                    name: "productWidth",
                    label: "Szerokość",
                    field: "productWidth",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "productLength",
                    label: "Długość",
                    field: "productLength",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: "quantity",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "area",
                    label: "Powierzchnia",
                    field: "",
                    align: "right",
                    sums: true,
                    sortable: true,
                },
                {
                    name: "description",
                    label: "Uwagi",
                    field: "description",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "updateDate",
                    label: "Data aktualizacji",
                    field: "updateDate",
                    align: "right",
                    sortable: true,
                }
            ]
        };
    },

    methods: {
      setNumericFormat,

        sumArea: function () {
            console.log(this.inventories)
            var totalArea= 0;
            this.inventories.forEach((inventory) => {
                    var tempQuantity = JSON.parse(inventory.quantity);
                    var tempWidth = JSON.parse(inventory.productWidth);
                    var tempLength = JSON.parse(inventory.productLength);
                    totalArea = totalArea + (tempQuantity*tempWidth*tempLength);
                    // jsonData.data.forEach(({ quantity }) => console.log(quantity));
                }

            )
            console.log(totalArea);
            return this.setNumericFormat(totalArea);
        },

        getProductTypes: function () {
            const url = this.$API_URL + "product-types";

            axios
                .get(url, {
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.productTypes = response.data;
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie masz uprawnień lub zostałeś wylogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
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

        getProducts: function () {
            const url = this.$API_URL + "products";

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { Authorization: localStorage.getItem("token") }
                })
                .then((response) => {
                    this.products = response.data;
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie masz uprawnień lub zostałeś wylogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd pobierania listy produktów",
                            icon: "report_problem",
                        });
                    };
                });
        },

        editProduct: function (props) {
            this.editedProduct = Object.assign({}, props.row);
            this.productType = this.editedProduct.productType;
            this.showEditProductDialog = true;
        },

        updateProduct: function (editedProduct) {
            const url = this.$API_URL + "products";

            axios
                .put(url, {
                    id: this.editedProduct.id,
                    name: this.editedProduct.name,
                    description: this.editedProduct.description,
                    active: this.editedProduct.active,
                    productType: this.productType
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano dane produktu",
                        icon: "check_circle_outline",
                    });
                    this.getProducts();
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie masz uprawnień lub zostałeś wylogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd aktualizacji produktu",
                            icon: "report_problem",
                        });
                    };
                });
        },

        showDetailProduct: function (props) {
            this.detailProduct = Object.assign({}, props);
            this.getInventoriesByProductId();
            this.hiddenColumn();
            this.sumArea();
            this.showDetailProductDialog = true;
        },

        getInventoriesByProductId: function () {
            const url =
                this.$API_URL + "inventories/products/" + this.detailProduct.id;

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.inventories = response.data;
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie masz uprawnień lub zostałeś wylogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd pobierania informacji o stanach magazynowych",
                            icon: "report_problem",
                        });
                    };
                });
        },

        // activateProduct: function (props) {
        //     var url = this.$API_URL;
        //     var message = "";

        //     if (props.row.active == false) {
        //         this.message = "Dezaktywowano";
        //         url = url + "products/deactivate/" + props.row.id;
        //         console.log('dezaktywacja: ' + url);
        //     } else {
        //         this.message = "Aktywowano";
        //         url = url + "products/activate/" + props.row.id;
        //         console.log('aktywacja: ' + url);
        //     }

        //     axios
        //         .patch(url, {
        //             headers: { Authorization: localStorage.getItem("token") }
        //         }, {
        //             contentType: "application/json"
        //         })
        //         .then((response) => {
        //             this.$q.notify({
        //                 color: "positive",
        //                 position: "top",
        //                 message: this.message + " produkt: " + props.row.name,
        //                 icon: "check_circle_outline",
        //             });
        //         })
        //         .catch((error) => {
        //             if (error.response.status === 403) {
        //                 this.$q.notify({
        //                     color: "negative",
        //                     position: "top",
        //                     message: "Nie masz uprawnień lub zostałeś wylogowany",
        //                     icon: "report_problem",
        //                 });
        //                 this.$router.push("/login")
        //             } else {
        //                 this.$q.notify({
        //                         color: "negative",
        //                         position: "top",
        //                         message: "Błąd aktywacji/dezaktywacji produktu!",
        //                         icon: "report_problem",
        //                     }),
        //                     this.getProducts();
        //             }
        //         });
        // },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie productu</span>",
                    message: "<span class=text-negative>Czy usunąć produkt: <strong>" +
                        props.row.name +
                        "</strong>?",
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
            const url = this.$API_URL + "products/" + id;

            axios
                .delete(url, {
                    headers: { "Authorization": localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Usunięto produkt",
                            icon: "check_circle_outline",
                        }),
                        this.getProducts();
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie masz uprawnień lub zostałeś wylogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd usuwania produktu!",
                            icon: "report_problem",
                        });
                    };
                });
        },

        onRowClick: function (props) {
            this.activeRowIndex = props.rowIndex;
        },

        filterProductTypes(val, update, abort) {
            update(() => {
                if (!val) return (this.filteredProductTypes = [...this.productTypes]);

                const needle = val.toLowerCase();
                this.filteredProductTypes = this.productTypes.filter((v) => `${v.name}`.indexOf(needle) > -1);
            });
        },

        hiddenColumn: function () {
            this.visibleColumns = [];

            if (this.detailProduct.productType.calculate ?
                this.visibleColumns = ["index", "productWidth", "productLength", "quantity", "area", "description", "updateDate"] :
                this.visibleColumns = ["index", "productWidth", "productLength", "quantity", "description", "updateDate"]);

        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    }
}
</script>

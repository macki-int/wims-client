<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <div class="row">
            <div class="col-6-md q-pr-md">
                <q-card class="my-card fit" style="min-width: 40vw; min-height: 75vh">
                    <q-card-section>
                        <div class="text-h6 text-primary">
                            {{ productType.name }}
                            <q-checkbox v-on:input="getProductsAndQuantityByProductTypeId" class="text-body2 text-dark q-pl-xl" size="xs" color="grey" v-model="showZeroValue" label="Pokaż stany zerowe"></q-checkbox>
                            <q-checkbox v-on:input="getProductsAndQuantityByProductTypeId" class="text-body2 text-dark q-pl-md" size="xs" color="grey" v-model="showActiveProduct" label="Pokaż nieaktywne produkty"></q-checkbox>
                        </div>
                    </q-card-section>
                    <q-table dense flat :data="products" :columns="columns" row-key="id" :visible-columns="visibleColumns" :filter="filter" :pagination.sync="pagination" hide-no-data color="primary" v-bind:request="getProductsAndQuantityByProductTypeId">
                        <template slot="top-left">
                            <q-badge class=" float-right" outline color="primary">stan na {{ maxUpdateDate[0] }}</q-badge>
                        </template>
                        <template slot="top-right">
                            <q-input dense v-model="filter" clear-icon="close" placeholder="Szukaj" clearable>
                                <template v-slot:prepend>
                                    <q-icon name="search" color="primary" />
                                </template>
                            </q-input>
                        </template>
                        <q-tr class="cursor-pointer" slot="body" slot-scope="props" :props="props" @click.native="onRowClick(props.row, props)" :class="props.rowIndex===activeRowIndex?'bg-blue-1':''">
                            <q-td key="index" :props="props" auto-width>
                                {{ props.rowIndex + 1 }}.
                            </q-td>
                            <q-td key="product" :props="props">
                                {{ props.row.inventory.product.name }}
                                <q-icon v-if="props.row.reservationCounter>0" class="text-weight-bolder" color="primary" size="16px" name="schedule">
                                    <q-tooltip content-class="bg-blue-8">Dodano rezerwację</q-tooltip>
                                </q-icon>
                                <q-icon v-if="props.row.inventory.description.length>0" class="text-weight-bolder" color="primary" size="16px" name="notes">
                                    <q-tooltip content-class="bg-blue-8">Dodano opis</q-tooltip>
                                </q-icon>
                            </q-td>
                            <q-td key="productWidth" :props="props" :class="props.row.inventory.mainDimension?'text-primary text-bold':''">
                                {{ setNumericFormat(props.row.inventory.productWidth) }}
                            </q-td>
                            <q-td key="productLength" :props="props" :class="props.row.inventory.mainDimension?'text-primary text-bold':''">
                                {{ setNumericFormat(props.row.inventory.productLength) }}
                            </q-td>
                            <q-td key="quantity" :props="props" :class="props.row.inventory.quantity==0?'text-negative text-bold':''">
                                {{ setNumericFormat(props.row.inventory.quantity) }}
                            </q-td>
                            <q-td key="area" :props="props" :class="props.row.inventory.quantity==0?'text-negative text-bold':''">
                                {{ setNumericFormat(props.row.inventory.productWidth * props.row.inventory.productLength * props.row.inventory.quantity) }}
                            </q-td>
                            <q-td key="active" :props="props">
                                <q-icon class="q-pr-md text-weight-bolder" color="primary" v-if="props.row.inventory.product.active" size="16px" name="radio_button_checked" />
                            </q-td>
                        </q-tr>
                    </q-table>
                </q-card>
            </div>

            <div class="col-3-md">
                <q-card class="my-card fit" style="min-width: 15vw; max-width: 21vw; min-height: 75vh">
                    <q-card-section>
                        <div class="q-pa-md">
                            <q-form v-on:submit="updateInventory" v-on:reset="dialogNewInventory=true" class="q-gutter-md">
                                <template>
                                    <div>
                                        <q-input dense full-width no-outline type="text" v-model="formProductName" style="font-size: 2em" readonly />
                                        <q-input dense full-width borderless v-model="formProductDescription" style="font-size: 0.9em" readonly />
                                        <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat label="Nowy towar" color="primary" v-on:click="dialogNewProduct = true" />
                                        <q-dialog v-model="dialogNewProduct" persistent>
                                            <q-card style="min-width: 15vw">
                                                <q-card-section>
                                                    <div class="text-primary">Nazwa nowego produktu:</div>
                                                </q-card-section>
                                                <q-card-section class="q-pt-none">
                                                    <q-input dense required v-model.trim="newProduct" :rules="[(val) => val && val.length > 0 || 'Podaj nazwę produktu']" v-on:keyup.enter="dialogNewProduct = false" autofocus />
                                                    <q-input dense v-model.trim="newProductDescription" v-on:keyup.enter="dialogNewProduct = false" label="Opis" />
                                                </q-card-section>
                                                <q-card-actions align="right" class="text-primary">
                                                    <q-btn flat label="Anuluj" v-close-popup />
                                                    <q-btn flat label="Zapisz" v-on:click="addProduct" v-close-popup />
                                                </q-card-actions>
                                            </q-card>
                                        </q-dialog>
                                        <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat :disabled="disabled" label="Nowy asortyment" type="reset" />
                                        <q-dialog v-model="dialogNewInventory" persistent>
                                            <q-card style="min-width: 15vw">
                                                <q-card-section>
                                                    <div class="text-primary">Dodawanie nowego asortymentu <br>dla produktu: <strong>{{ formProductName }}</strong> </div>
                                                </q-card-section>
                                                <q-card-section class="q-pt-none">
                                                    <q-input dense required v-model="formWidth" label="Szerokość" type="number" :decimals="3" :rules="[(val) => val > 0 && val.length > 0]" autofocus />
                                                    <q-input dense required v-model="formLength" label="Długość" type="number" :decimals="3" :rules="[(val) => val > 0 && val.length > 0]" />
                                                    <q-input dense required v-model="formQuantity" label="Ilość" type="number" :rules="[(val) => val > 0 && val.length > 0]" />
                                                    <q-input dense v-model="formDescription" label="Opis" type="textarea" autogrow />
                                                </q-card-section>
                                                <q-card-actions align="right" class="text-primary">
                                                    <q-btn flat label="Anuluj" v-close-popup />
                                                    <q-btn flat label="Zapisz" v-on:click.prevent="addInventory" v-close-popup />
                                                </q-card-actions>
                                            </q-card>
                                        </q-dialog>
                                    </div>
                                </template>
                                <q-separator color="primary" class="q-ml-sm" size="2px" />
                                <div class="row">
                                    <div v-if="formUpdateDate!=''">
                                        <q-badge class="float-left" outline color="primary">aktualizacja {{ formUpdateDate }}</q-badge>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col q-mr-lg">
                                        <q-input required v-on:input="onChange" style="min-width: 5vw" full-width no-outline type="number" :decimals="3" :step="0.01" v-model.number="formWidth" label="Szerokość" ref="width" />
                                    </div>
                                    <div class="col q-mr-lg">
                                        <q-input required v-on:input="onChange" style="min-width: 5vhw" full-width no-outline type="number" :decimals="3" :step="0.01" v-model.number="formLength" label="Długość" />
                                    </div>
                                    <div class="col">
                                        <q-input required v-on:input="onChange" style="min-width: 5vw" :input-style="{ color: '#1976D2', fontWeight:'600' }" full-width no-outline type="number" :decimals="2" v-model.number="formQuantity" label="Ilość" />
                                    </div>
                                </div>
                                <div class="row" v-if="productType.calculate">
                                    <div class="col q-mr-lg">
                                        <q-input full-width no-outline readonly type="number" v-model.number="formArea" label="Powierzchnia" />
                                    </div>
                                    <div class="col q-mt-md">
                                        <q-checkbox class="q-pt-md" dense v-model="formMainDimension" size="sm" color="grey" label="Standardowy" />
                                    </div>
                                </div>
                                <q-input full-width no-outline type="textarea" autogrow v-model="formDescription" label="Opis" />
                                <div>

                                    <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat :disabled="disabled" label="Zapisz" type="submit" color="primary" />
                                    <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat :disabled="disabled" label="Usuń" v-on:click="confirmDeleteInventory" color="negative" />
                                </div>
                                <q-separator color="primary" class="q-ml-sm" size="2px" />
                                <ProductReservation ref="refReservation" />
                            </q-form>
                            <!-- <q-badge v-if="!newInventoryIndicator && !disabled" outline color="primary" align="middle" label="Edytujesz istniejący asortyment" /> -->
                        </div>
                    </q-card-section>

                </q-card>
            </div>
        </div>
    </div>
</q-page>
</template>

<script>
import axios from "axios";
import ProductReservation from "components/ProductReservation.vue";
import { setNumericFormat } from "../js/setNumericFormat.js";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "StockLevels",

    components: {
        ProductReservation,
    },

    watch: {
        $route(to, from) {
            this.getProductType();
            this.clearFilterField();
            this.getProductsAndQuantityByProductTypeId();
            this.recalculateArea();
            this.getMaxUpdateDateByProductType();
        },
    },

    mounted() {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
        this.getProductType();
        this.clearFilterField();
        this.getProductsAndQuantityByProductTypeId();
        this.getMaxUpdateDateByProductType();

        this.$root.$on("refreshProducts", () => {
            this.getProductsAndQuantityByProductTypeId();
        });
    },

    destroyed: function () {
        this.$root.$off("refreshProducts");
    },

    data() {
        return {
            activeRowIndex: "",
            counter: 0,
            productType: [],
            maxUpdateDate: [],
            newProduct: "",
            newProductDescription: "",
            product: "",
            products: [],

            formInventoryId: "",
            formProductName: "",
            formProductDescription: "",
            formWidth: "",
            formLength: "",
            formQuantity: "",
            formArea: "",
            formActiveValue: true,
            formDescription: "",
            formMainDimension: "",
            formUpdateDate: "",

            showZeroValue: true,
            showActiveProduct: false,

            disabled: true,
            dialogNewProduct: false,
            dialogNewInventory: false,

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 20
            },

            filter: "",

            loggedUser: {
                username: "",
                firstName: "",
                lastName: "",
                role: "",
                active: ""
            },

            visibleColumns: ["index", "product", "productWidth", "productLength", "quantity", "area", "active"],
            // visibleColumns: ["index", "id", "product", "productWidth", "productLength", "quantity", "area", "active"],

            columns: [{
                    name: "index",
                    label: "Lp",
                    field: "",
                    align: "right"
                },
                // {
                //     name: "id",
                //     label: "ID",
                //     field: (row) => row.inventory.id,
                //     align: "right"
                // },
                {
                    name: "product",
                    label: "Nazwa",
                    field: (row) => row.inventory.product.name,
                    align: "left",
                    sortable: true
                },
                {
                    name: "productWidth",
                    label: "Szerokość",
                    field: (row) => row.inventory.productWidth,
                    align: "right",
                    sortable: true
                },
                {
                    name: "productLength",
                    label: "Długość",
                    field: (row) => row.inventory.productLength,
                    align: "right",
                    sortable: true
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: (row) => row.inventory.quantity,
                    align: "right",
                    sortable: true
                },
                {
                    name: "area",
                    label: "Powierzchnia",
                    field: "",
                    align: "right"
                },
                {
                    name: "active",
                    label: "Aktywny",
                    field: (row) => row.inventory.product.active,
                    align: "right",
                    sortable: true
                }
            ]
        };
    },

    methods: {
        setNumericFormat,

        getProductType: function () {
            const url = this.$API_URL + "product-types/" + this.$route.params.id;

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.productType = response.data;
                    this.hiddenColumn();
                    this.clearFormInventory();
                    this.clearReservationTable();
                    // alert(event.target.tagName);
                    // console.log('response: ' + JSON.stringify(response.data));
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else if (error.response.status === 500) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Strona nie istnieje",
                            icon: "report_problem",
                        });
                        this.$root.$emit("logout", item, response)
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

        getProductsAndQuantityByProductTypeId: function () {
            const url = this.$API_URL + "products/product-types/" + this.$route.params.id;

            axios
                .get(url, {
                    params: {
                        withZeroValue: this.showZeroValue,
                        withInactiveValue: this.showActiveProduct,
                    },
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.products = response.data;
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        // this.$router.push("/login")
                        this.$root.$emit("logout", item, response)
                    } else if (error.response.status === 500) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Strona nie istnieje",
                            icon: "report_problem",
                        });
                        // this.$router.push("/login")
                        this.$root.$emit("logout", item, response)
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd pobierania stanów magazynowych",
                            icon: "report_problem",
                        });
                    };
                });
        },

        getMaxUpdateDateByProductType: function () {
            const url =
                this.$API_URL + "products/product-types/max-update-date/" +
                this.$route.params.id;

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.maxUpdateDate = response.data;
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd pobierania daty odstatniej aktualizacji stanów magazynowych",
                            icon: "report_problem",
                        });
                    };
                });
        },

        addProduct: function () {
            const url = this.$API_URL + "products";

            axios
                .post(url, {
                    name: this.newProduct,
                    description: this.newProductDescription,
                    productType: this.productType,
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nowy produkt",
                        icon: "check_circle_outline",
                    });
                    this.formProductId = response.data.id;
                    this.formProductName = response.data.name;
                    this.formProductDescription = response.data.description;
                    this.dialogNewInventory = true;
                    // console.log('post product:' + response.data.id);
                    // return response.data;
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd dodawania noweg produktu",
                            icon: "report_problem",
                        });
                    };
                });
        },

        updateProduct: function () {
            const url = this.$API_URL + "products";

            axios
                .put(url, {
                    id: this.formProductId,
                    active: this.formActiveValue,
                    name: this.formProductName,
                    name: this.formProductDescription,
                    productType: this.productType,
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano nazwę produktu",
                        icon: "check_circle_outline",
                    });
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd aktualizacji nazwy produktu",
                            icon: "report_problem",
                        });
                    };
                });
        },

        addInventory: function () {
            const url = this.$API_URL + "inventories";

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
                    mainDimension: this.formMainDimension
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Dodano nowy stan magazynu",
                            icon: "check_circle_outline",
                        }),
                        (this.disabled = true);

                    this.getProductsAndQuantityByProductTypeId();
                    this.getMaxUpdateDateByProductType();
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd dodawania nowego stanu magazynu",
                            icon: "report_problem",
                        });
                    };
                });
        },

        updateInventory: function () {
            const url = this.$API_URL + "inventories";

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
                    description: this.formDescription,
                    mainDimension: this.formMainDimension
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Zaktualizowano stan magazynu",
                            icon: "check_circle_outline",
                        }),
                        (this.disabled = true);
                    this.getProductsAndQuantityByProductTypeId();
                    this.getMaxUpdateDateByProductType();
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Bład aktualizacji stanu magazynu",
                            icon: "report_problem",
                        });
                    };
                });
        },

        confirmDeleteInventory: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie asortymentu</span>",
                    message: "<span class=text-negative>Czy usunąć asortyment: " +
                        this.formWidth + " x " + this.formLength + " (ilość: " + this.formQuantity + ")" +
                        "<br>" +
                        "produktu: <strong>" + this.formProductName + "</strong>?</span>",
                    color: 'negative',
                    html: true,
                    persistent: true,
                    ok: {
                        label: 'usuń',
                        flat: true
                    },
                    cancel: true,
                }).onOk(() => {
                    this.deleteInventory(this.formInventoryId);
                })
        },

        deleteInventory: function (id) {
            const url = this.$API_URL + "inventories/" + id;

            axios
                .delete(url, {
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Usunięto asortyment",
                        icon: "check_circle_outline",
                    });
                    // this.getReservationsByInventoryId();
                    getProductsAndQuantityByProductTypeId();
                })
                .catch((error) => {
                    if (error.response.status === 403) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Nie jesteś zalogowany",
                            icon: "report_problem",
                        });
                        this.$router.push("/login")
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd usuwania asortymentu!",
                            icon: "report_problem",
                        });
                    };
                });
        },

        onRowClick: function (product, props) {
            this.activeRowIndex = props.rowIndex;
            this.formProductId = product.inventory.product.id;
            this.formProductName = product.inventory.product.name;
            this.formProductDescription = product.inventory.product.description;
            this.formInventoryId = product.inventory.id;
            this.formWidth = product.inventory.productWidth;
            this.formLength = product.inventory.productLength;
            this.formQuantity = product.inventory.quantity;
            this.formDescription = product.inventory.description;
            this.formMainDimension = product.inventory.mainDimension;
            this.formUpdateDate = product.inventory.updateDate;
            this.formActiveValue = product.inventory.product.active;

            this.newProduct = "";
            this.newProductDescription = "";
            this.disabled = false;
            this.recalculateArea();
            // console.log(props)

            EventBus.$emit("click", product);
            this.$refs.refReservation.getReservationsByInventoryId();

        },

        onChange: function () {
            if (this.formProductName.length > 0) {
                this.disabled = false;
            }
            this.recalculateArea();
        },

        recalculateArea: function () {
            if (this.productType.calculate) {
                this.formArea = this.formWidth * this.formLength * this.formQuantity;
            }
        },

        clearFormInventory: function () {
            this.formInventoryId = "";
            this.formProductName = "";
            this.formProductDescription = "";
            this.formWidth = "";
            this.formLength = "";
            this.formQuantity = "";
            this.formArea = "";
            this.formUpdateDate = "";
            this.formActiveValue = true;
            this.formDescription = "";
            this.formProductName = "";
            this.disabled = true;
            this.activeRowIndex="";
        },

        clearReservationTable: function () {
            this.$refs.refReservation.clearReservationTable();
        },

        clearFilterField: function () {
            this.filter = "";
        },

        hiddenColumn: function () {
            this.visibleColumns = [];

            if (this.productType.calculate ?
                // this.visibleColumns = ["index", "id", "product", "productWidth", "productLength", "quantity", "area", "active"] :
                this.visibleColumns = ["index", "product", "productWidth", "productLength", "quantity", "area", "active"] :
                // this.visibleColumns = ["index", "id", "product", "productWidth", "productLength", "quantity", "active"]);
                this.visibleColumns = ["index", "product", "productWidth", "productLength", "quantity", "active"]);
        }
    },

};
</script>

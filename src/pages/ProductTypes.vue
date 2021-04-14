<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card fit" style="min-width: 40vw; min-height: 75vh">
            <q-table dense flat :data="productTypes" :columns="columns" row-key="name" :filter="filter" :pagination.sync="pagination" hide-no-data color="primary" v-bind:request="getProductTypes">
                <template slot="top-left">
                    <div class="q-pa-sm text-h6 text-primary">
                        Lista kategorii
                    </div>
                </template>
                <template slot="top-right">
                    <q-input dense v-model="filter" clearable>
                        <template v-slot:prepend>
                            <q-icon name="search" color="primary" />
                        </template>
                    </q-input>
                </template>
                <template slot="body" slot-scope="props">
                    <q-tr :props="props">
                        <q-td key="name" :props="props">
                            {{ props.row.name }}
                        </q-td>
                        <q-td key="calculate" :props="props">
                            <q-icon class="q-pr-md text-weight-bolder" color="primary" v-if="props.row.calculate" size="16px" name="radio_button_checked" />
                        </q-td>
                        <q-td key="action" :props="props">
                            <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editProductType(props)">
                                <q-tooltip content-class="bg-blue-8">Edytuj kategorię</q-tooltip>
                            </q-btn>
                            <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                                <q-tooltip content-class="bg-red">Usuń kategorię</q-tooltip>
                            </q-btn>
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
            <q-card-section>
                <NewProductType />
            </q-card-section>
        </q-card>
        <q-dialog v-model="showEditProductTypeDialog" persistent>
            <q-card style="min-width: 15vw">
                <q-card-section>
                    <div class="text-primary">Edycja kategorii</div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-input dense v-model="editedProductType.name" label="Nazwa kategorii" :rules="[(val) => val && val.length > 0 || 'Podaj nazwę kategorii']" />
                    <q-checkbox class="q-pt-md" dense v-model="editedProductType.calculate" size="sm" label="Oblicz powierzchnię" />
                </q-card-section>
                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Anuluj" v-close-popup />
                    <q-btn flat label="Zapisz" v-on:click="updateProductType(editedProductType)" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</q-page>
</template>

<script>
import axios from "axios";
import NewProductType from "components/NewProductType.vue";

export default {
    name: "ProductTypes",

    components: {
        NewProductType
    },

    mounted() {
        this.getLoggedUserFromLocalStore();
        this.getProductTypes();

        this.$root.$on("refreshProductTypes", () => {
            this.getProductTypes();
        });
    },

    destroyed: function () {
        $off("refreshProductTypes");
    },

    data() {
        return {
            showEditProductTypeDialog: false,

            productTypes: [],
            editedProductType: [],

            search: "",
            filter: "",

            loggedUser: "",

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 20,
            },

            columns: [{
                    name: "name",
                    label: "Nazwa",
                    field: "name",
                    align: "left",
                    sortable: true
                },
                {
                    name: "calculate",
                    label: "Oblicz pow.",
                    field: "calculate",
                    align: "right",
                    sortable: true
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                }
            ],
        }
    },

    methods: {
        getProductTypes: function () {
            const url = this.$API_URL + "product-types/";

            axios
                .get(url, {
                    contentType: "application/json",
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

        editProductType: function (props) {
            this.editedProductType = Object.assign({}, props.row);
            this.showEditProductTypeDialog = true;
        },

        updateProductType: function (editedProductType) {
            const url = this.$API_URL + "product-types";

            axios
                .put(url, {
                    id: this.editedProductType.id,
                    name: this.editedProductType.name,
                    calculate: this.editedProductType.calculate
                }, {
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano kategorię",
                        icon: "check_circle_outline",
                    });
                    // this.getProductTypes();
                    this.$root.$emit("refreshProductTypes");
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
                            message: "Błąd aktualizacji nazwy kategorii",
                            icon: "report_problem",
                        });
                    };
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie kategorii</span>",
                    message: "<span class=text-negative>Czy usunąć kategorię: <strong>" +
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
                    this.deleteProductType(props.row.id);
                });
        },

        deleteProductType: function (id) {
            const url = this.$API_URL + "product-types/" + id;

            axios
                .delete(url, {
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Usunięto kategorię",
                        icon: "check_circle_outline",
                    });
                    // this.getProductTypes();
                    this.$root.$emit("refreshProductTypes");
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
                            message: "Błąd usuwania kategorii",
                            icon: "report_problem",
                        });
                    };
                });
        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    }
}
</script>

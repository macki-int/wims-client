<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card fit" style="min-width: 60vw; min-height: 75vh">
            <q-card>
                <q-table dense flat :data="deliveries" :columns="columns" row-key="name" :filter="filter" :pagination.sync="pagination" hide-no-data color="primary" v-bind:request="getDeliveriesInProgress">
                    <template slot="top-left">
                        <div class="q-pa-sm text-h6 text-primary">
                            Lista aktualnych dostaw
                        </div>
                    </template>
                    <template slot="top-right">
                        <q-input dense v-model="filter" clear-icon="close" placeholder="Szukaj" clearable>
                            <template v-slot:prepend>
                                <q-icon name="search" color="primary" />
                            </template>
                        </q-input>
                    </template>
                    <template slot="body" slot-scope="props">
                        <q-td key="index" :props="props" auto-width>
                            {{ props.rowIndex + 1 }}.
                        </q-td>
                        <q-td key="product" :props="props">
                            {{ props.row.inventory.product.name}}
                        </q-td>
                        <q-td key="dateOfDelivery" :props="props">
                            {{ props.row.dateOfDelivery }}
                        </q-td>
                        <q-td key="description" :props="props">
                            {{ props.row.description }}
                        </q-td>
                        <q-td key="quantity" :props="props">
                            {{ props.row.quantity }}
                        </q-td>
                        <q-td key="area" :props="props" :class="props.row.inventory.product.productType.calculate?'':'invisible'">
                            {{ setNumericFormat(props.row.inventory.productWidth * props.row.inventory.productLength * props.row.quantity) }}
                        </q-td>
                        <q-td key="action" :props="props">
                            <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                                <q-tooltip content-class="bg-red">Usuń dostawę</q-tooltip>
                            </q-btn>
                        </q-td>
                    </template>
                </q-table>
            </q-card>
        </q-card>
    </div>
</q-page>
</template>

<script>
import axios from "axios";
import { setNumericFormat } from "../js/setNumericFormat.js";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "AllDeliveriesInProgress",

    mounted() {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
        this.getDeliveriesInProgress();
    },

    data() {
        return {
            activeRowIndex: "",

            filter: "",

            loggedUser: {
                username: "",
                firstName: "",
                lastName: "",
                role: "",
                active: ""
            },

            deliveries: [],

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
                    align: "right",
                    style: "max-width: 10px",
                    headerStyle: "max-width: 10px"
                },
                {
                    name: "product",
                    label: "Wyrób",
                    field: (row) => row.inventory.product.name,
                    align: "left",
                    sortable: true,
                    style: "max-width: 70px",
                    headerStyle: "max-width: 70px"
                },
                {
                    name: "dateOfDelivery",
                    label: "Data dostawy",
                    field: "dateOfDelivery",
                    align: "left",
                    sortable: true,
                    style: "max-width: 50px",
                    headerStyle: "max-width: 50px"
                },
                {
                    name: "description",
                    label: "Opis",
                    field: "description",
                    align: "left",
                    sortable: true,
                    style: "max-width: 70px",
                    headerStyle: "max-width: 70px"
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: "quantity",
                    align: "right",
                    sortable: true,
                    style: "max-width: 30px",
                    headerStyle: "max-width: 30px"
                },
                {
                    name: "area",
                    label: "Pow.",
                    field: "",
                    align: "right",
                    style: "max-width: 40px",
                    headerStyle: "max-width: 40px"
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                    style: "max-width: 30px",
                    headerStyle: "max-width: 30px"
                }
            ]
        }

    },

    methods: {
        setNumericFormat,

        getDeliveriesInProgress: function () {
            const url = this.$API_URL + "deliveries/valid-date";

            axios
                .get(url, {
                    params: {
                        date: new Date().toJSON().slice(0, 10)
                    },
                    contentType: "application/json",
                    dataType: "json",
                    headers: { Authorization: localStorage.getItem("token") }
                })
                .then((response) => {
                    this.deliveries = response.data;
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
                            message: "Błąd pobierania listy dostaw",
                            icon: "report_problem",
                        });
                    };
                });
        },

        onRowClick: function (props) {
            this.activeRowIndex = props.rowIndex;
        }
    }
}
</script>

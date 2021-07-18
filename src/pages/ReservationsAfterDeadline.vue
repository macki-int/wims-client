<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card fit" style="min-width: 60vw; min-height: 75vh">
            <q-card>
                <q-table dense flat :data="reservations" :columns="columns" row-key="name" :filter="filter" :pagination.sync="pagination" hide-no-data color="primary" v-bind:request="getReservations">
                    <template slot="top-left">
                        <div class="q-pa-sm text-h6 text-primary">
                            Lista rezerwacji z przekroczoną datą ważności
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
                            <q-td key="username" :props="props">
                                {{ props.row.user.username }}
                            </q-td>
                            <q-td key="product" :props="props">
                                {{ props.row.inventory.product.name}}
                            </q-td>
                            <q-td key="width" :props="props">
                                {{ setNumericFormat(props.row.inventory.productWidth) }}
                            </q-td>
                            <q-td key="length" :props="props">
                                {{ setNumericFormat(props.row.inventory.productLength) }}
                            </q-td>
                            <q-td key="quantity" :props="props">
                                {{ props.row.quantity }}
                            </q-td>
                            <q-td key="area" :props="props" :class="props.row.inventory.product.productType.calculate?'':'invisible'">
                                {{ setNumericFormat(props.row.inventory.productWidth * props.row.inventory.productLength * props.row.quantity) }}
                            </q-td>
                            <q-td key="startDate" :props="props">
                                {{ props.row.startDate }}
                            </q-td>
                            <q-td key="stopDate" :props="props">
                                {{ props.row.stopDate }}
                            </q-td>
                            <q-td key="description" :props="props">
                                {{ props.row.description }}
                            </q-td>

                            <q-td key="action" :props="props">
                                <!-- <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editReservation(props)">
                                    <q-tooltip content-class="bg-blue-8">Edytuj rezerwację</q-tooltip>
                                </q-btn> -->
                                <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                                    <q-tooltip content-class="bg-red">Usuń rezerwację</q-tooltip>
                                </q-btn>
                            </q-td>
                        </q-tr>
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
    name: "ReservationsAfterDeadline",

    mounted() {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
        this.getReservations();
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

            reservations: [],

            search: "",

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 20,
            },

            columns: [{
                    name: "username",
                    label: "Użytkownik",
                    field: (row) => row.user.username,
                    align: "left",
                    sortable: true,
                    style: "max-width: 50px",
                    headerStyle: "max-width: 50px"
                },
                {
                    name: "product",
                    label: "Wyrób",
                    field: (row) => row.inventory.product.name,
                    align: "left",
                    sortable: true,
                    style: "max-width: 50px",
                    headerStyle: "max-width: 50px"
                },
                {
                    name: "width",
                    label: "Szer.",
                    field: (row) => row.inventory.productWidth,
                    align: "right",
                    sortable: true,
                    style: "max-width: 30px",
                    headerStyle: "max-width: 30px"
                },
                {
                    name: "length",
                    label: "Dł.",
                    field: (row) => row.inventory.productLength,
                    align: "right",
                    sortable: true,
                    style: "max-width: 40px",
                    headerStyle: "max-width: 40px"
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
                    name: "startDate",
                    label: "Start",
                    field: "startDate",
                    align: "right",
                    sortable: true,
                    style: "max-width: 40px",
                    headerStyle: "max-width: 40px"
                },
                {
                    name: "stopDate",
                    label: "Koniec",
                    field: "stopDate",
                    align: "right",
                    sortable: true,
                    style: "max-width: 40px",
                    headerStyle: "max-width: 40px"
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
                    name: "action",
                    align: "right",
                    field: "",
                    style: "max-width: 30px",
                    headerStyle: "max-width: 30px"
                }
            ],

        }
    },

    methods: {
        setNumericFormat,

        getReservations: function () {
            const url = this.$API_URL + "reservations/expire";

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
                    this.reservations = response.data;
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
                            message: "Błąd pobierania listy rezerwacji",
                            icon: "report_problem",
                        });
                    };
                });
        },

        editReservation: function (props) {

        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie rezerwacji</span>",
                    message: "<span class=text-negative>Czy usunąć rezerwację produktu: <strong>" + props.row.inventory.product.name + "</strong>" +
                        "<br>" +
                        "dla ilości: <strong>" + props.row.inventory.productWidth * props.row.inventory.productLength * props.row.quantity +
                        "</strong> (" + props.row.inventory.productWidth + " x " + props.row.inventory.productLength + ")" +
                        "<br>" +
                        "użytkownika: <strong>" + props.row.user.username + "</strong>?</span>",
                    color: 'negative',
                    html: true,
                    persistent: true,
                    ok: {
                        label: 'usuń',
                        flat: true
                    },
                    cancel: true,
                }).onOk(() => {
                    this.deleteReservation(props.row.id);
                })
        },

        deleteReservation: function (id) {
            const url = this.$API_URL + "reservations/" + id;

            axios
                .delete(url, {
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Usunięto rezerwację",
                        icon: "check_circle_outline",
                    });
                    // this.getReservationsByInventoryId();
                    getReservations();
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
                            message: "Błąd usuwania rezerwacji!",
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

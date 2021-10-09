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

            deliveries: [],

            search: "",

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 20,
            },
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

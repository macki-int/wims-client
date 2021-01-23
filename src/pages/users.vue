<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card" style="min-width: 650px">
            <q-card>
                <q-table dense flat :data="users" :columns="columns" row-key="name" :pagination.sync="pagination" v-bind:request="getUsers">
                    <q-tr slot="body" slot-scope="props" :props="props">
                        <q-td key="username" :props="props">
                            {{ props.row.username }}
                        </q-td>
                        <q-td key="firstName" :props="props">
                            {{ props.row.firstName }}
                        </q-td>
                        <q-td key="lastName" :props="props">
                            {{ props.row.lastName }}
                        </q-td>
                        <q-td key="role" :props="props">
                            {{ props.row.role }}
                        </q-td>
                        <q-td key="action" :props="props">
                            <q-btn flat size="sm" dense unelevated color="positive" icon="more_horiz" v-on:click="detailUser(props.row)">
                                <q-tooltip content-class="bg-blue-8">Pokaż rezerwacje produktów przypisane do użytkownika</q-tooltip>
                            </q-btn>
                            <q-btn flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editUser(props)">
                                <q-tooltip content-class="bg-blue-8">Edytuj użytkownika</q-tooltip>
                            </q-btn>
                            <q-btn flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                                <q-tooltip content-class="bg-red">Usuń użytkownika</q-tooltip>
                            </q-btn>
                        </q-td>
                    </q-tr>
                </q-table>
            </q-card>

            <q-dialog v-model="showEditUserDialog">
                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Anuluj" v-close-popup />
                    <q-btn flat label="Zapisz" v-on:click="updateUser(editedUser)" v-close-popup />
                </q-card-actions>
            </q-dialog>
        </q-card>
    </div>

</q-page>
</template>

<script>
import axios from "axios";

export default {
    name: "Users",

    mounted() {
        this.getUsers();
    },

    data() {
        return {
            showEditUserDialog: false,
            showDetailUserDialog: false,

            editedUser: [],
            users: [],

            reservations: [],

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 10
            },

            columns: [{
                    name: "username",
                    label: "Nick",
                    field: "username",
                    align: "left",
                    sortable: true,
                }, {
                    name: "firstName",
                    label: "Imię",
                    field: "firstName",
                    align: "right",
                    sortable: true,
                }, {
                    name: "lastName",
                    label: "Nazwisko",
                    field: "firstName",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "role",
                    label: "Uprawnienia",
                    field: "role",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                },
            ],

        }
    },

    methods: {
        getUsers: function () {
            const url = this.$API_URL + "users";

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.users = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania listy użytkowników",
                        icon: "report_problem",
                    });
                });
        },

        editUser: function (props) {
            this.editedUser = Object.assign({}, props.row);
            this.showEditProductDialog = true;
        },

        updateUser: function (editedUser) {
            const url = this.$API_URL + "users";

            axios
                .put(url, {
                    id: this.editedUser.id,
                    username: this.editedUser.username,
                    firstName: this.editedUser.firstName,
                    lastName: this.editedUser.lastName,
                    // role: this.editedUser.role,
                    // active: this.editedUser.active,

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
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd aktualizacji produktu",
                        icon: "report_problem",
                    });
                });
        },

        detailUser: function (props) {
            this.detailedUser = Object.assign({}, props);
            this.getReservationsByUserId();
            this.showDetailUserDialog = true;
        },

        getReservationsByUserId: function () {
            const url =
                this.$API_URL + "reservations/users/" + this.detailedUser.id;

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.reservations = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania informacji o rezerwacjach użytkownika",
                        icon: "report_problem",
                    });
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie productu</span>",
                    message: "<span class=text-negative>Czy usunąć użytkownika: <strong>" +
                        props.row.username +
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
                    this.deleteUser(props.row.id);
                });
        },

        deleteUser: function (id) {
            const url = this.$API_URL + "users/" + id;

            axios
                .delete(url, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                            color: "positive",
                            position: "top",
                            message: "Usunięto użytkownika",
                            icon: "check_circle_outline",
                        }),
                        this.getUsers();
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd usuwania użytkownika!",
                        icon: "report_problem",
                    });
                });
        },

    }
}
</script>

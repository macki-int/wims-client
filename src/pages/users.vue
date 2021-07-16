<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card" style="min-width: 40vw; min-height: 75vh">
            <q-card>
                <q-table dense flat :data="users" :columns="columns" row-key="name" :filter="filter" :pagination.sync="pagination" v-bind:request="getUsers">
                    <template slot="top-left">
                        <div class="q-pa-sm text-h6 text-primary">
                            Lista użytkowników
                        </div>
                    </template>
                    <template slot="top-right">
                        <q-input dense v-model="filter" clear-icon="close" clearable>
                            <template v-slot:prepend>
                                <q-icon name="search" color="primary" />
                            </template>
                        </q-input>
                    </template>
                    <q-tr class="cursor-pointer" slot="body" slot-scope="props" :props="props" @click.native="onRowClick(props)" @dblclick="showDetailUser(props.row)" :class="props.rowIndex===activeRowIndex?'bg-blue-1':''">
                        <q-td key="role" :props="props">
                            <div v-if="props.row.role=='ROLE_ADMIN'">
                                <q-icon class="q-pr-md text-weight-bolder" color="negative" size="24px" name="person" />
                                <q-tooltip content-class="bg-negative">Administrator</q-tooltip>
                            </div>
                            <div v-else>
                                <q-icon class="q-pr-md text-weight-bolder" color="primary" size="24px" name="person" />
                                <q-tooltip content-class="bg-primary">Użytkownik</q-tooltip>
                            </div>
                            <!-- {{ props.row.role }} -->
                        </q-td>
                        <q-td key="username" :props="props">
                            {{ props.row.username }}
                        </q-td>
                        <q-td key="firstName" :props="props">
                            {{ props.row.firstName }}
                        </q-td>
                        <q-td key="lastName" :props="props">
                            {{ props.row.lastName }}
                        </q-td>
                        <q-td key="action" :props="props">
                            <q-btn flat size="sm" dense unelevated color="positive" icon="more_horiz" v-on:click="showDetailUser(props.row)">
                                <q-tooltip content-class="bg-blue-8">Pokaż rezerwacje produktów przypisane do użytkownika</q-tooltip>
                            </q-btn>
                            <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editUser(props)">
                                <q-tooltip content-class="bg-blue-8">Edytuj użytkownika</q-tooltip>
                            </q-btn>
                            <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="primary" icon="settings" v-on:click="resetPassword(props)">
                                <q-tooltip content-class="bg-blue-8">Resetuj hasło</q-tooltip>
                            </q-btn>
                            <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                                <q-tooltip content-class="bg-red">Usuń użytkownika</q-tooltip>
                            </q-btn>
                        </q-td>
                    </q-tr>
                </q-table>
                <q-card-section>
                    <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat label="Nowy Użytkownik" color="primary" v-on:click="showAddUserDialog = true" />
                </q-card-section>
            </q-card>
        </q-card>
        <template>
            <q-dialog v-model="showDetailUserDialog">
                <q-card style="min-width: 50vw">
                    <q-card-section>
                        <div class="text-primary">Zestawienie rezerwacji dla: <strong>{{ detailUser.username }}</strong></div>
                    </q-card-section>
                    <q-card-section>
                        <q-table dense flat :data="reservations" :columns="columnsDetails" row-key="name" v-bind:request="getReservationsByUserId">
                            <q-tr slot="body" slot-scope="props" :props="props">
                                <q-td key="productName" :props="props">
                                    {{ props.row.inventory.product.name }}
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
                                <q-td key="updateDate" :props="props">
                                    {{ props.row.updateDate }}
                                </q-td>
                            </q-tr>
                        </q-table>
                    </q-card-section>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="OK" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </template>
        <template>
            <q-dialog v-model="showEditUserDialog" persistent>
                <q-card style="min-width: 15vw">
                    <q-card-section>
                        <div class="text-primary">Edycja danych użytkownika:</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <q-input dense required v-model.trim="editedUser.username" label="Nick" type="text" :rules="[(val) => (val && val.length > 0) || 'Podaj nazwę użytkownika']" autofocus />
                        <q-input dense required v-model.trim="editedUser.firstName" label="Imię" type="text" :rules="[(val) => (val && val.length > 0) || 'Podaj imię użytkownika']" />
                        <q-input dense required v-model.trim="editedUser.lastName" label="Nazwisko" type="text" :rules="[(val) => (val && val.length > 0) || 'Podaj nazwisko użytkownika']" />
                        <q-select dense required v-model="editedUser.role" :options="optionsRole" label="Uprawnienia" />
                    </q-card-section>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Anuluj" v-close-popup />
                        <q-btn flat label="Zapisz" v-on:click="updateUser(editedUser)" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </template>
        <template>
            <q-dialog v-model="showAddUserDialog" persistent>
                <q-card style="min-width: 15vw">
                    <q-card-section>
                        <div class="text-primary">Dodawanie użytkownika:</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <q-input dense required v-model.trim="newUsername" label="Nick" type="text" :rules="[(val) => (val && val.length > 0) || 'Podaj nazwę użytkownika']" autofocus />
                        <q-input dense required v-model.trim="newFirstName" label="Imię" type="text" :rules="[(val) => (val && val.length > 0) || 'Podaj imię użytkownika']" />
                        <q-input dense required v-model.trim="newLastName" label="Nazwisko" type="text" :rules="[(val) => (val && val.length > 0) || 'Podaj nazwisko użytkownika']" />
                        <q-input dense required v-model="newPassword" label="Hasło" type="password" :rules="[(val) => (val && val.length > 0) || 'Podaj hasło']" />
                        <q-select dense required v-model="newRole" :options="optionsRole" label="Uprawnienia" />
                    </q-card-section>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Anuluj" v-close-popup />
                        <q-btn flat label="Zapisz" v-on:click="addUser" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </template>
        <template>
            <q-dialog v-model="showResetUserPasswordDialog" persistent>
                <q-card style="min-width: 15vw">
                    <q-card-section>
                        <div class="text-primary">Resetowanie hasła użytkownika: <strong>{{ editedUser.username }}</strong></div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <!-- <q-input dense v-model="oldUserPassword" label="Aktualne hasło" type="password" :rules="[(val) => (val && val.length > 0) || 'Podaj aktualne hasło']" /> -->
                        <q-input dense required v-model="newUserPassword" label="Nowe hasło" type="password" :rules="[(val) => (val && val.length > 0) || 'Podaj nowe hasło']" autofocus />
                        <q-input dense required v-model="newUserPassword2" label="Powtórz hasło" type="password" :rules="[(val) => (newUserPassword === newUserPassword2) || 'Hasła nie są identyczne']" />
                    </q-card-section>
                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Anuluj" v-close-popup />
                        <q-btn flat label="Zapisz" v-on:click="updateUserPassword(editedUser)" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </template>
    </div>

</q-page>
</template>

<script>
import axios from "axios";
import { setNumericFormat } from "../js/setNumericFormat.js";

export default {
    name: "Users",

    mounted() {
        this.getLoggedUserFromLocalStore()
        this.getUsers();
    },

    data() {
        return {
            activeRowIndex: "",

            showEditUserDialog: false,
            showResetUserPasswordDialog: false,
            showDetailUserDialog: false,
            showAddUserDialog: false,

            editedUser: [],
            users: [],

            detailUser: [],

            filter: "",
            loggedUser: "",

            newUsername: "",
            newFirstName: "",
            newLastName: "",
            newPassword: "",
            newRole: "ROLE_USER",

            oldUserPassword: "",
            newUserPassword: "",
            newUserPassword2: "",

            reservations: [],

            pagination: {
                sortBy: "type",
                descending: false,
                rowsPerPage: 20
            },

            columns: [{
                    name: "role",
                    label: "Rola",
                    field: "role",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "username",
                    label: "Nick",
                    field: "username",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "firstName",
                    label: "Imię",
                    field: "firstName",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "lastName",
                    label: "Nazwisko",
                    field: "firstName",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                },
            ],

            optionsRole: [
                'ROLE_USER',
                'ROLE_ADMIN'
            ],

            columnsDetails: [{
                    name: "productName",
                    label: "Nazwa",
                    field: (row) => row.inventory.product,
                    field: "",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "width",
                    label: "Szerokość",
                    field: "width",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "length",
                    label: "Długość",
                    field: "length",
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
                    sortable: true,
                },
                {
                    name: "startDate",
                    label: "Start rezerwacji",
                    field: "startDate",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "stopDate",
                    label: "Koniec rezerwacji",
                    field: "stopDate",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "description",
                    label: "Uwagi",
                    field: "description",
                    align: "left",
                    sortable: true,
                }
            ]
        }
    },

    methods: {
        setNumericFormat,

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
                            message: "Błąd pobierania listy użytkowników",
                            icon: "report_problem",
                        });
                    };
                });
        },

        addUser: function () {
            const url = this.$API_URL + "users";

            return axios
                .post(url, {
                    username: this.newUsername,
                    firstName: this.newFirstName,
                    lastName: this.newLastName,
                    password: this.newPassword,
                    role: this.newRole,

                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nowego użytkownika",
                        icon: "check_circle_outline",
                    });
                    this.getUsers();
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
                            message: "Błąd dodawania nowego użytkownika",
                            icon: "report_problem",
                        });
                    };
                });
        },

        editUser: function (props) {
            this.editedUser = Object.assign({}, props.row);
            this.showEditUserDialog = true;
        },

        updateUser: function (editedUser) {
            const url = this.$API_URL + "users";

            axios
                .put(url, {
                    id: this.editedUser.id,
                    username: this.editedUser.username,
                    firstName: this.editedUser.firstName,
                    lastName: this.editedUser.lastName,
                    password: this.editedUser.password,
                    role: this.editedUser.role,
                    active: this.editedUser.active,
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano dane użytkownika",
                        icon: "check_circle_outline",
                    });
                    this.getUsers();
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
                            message: "Błąd aktualizacji danych użytkownika",
                            icon: "report_problem",
                        });
                    };
                });
        },

        showDetailUser: function (props) {
            this.detailUser = Object.assign({}, props);
            this.getReservationsByUserId();
            this.showDetailUserDialog = true;
        },

        getReservationsByUserId: function () {
            const url =
                this.$API_URL + "reservations/users/" + this.detailUser.id;

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.reservations = response.data;
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
                            message: "Błąd pobierania informacji o rezerwacjach użytkownika",
                            icon: "report_problem",
                        });
                    };
                });
        },

        resetPassword: function (props) {
            this.editedUser = Object.assign({}, props.row);
            this.showResetUserPasswordDialog = true;
        },

        updateUserPassword: function (editedUser) {
            const url = this.$API_URL + "users/password/" + editedUser.id;

            axios
                .patch(url, {
                    newPassword: this.newUserPassword
                    // oldPassword: this.oldUserPassword
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json",
                    dataType: "json",
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Hasło zostało zmienione",
                        icon: "check_circle_outline",
                    });
                    this.getUsers();
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
                            message: "Błąd resetowania hasła użytkownika",
                            icon: "report_problem",
                        });
                    };
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
                            message: "Błąd usuwania użytkownika!",
                            icon: "report_problem",
                        });
                    };
                });
        },

        onRowClick: function (props) {
            this.activeRowIndex = props.rowIndex;
        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }

    }
}
</script>

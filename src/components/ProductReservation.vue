<template>
<div>
    <q-table dense flat :data="reservations" :columns="columns" row-key="name" hide-no-data color="primary" v-bind:request="getReservationsByInventoryId">
        <q-tr class="my-font" slot="body" slot-scope="props" :props="props">
            <q-tooltip v-if="props.row.description.length>0">
                {{ props.row.description }}
            </q-tooltip>

            <q-td key="user" :props="props">
                {{ props.row.user.username }}
                <q-icon v-if="props.row.description.length>0" class="text-weight-bolder" color="primary" size="16px" name="notes" />
            </q-td>
            <q-td key="stopDate" :props="props">
                {{ props.row.stopDate }}
            </q-td>
            <q-td key="quantity" :props="props">
                {{ props.row.quantity }}
            </q-td>
            <q-td key="action" :props="props">
                <q-btn flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editReservation(props)">
                    <q-tooltip content-class="bg-blue-8">Edytuj rezerwację</q-tooltip>
                </q-btn>
                <q-dialog v-model="showEditReservationDialog" persistent>
                    <q-card style="min-width: 15vw">
                        <q-card-section>
                            <div class="text-primary">Edycja rezerwacji:</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                            <q-select dense v-model="user" :options="filteredUsers" label="Użytkownik" @filter="filterUsers" :display-value="user.username" autofocus>
                                <template #option="{ opt, toggleOption }">
                                    <q-item dense clickable @click="toggleOption(opt)">
                                        <q-item-section>
                                            <q-item-label>
                                                {{ `${opt.username}` }}
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-separator class="q-virtual-scroll--with-prev"></q-separator>
                                </template>
                            </q-select>
                            <q-input dense v-model.trim="editedReservation.quantity" label="Ilość" type="number" :decimals="2" :rules="[(val) => val >= 0 && val.length > 0]" />
                            <q-input dense v-model="editedReservation.stopDate" label="Data zakończenia rezerwacji">
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                            <q-date v-model="editedReservation.stopDate" mask="YYYY-MM-DD" minimal>
                                                <div class="row items-center justify-end">
                                                    <q-btn v-close-popup label="Zamknij" color="primary" flat />
                                                </div>
                                            </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                            </q-input>
                            <q-input dense v-model="editedReservation.description" label="Uwagi" type="textarea" autogrow />
                        </q-card-section>

                        <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="Anuluj" v-close-popup />
                            <q-btn flat label="Zapisz" v-on:click="updateReservation(editedReservation)" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <q-btn flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                    <q-tooltip content-class="bg-red">Usuń rezerwację</q-tooltip>
                </q-btn>
            </q-td>
        </q-tr>
    </q-table>

    <q-btn flat :disabled="disabledNewReservation" label="Nowa Rezerwacja" color="primary" v-on:click="showAddReservationDialog = true" />
    <q-dialog v-model="showAddReservationDialog" persistent>
        <q-card style="min-width: 15vw">
            <q-card-section>
                <div class="text-primary">Dodawanie rezerwacji dla: <strong>{{ productName }}</strong></div>
            </q-card-section>
            <q-card-section class="q-pt-none">
                <q-select dense v-model="user" :options="filteredUsers" label="Użytkownik" @filter="filterUsers" :display-value="user.username" autofocus>
                    <template #option="{ opt, toggleOption }">
                        <q-item dense clickable @click="toggleOption(opt)">
                            <q-item-section>
                                <q-item-label>
                                    {{ `${opt.username}` }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator class="q-virtual-scroll--with-prev"></q-separator>
                    </template>
                </q-select>
                <q-input dense v-model.trim="newReservationQuantity" label="Ilość" type="number" mask="#.###" :decimals="3" :rules="[(val) => val >= 0]" />
                <div v-if="calculate">
                    <q-input dense v-model.trim="newReservationArea" label="Powierzchnia" type="number" mask="#.###" :decimals="3" :rules="[(val) => val >= 0]" />
                </div>
                <q-input dense v-model="newReservationStopDate" label="Data zakończenia rezerwacji">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="newReservationStopDate" mask="YYYY-MM-DD" minimal>
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Zamknij" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input dense v-model="newReservationDescription" label="Opis" type="textarea" autogrow />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Anuluj" v-close-popup />
                <q-btn flat label="Zapisz" v-on:click="addReservation" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</div>
</template>

<script>
import axios from "axios";

export default {
    name: "ProductReservation",

    mounted: function () {
        EventBus.$on("click", (product) => {
            this.inventory = product.inventory;
            this.calculate = product.inventory.product.productType.calculate;
            this.productName = product.inventory.product.name;
            this.disabledNewReservation = false;
        });
        this.getUsers();
    },

    destroyed: function () {
        EventBus.$off("click");
    },

    watch: {
        newReservationQuantity: function () {
            this.newReservationArea = this.newReservationQuantity * (this.inventory.productWidth * this.inventory.productLength);
        },

        newReservationArea: function () {
            this.newReservationQuantity = this.newReservationArea / (this.inventory.productWidth * this.inventory.productLength);
        },
    },
    // computed: {
    //     calculateQuantityFromArea: function () {
    //       console.log(this.newReservationQuantity)
    //         this.newReservationQuantity / (this.inventory.productWidth * this.inventory.productLenght);
    //         return this.newReservationArea;
    //     }
    // },

    data() {
        return {
            showAddReservationDialog: false,
            showEditReservationDialog: false,
            disabledNewReservation: true,

            user: "",
            users: [],
            filteredUsers: [],
            inventory: "",
            productName: "",
            calculate: true,

            editedReservation: [],
            reservations: [],

            newReservationQuantity: 1.0,
            newReservationStopDate: new Date().toJSON().slice(0, 10),
            newReservationDescription: "",
            newReservationArea: 0.0,

            columns: [{
                    name: "user",
                    label: "Osoba",
                    field: (row) => row.user.username,
                    align: "left",
                    sortable: true,
                },
                {
                    name: "stopDate",
                    label: "Data",
                    field: "stopDate",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: "quantity",
                    align: "right",
                    color: "primary",
                    sortable: true,
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                }
            ]
        };
    },

    methods: {
        getReservationsByInventoryId: function () {
            const url = this.$API_URL + "reservations/inventories/" + this.inventory.id;

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { Authorization: localStorage.getItem("token") },
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
                            message: "Błąd pobierania informacji o rezerwacjach",
                            icon: "report_problem",
                        });
                    };
                });
        },

        addReservation: function () {
            const url = this.$API_URL + "reservations";

            return axios
                .post(url, {
                    quantity: this.newReservationQuantity,
                    startDate: new Date().toJSON().slice(0, 10),
                    stopDate: this.newReservationStopDate,
                    description: this.newReservationDescription,
                    inventory: {
                        id: this.inventory.id,
                    },
                    user: {
                        id: this.user.id,
                    },
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nową rezerwację",
                        icon: "check_circle_outline",
                    });
                    this.getReservationsByInventoryId();
                    this.$root.$emit("refreshProducts");
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
                            message: "Błąd dodawania nowej rezerwacji",
                            icon: "report_problem",
                        });
                    };
                });
        },

        editReservation: function (props) {
            this.editedReservation = Object.assign({}, props.row);
            this.user = this.editedReservation.user;
            this.showEditReservationDialog = true;
        },

        updateReservation: function (editedReservation) {
            const url = this.$API_URL + "reservations";

            axios
                .put(url, {
                    id: this.editedReservation.id,
                    quantity: this.editedReservation.quantity,
                    startDate: new Date().toJSON().slice(0, 10),
                    stopDate: this.editedReservation.stopDate,
                    description: this.editedReservation.description,
                    inventory: {
                        id: this.inventory.id,
                    },
                    user: {
                        id: this.user.id,
                    },
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano rezerwację",
                        icon: "check_circle_outline",
                    });
                    this.getReservationsByInventoryId();
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
                            message: "Błąd aktualizacji rezerwacji",
                            icon: "report_problem",
                        });
                    };
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie rezerwacji</span>",
                    message: "<span class=text-negative>Czy usunąć rezerwację użytkownika: <strong>" + props.row.user.username +
                        "</strong> <br/> dla ilości: <strong>" +
                        props.row.quantity +
                        "</strong>, ważną do dnia: <strong>" +
                        props.row.stopDate + "</strong>?</span>",
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
                    this.getReservationsByInventoryId();
                    this.$root.$emit("refreshProducts");
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

        filterUsers(val, update, abort) {
            update(() => {
                if (!val) return (this.filteredUsers = [...this.users]);

                const needle = val.toLowerCase();
                this.filteredUsers = this.users.filter((v) => `${v.username}`.indexOf(needle) > -1);
            });
        },

        clearReservationTable: function () {
            this.reservations = [];
            this.disabledNewReservation = true;
        }
    },
};
</script>

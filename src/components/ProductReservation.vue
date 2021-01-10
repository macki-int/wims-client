<template>
<div>
    <q-table flat :data="reservations" :columns="columns" row-key="name" v-bind:request="getReservationsByInventoryId" dense>
        <q-tr slot="body" slot-scope="props" :props="props">
            <q-td key="user" :props="props">
                {{ props.row.user.nick }}
            </q-td>
            <q-td key="stopDate" :props="props">
                {{ props.row.stopDate }}
            </q-td>
            <q-td key="quantity" :props="props">
                {{ props.row.quantity }}
            </q-td>
            <q-td key="action" :props="props">
                <q-btn size="xs" unelevated dense color="primary" icon="create" class="q-mr-xs" v-on:click="editReservation(props)" />
                <q-dialog v-model="showEditReservationDialog">
                    <q-card style="min-width: 350px">
                        <q-card-section>
                            <div class="text-primary">Edycja rezerwacji:</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">

                            <!-- field: (row) => row.user.nick -->
                            <q-select dense v-model="user" :options="filteredUsers" label="Użytkownik" @filter="filterUsers" :display-value="user.nick" autofocus>
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
                <q-btn size="xs" unelevated dense color="negative" icon="clear" v-on:click="confirmDelete(props)" />
                <!-- <q-dialog v-model="dialogDelete" persistent>
                    <q-card>
                        <q-card-section class="row items-center bg-negative">
                            <q-avatar icon="report_problem" text-color="white" />
                            <span class="q-ml-sm text-white">
                                Czy usunąć rezerwację o id: {{ dialogDelete.row }}:
                            </span>
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="Anuluj" color="negative" v-close-popup />
                            <q-btn flat label="Usuń" color="negative" v-on:click="deleteReservation" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog> -->
            </q-td>
        </q-tr>
    </q-table>

    <q-btn flat :disabled="disabled" label="Nowa Rezerwacja" color="primary" v-on:click="showAddReservationDialog = true" />
    <q-dialog v-model="showAddReservationDialog" persistent>
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-primary">Dodawanie rezerwacji:</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
                <q-select dense v-model="user" :options="filteredUsers" label="Użytkownik" @filter="filterUsers" :display-value="user.nick" autofocus>
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
                <q-input dense v-model.trim="newReservationQuantity" label="Ilość" type="number" :decimals="2" :rules="[(val) => val >= 0 && val.length > 0]" />
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
                <q-input dense v-model="newReservationDescription" label="Uwagi" type="textarea" autogrow />
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
            this.inventory = product;
            this.disabled = false;
        });
        this.getUsers();
    },

    data() {
        return {
            showAddReservationDialog: false,
            showEditReservationDialog: false,
            disabled: true,

            user: "",
            users: [],
            filteredUsers: [],
            inventory: "",

            editedReservation: "",
            reservations: [],

            newReservationQuantity: 1.0,
            newReservationStopDate: new Date().toJSON().slice(0, 10),
            newReservationDescription: "",


            columns: [{
                    name: "user",
                    label: "Osoba",
                    field: (row) => row.user.nick,
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
            ],
        };
    },

    methods: {
        getReservationsByInventoryId: function () {
            const url =
                "https://wims-mj.herokuapp.com/reservations/inventories/" + this.inventory.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
                })
                .then((response) => {
                    this.reservations = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania informacji o rezerwacjach",
                        icon: "report_problem",
                    });
                });
        },

        addReservation: function () {
            const url = "https://wims-mj.herokuapp.com/reservations";
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
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nową rezerwację",
                        icon: "check_circle",
                    });
                    this.getReservationsByInventoryId();
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd dodawania nowej rezerwacji",
                        icon: "report_problem",
                    });
                });
        },

        editReservation: function (props) {
            this.editedReservation = Object.assign({}, props.row);
            this.showEditReservationDialog = true;
        },

        updateReservation: function (editedReservation) {
            const url = "https://wims-mj.herokuapp.com/reservations";
            
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
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano rezerwację",
                        icon: "check_circle",
                    });
                    this.getReservationsByInventoryId();
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd aktualizacji rezerwacji",
                        icon: "report_problem",
                    });
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie rezerwacji</span>",
                    message: "<span class=text-negative>Czy usunąć rezerwację użytkownika: <strong>" + props.row.user.nick +
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
            const url = "https://wims-mj.herokuapp.com/reservations/" + id;

            axios
                .delete(url)
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Usunięto rezerwację",
                        icon: "check_circle",
                    });
                    this.getReservationsByInventoryId();
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd usuwania rezerwacji!",
                        icon: "report_problem",
                    });
                });
        },
        

        getUsers: function () {
            const url = "https://wims-mj.herokuapp.com/users";

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
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

        filterUsers(val, update, abort) {
            update(() => {
                if (!val) return (this.filteredUsers = [...this.users]);

                const needle = val.toLowerCase();
                this.filteredUsers = this.users.filter((v) => `${v.nick}`.indexOf(needle) > -1);
            });
        },

    },
};
</script>

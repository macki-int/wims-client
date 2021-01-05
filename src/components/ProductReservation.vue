<template>
<div>
    <q-table flat :data="reservations" :columns="columns" row-key="name" v-bind:request="getReservationsByInventoryId" v-on:click="onRowClick(reservations)">
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
            <q-td>
                <q-btn size="xs" dense color="primary" icon="create" class="q-mr-xs" />
                <q-btn size="xs" dense color="negative" icon="clear" class="q-mr-xs" v-on:click="confirmDelete = true" />
                <q-dialog v-model="confirmDelete" persistent>
                    <q-card>
                        <q-card-section class="row items-center bg-negative">
                            <q-avatar icon="report_problem" text-color="white" />
                            <span class="q-ml-sm text-white">
                                Czy usunąć rezerwację o id: {{ props.row.id }}:
                                <br />
                                <strong>{{ props.row.user.nick }}</strong> (ilość:
                                {{ props.row.quantity }})?
                            </span>
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="Anuluj" color="negative" v-close-popup />
                            <q-btn flat label="Usuń" color="negative" v-on:click="deleteReservation" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>
            </q-td>
        </q-tr>
    </q-table>

    <q-btn flat label="Nowa Rezerwacja" color="primary" v-on:click="save = true" />
    <q-dialog v-model="save" persistent>
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-primary">Dodawanie rezerwacji:</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
                <q-select dense v-model="user" :options="filteredUsers" label="użytkownik" @filter="filterUsers" :display-value="user.nick" autofocus>
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
                <q-input dense v-model.trim="newReservationQuantity" label="ilość" type="number" :decimals="2" :rules="[(val) => val && val.length > 0]" />
                <q-input dense v-model="newReservationStopDate" label="data zakończenia rezerwacji" mask="date" :rules="['date']">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date v-model="newReservationStopDate" minimal>
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
        });
        this.getUsers();
    },

    data() {
        return {
            save: false,
            confirmDelete: false,

            user: [],
            users: [],
            filteredUsers: [],
            inventory: "",

            newReservationQuantity: "1.00",
            newReservationStopDate: new Date().toJSON().slice(0, 10),
            newReservationDescription: "",

            reservations: [],
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
                    headerStyle: "max-width: 100px",
                    style: "max-width: 100px",
                    sortable: true,
                },
                {
                    align: "right",
                },
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
            console.log(this.inventory);
            console.log(this.newReservationQuantity);
            console.log(new Date().toJSON().slice(0, 10));
            console.log(this.newReservationStopDate);
            console.log(this.user);

            return axios
                .post(url, {
                    description: this.newReservationDescription,
                    inventory: this.inventory,
                    quantity: this.newReservationQuantity,
                    startDate: new Date().toJSON().slice(0, 10),
                    stopDate: this.newReservationStopDate,
                    user: this.user,
                })

                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nową rezerwację",
                        icon: "check_circle",
                    });
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

        updateReservation: function () {
            const url = "https://wims-mj.herokuapp.com/reservations";

            axios
                .put(url, {
                    id: this.reservation.id,
                    nick: this.reservation.nick,
                })
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd aktualizacji stanu rezerwacji",
                        icon: "report_problem",
                    });
                });
            location.reload();
        },

        deleteReservation: function () {
            const url = "https://wims-mj.herokuapp.com/reservations/" + this.id;

            axios
                .delete(url)
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd usuwania rezerwacji!",
                        icon: "report_problem",
                    });
                });
            location.reload();
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

        onClick: function (row) {
            console.log(row.user.nick);
        },

        onRowClick: function (reservation) {
            console.log(reservation);
        }
    }
}
</script>

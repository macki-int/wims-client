<template>
<div>
    <q-table flat :data='reservations' :columns='columns' row-key='name' @request='getReservations'>
        <q-td>
            <q-btn color='blue' icon='edit' v-on:click='getReservations' />
        </q-td>
    </q-table>
    <q-btn flat label='Nowa Rezerwacja' color='primary' v-on:click='getReservations' />
</div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ProductReservation',

    data() {
        return {
            reservations: [],
            columns: [{
                    name: 'id',
                    label: 'Id',
                    field: 'id',
                    align: 'left',
                    headerStyle: 'max-width: 10px',
                    style: 'max-width: 10px'
                },
                {
                    name: 'user',
                    label: 'Nick',
                    field: row => row.user.nick,
                    align: 'left',
                    sortable: true
                },
                {
                    name: 'stopDate',
                    label: 'Data',
                    field: 'stopDate',
                    align: 'left',
                    sortable: true
                },
                {
                    name: 'quantity',
                    label: 'Ilość',
                    field: 'quantity',
                    align: 'right',
                    headerStyle: 'max-width: 100px',
                    style: 'max-width: 100px',
                    sortable: true
                },
                {
                    name: 'edit',
                    label: 'Edytuj',
                    align: 'right',
                    icon: 'done'
                }
            ]
        };
    },

    methods: {
        getReservations: function (id) {
            const url = 'https://wims-mj.herokuapp.com/reservations/inventories/' + id;

            axios
                .get(url, {
                    dataType: 'json',
                    headers: {}
                })
                .then(response => {
                    this.reservations = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'Błąd pobierania informacji o rezerwacjach',
                        icon: 'report_problem'
                    });
                });
        },

        updateReservation: function () {
            const url = 'https://wims-mj.herokuapp.com/reservations';

            axios
                .put(url, {
                    id: this.reservation.id,
                    nick: this.reservation.nick,
                })
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'Błąd aktualizacji stanu rezerwacji',
                        icon: 'report_problem',
                    });
                });
            location.reload();
        },

        deleteReservation: function () {
            const url = 'https://wims-mj.herokuapp.com/reservations';

            axios
                .delete(url + '/' + this.id)
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'Błąd usuwania rezerwacji!',
                        icon: 'report_problem',
                    });
                });
            location.reload();
        },
    },

};
</script>

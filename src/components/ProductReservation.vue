<template>
<div>
    <q-table flat :data='reservations' :columns='columns' row-key='name' @request='getReservations'>
        <q-td>
            <q-btn size='8px' color='blue' icon='edit' v-on:click='getReservations' />
        </q-td>
    </q-table>
        <q-btn flat label='Nowa Rezerwacja' color='primary' v-on:click='getReservations'/>
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
                    align: 'left'
                },
                {
                    name: 'nick',
                    label: 'Nick',
                    field: 'user.nick',
                    align: 'left',
                    sortable: true
                },
                {
                    name: 'quantity',
                    label: 'Ilość',
                    field: 'quantity',
                    align: 'left',
                    sortable: true
                }
            ]
        };
    },

    methods: {
        getReservations: function () {
            const url = 'https://wims-mj.herokuapp.com/reservations';
            axios
                .get(url, {
                    dataType: 'json',
                    headers: {}
                })
                .then(response => {
                    this.reservations = response.data;
                    console.log(this.reservations);
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

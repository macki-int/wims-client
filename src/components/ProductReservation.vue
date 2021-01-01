<template>
<div class="q-pa-md">
    <q-table
      title="Reserwacja"
      :data="data"
      :columns="columns"
      row-key="name"
    />
  </div>

</template>

<script>
import axios from 'axios';

export default {
    name: 'ProductReservation',
    props: {
        id: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    },

    data() {
        return {
          columns: [

          ]
        };
    },

    methods: {
        editReservation: function () {
            const url = 'https://wims-mj.herokuapp.com/reservations';

            axios
                .put(url, {
                    id: this.id,
                    name: this.newNameProductType,
                })
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'The new name of product type saving failed',
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
                        message: 'The product type deleting failed!',
                        icon: 'report_problem',
                    });
                });
                location.reload();
        },
    },

};
</script>

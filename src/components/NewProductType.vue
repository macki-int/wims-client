<template>
  <div class="q-pa-md q-gutter-sm">
    <q-btn label="Nowa kategoria" color="primary" v-on:click="save = true" />

    <q-dialog v-model="save" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-primary">Nazwa kategorii</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model.trim="newProductType"
            v-on:keyup.enter="save = false"
            :rules="[(val) => (val && val.length > 0) || 'Podaj nazwę kategorii']"
            lazy-rules
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Anuluj" v-close-popup />
          <q-btn flat label="Zapisz" v-on:click="addProductType" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      save: false,
      newProductType: "",
    };
  },

  methods: {
    addProductType: function () {
      const url = "https://wims-mj.herokuapp.com/product-types";

      axios
        .post(url, {
          name: this.newProductType,
        })
        .then((response) => {})
        .catch(() => {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Błąd dodawania nowej kategorii",
            icon: "report_problem",
          });
        });
      // if (event) {
      //   alert(event.target.tagName)
      // }
      this.$router.push({
        path: "/",
      });
      location.reload();
    },
  },
};
</script>

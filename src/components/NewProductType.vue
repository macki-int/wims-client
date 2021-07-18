<template>
<div class="q-pa-md q-gutter-sm">
    <q-btn flat label="Nowa kategoria" color="primary" v-on:click="save = true" />
    <q-dialog v-model="save" persistent>
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-primary">Nazwa kategorii</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-input dense v-model.trim="newProductType" v-on:keyup.enter="save = false" :rules="[(val) => (val && val.length > 0) || 'Podaj nazwę kategorii']" lazy-rules autofocus />
                <q-checkbox class="q-pt-md" dense v-model="newCalculate" size="sm" label="Oblicz powierzchnię" />
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
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "NewProductType",

    mounted() {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
    },

    data() {
        return {
            save: false,
            newProductType: "",
            newCalculate: true,
            loggedUser: ""
        };
    },

    methods: {
        addProductType: function () {
            const url = this.$API_URL + "product-types";

            axios
                .post(url, {
                    name: this.newProductType,
                    calculate: this.newCalculate
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Dodano nową kategorię",
                        icon: "check_circle_outline",
                    });
                    this.$root.$emit("refreshProductTypes");
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
                            message: "Błąd dodawania nowej kategorii",
                            icon: "report_problem",
                        });
                    };
                });
        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    },
};
</script>

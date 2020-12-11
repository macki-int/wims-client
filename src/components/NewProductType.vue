<template>
<div class="q-pa-md q-gutter-sm">
    <q-btn label="Dodaj kategorię" color="primary" v-on:click="save = true" />

    <q-dialog v-model="save" persistent>
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-primary">Nazwa kategorii</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-input dense v-model.trim="newProductType" autofocus v-on:keyup.enter="save = false" v-close-popup />
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
// import {
//     required,
//     minLength
// } from "vuelidate/lib/validators";

export default {
    data() {
        return {
            save: false,
            newProductType: ""
        };
    },

    methods: {
        // validations: {
        //     newProductType: {
        //         required,
        //         minLength: minLength(3)
        //     }
        // },

        addProductType: function () {
            const url = "http://192.168.5.122:8080/product-types";

            axios
                .post(url, {
                    name: this.newProductType
                })
                .then(response => {})
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product type saving failed",
                        icon: "report_problem"
                    });
                });
            // if (event) {
            //   alert(event.target.tagName)
            // }
            this.$router.push({
                path: "/",
            });
            this.$root.$emit('updateProductType')
        }
    }
};
</script>

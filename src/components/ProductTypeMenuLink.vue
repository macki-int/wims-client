<template>

<q-item clickable>
    <q-item-section v-if="icon" avatar v-on:click="getProductsByProductType(name)">
        <q-icon color="blue-3" size="14px" :name="icon" />
    </q-item-section>

    <q-item-section v-on:click="getProductsByProductType(id)">
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label hidden caption>{{ id }}</q-item-label>
    </q-item-section>

    <!-- <q-item-section>
        <div class="row">
            <div class="col">
                <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" size="sm" unelevated dense color="white" text-color="primary" icon="create" class="q-mr-xs float-right" v-on:click="save = true">
                    <q-tooltip content-class="bg-blue-9">Edytuj nazwę kategorii</q-tooltip>
                </q-btn>
                <q-dialog v-model="save" persistent>
                    <q-card style="min-width: 350px">
                        <q-card-section>
                            <div class="text-primary">Edycja nazwy kategorii:</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                            <q-input v-model.trim="newNameProductType" @focus="$event.target.select()" autofocus dense v-on:keyup.enter="save = false" />
                        </q-card-section>

                        <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="Anuluj" v-close-popup />
                            <q-btn flat label="Zapisz" v-on:click="updateProductType" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>
            </div>

            <div class="col">
                <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" size="sm" unelevated dense color="white" text-color="negative" icon="clear" class="q-mr-xs float-center" v-on:click="confirmDelete = true">
                    <q-tooltip content-class="bg-red">Usuń kategorię</q-tooltip>
                </q-btn>
                <q-dialog v-model="confirmDelete" persistent>
                    <q-card>
                        <q-card-section class="row items-center">
                            <q-avatar icon="report_problem" size="7em" text-color="negative" />
                            <span class="q-ml-sm text-negative">
                                Czy usunąć kategorię:
                                <br />
                                <strong>{{ this.name }}</strong>?
                            </span>
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn flat label="Anuluj" color="negative" v-close-popup />
                            <q-btn flat label="Usuń" color="negative" v-on:click="deleteProductType" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>
            </div>
        </div>
    </q-item-section> -->
</q-item>
</template>

<script>
import axios from "axios";

export default {
    name: "ProductTypeMenuLink",

    props: {
        id: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "forward",
        },
    },

    mounted() {
        this.getLoggedUserFromLocalStore();
    },

    data() {
        return {
            confirmDelete: false,
            save: false,
            newNameProductType: this.name,
            loggedUser:""
        };
    },

    methods: {
        // updateProductType: function () {
        //     const url = this.$API_URL + "product-types";

        //     axios
        //         .put(url, {
        //             id: this.id,
        //             name: this.newNameProductType,
        //         }, {
        //             headers: { "Authorization": localStorage.getItem("token") }
        //         })
        //         .then((response) => {
        //             this.$q.notify({
        //                 color: "positive",
        //                 position: "top",
        //                 message: "Zaktualizowano kategorie",
        //                 icon: "check_circle_outline",
        //             });
        //         })
        //         .catch((error) => {
        //             if (error.response.status === 403) {
        //                 this.$q.notify({
        //                     color: "negative",
        //                     position: "top",
        //                     message: "Nie jesteś zalogowany",
        //                     icon: "report_problem",
        //                 });
        //                 this.$router.push("/login")
        //             } else {
        //                 this.$q.notify({
        //                     color: "negative",
        //                     position: "top",
        //                     message: "Błąd aktualizacji nazwy kategorii",
        //                     icon: "report_problem",
        //                 });
        //             };
        //         });
        //     location.reload();
        // },

        // deleteProductType: function () {
        //     const url = this.$API_URL + "product-types/" + this.id;

        //     axios
        //         .delete(url, {
        //             headers: { "Authorization": localStorage.getItem("token") }
        //         })
        //         .then((response) => {
        //             this.$q.notify({
        //                 color: "positive",
        //                 position: "top",
        //                 message: "Usunięto kategorię",
        //                 icon: "check_circle_outline",
        //             });
        //         })
        //         .catch((error) => {
        //             if (error.response.status === 403) {
        //                 this.$q.notify({
        //                     color: "negative",
        //                     position: "top",
        //                     message: "Nie jesteś zalogowany",
        //                     icon: "report_problem",
        //                 });
        //                 this.$router.push("/login")
        //             }  else {
        //                 this.$q.notify({
        //                     color: "negative",
        //                     position: "top",
        //                     message: "Błąd usuwania kategorii",
        //                     icon: "report_problem",
        //                 });
        //             };
        //         });
        //     location.reload();
        // },

        getProductsByProductType: function (id) {
            this.$router.push({
                path: "/" + this.id,
            });
        },

         getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    },
};
</script>

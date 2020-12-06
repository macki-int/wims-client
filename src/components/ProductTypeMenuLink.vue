<template>
<q-item clickable>
    <q-item-section class="q-mr" v-if="icon" avatar v-on:click="getProductsByProductType(name)">
        <q-icon color="blue-3" size="14px" :name="icon" />
    </q-item-section>

    <q-item-section v-on:click="getProductsByProductType(id)">
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label hidden caption>{{ id }}</q-item-label>
    </q-item-section>
    <!--q-item-section>
      <div class="q-pa-xs q-gutter-none">
        <q-btn no-caps size="8px" color="blue-7" icon="edit" v-on:click="editProductType" />
      </div>
    </q-item-section-->

    <q-item-section>
        <q-btn-group spread>
            <q-btn size="8px" color="blue" icon="edit" v-on:click="save = true" />
            <q-dialog v-model="save" persistent>
                <q-card style="min-width: 350px">
                    <q-card-section>
                        <div class="text-primary">Edycja nazwy kategorii</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                        <q-input v-model.trim="newNameProductType" @focus="$event.target.select()" autofocus dense v-on:keyup.enter="save = false" />
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Anuluj" v-close-popup />
                        <q-btn flat label="Zapisz" v-on:click="editProductType" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <q-btn size="8px" color="red" icon="disabled_by_default" v-on:click="confirmDelete = true" />
            <q-dialog v-model="confirmDelete" persistent>
                <q-card>

                    <q-card-section class="row items-center bg-negative">
                        <q-avatar icon="report_problem" text-color="white" />
                        <span class="q-ml-sm text-white">
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
        </q-btn-group>
    </q-item-section>

</q-item>

</template>

<script>
// import {
//     required,
//     minLength
// } from "vuelidate/lib/validators";
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
    data() {
        return {
            confirmDelete: false,
            save: false,
            newNameProductType: this.name
        };
    },

    methods: {
        // validations: {
        //     newNameProductType: {
        //         required,
        //         minLength: minLength(3)
        //     },
        // },

        editProductType: function () {
            // alert(
            //   "Click Edit Product Type: " +
            //     this.newNameProductType +
            //     " id: " +
            //     this.id
            // );
            const url = "http://localhost:8080/product-types";

            axios
                .put(url, {
                    id: this.id,
                    name: this.newNameProductType,
                })
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "The new name of product type saving failed",
                        icon: "report_problem",
                    });
                });
            // EventBus.$emit("productTypesUpdated");
        },

        deleteProductType: function () {
            const url = "http://localhost:8080/product-types";

            axios
                .delete(url + "/" + this.id)
                .then((response) => {})
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "The product type deleting failed!",
                        icon: "report_problem",
                    });
                });
            location.reload();
            //EventBus.$emit("productTypesUpdated");
        },

        getProductsByProductType: function (id) {

            // alert("Clicked Product Type: " + id);
            this.$router.push({
                path: "/" + this.id,
            });

        },
    },
};
</script>

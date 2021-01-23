<template>
<q-dialog v-model="showDetailProductDialog">
    <q-card style="min-width: 350px">
        <q-card-section>
            <div class="text-primary">Szczegóły produktu: {{product.name}} </div>
        </q-card-section>
        <q-card-section>
            <template>
                <q-table dense flat :data="inventories" :columns="columnsDetails" row-key="name" v-bind:request="getInventoriesByProductId">
                    <q-tr slot="body" slot-scope="props" :props="props">
                        <q-td key="productWidth" :props="props">
                            {{ props.row.productWidth }}
                        </q-td>
                        <q-td key="productLength" :props="props">
                            {{ props.row.productLength }}
                        </q-td>
                        <q-td key="quantity" :props="props">
                            {{ props.row.quantity }}
                        </q-td>
                        <q-td key="area" :props="props">
                            {{ props.row.productWidth * props.row.productLength * props.row.quantity }}
                        </q-td>
                        <q-td key="updateDate" :props="props">
                            {{ props.row.updateDate }}
                        </q-td>
                    </q-tr>
                </q-table>
            </template>
            < <!-- <q-input dense v-model="detailedProduct.name" label="Nazwa produktu" />
            <q-input dense v-model="detailedProduct.productType.name" label="Typ produktu" /> -->
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
            <q-btn flat label="OK" v-close-popup />
        </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script>
import axios from "axios";

const API_URL = "http://localhost:8080/";

export default {
    name: "ProductDetail",

    mounted: function () {
        EventBus.$on("click", (detailedProduct) => {
            console.log(detailedProduct);
            this.product = detailedProduct;
            this.getInventoriesByProductId();

            showDetailProductDialog = true;
        });
        console.log(this.product);
    },

    destroyed() {
        EventBus.$off('click');
    },

    data() {
        return {
            product: "",
            inventories: [],

            showDetailProductDialog: false,

            columnsDetails: [{
                    name: "productWidth",
                    label: "Szerokość",
                    field: "productWidth",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "productLength",
                    label: "Długość",
                    field: "productLength",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: "quantity",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "area",
                    label: "Powierzchnia",
                    field: "",
                    align: "right",
                    sortable: true,
                },
                {
                    name: "updateDate",
                    label: "Data aktualizacji",
                    field: "updateDate",
                    align: "right",
                    sortable: true,
                }
            ]
        };
    },

    methods: {
        getInventoriesByProductId: function () {
            const url = API_URL + "inventories/products/" + this.product.id;

            axios
                .get(url, {
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.inventories = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd pobierania informacji o stanach magazynowych",
                        icon: "report_problem",
                    });
                });
        },

    }
};
</script>

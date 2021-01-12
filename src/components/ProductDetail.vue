<template>
<q-table dense flat :data="inventories" :columns="columns" row-key="name" v-bind:request="getInventoriesByProductId">
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

<script>
import axios from "axios";

export default {
    name: "ProductDetail",

    mounted: function () {
        EventBus.$on("click", (detailedProduct)=>{
            
            this.product = detailedProduct;
        });
            console.log(this.product);
            // this.getInventoriesByProductId();

    },

    destroyed() {
        EventBus.$off('click')
    },

    data() {
        return {
            product: "",
            inventories: [],

            columns: [{
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
            const url =
                "https://wims-mj.herokuapp.com/inventories/products/" + 1;

            axios
                .get(url, {
                    dataType: "json",
                    headers: {},
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

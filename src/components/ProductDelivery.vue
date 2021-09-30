<template>
<div>
    <q-table dense flat :data="deliveries" :columns="columns" row-key="name" hide-no-data color="primary" v-bind:request="getDeliveriesByInventoryId">
        <q-tr class="my-font" slot="body" slot-scope="props" :props="props">
        </q-tr>
    </q-table>

</div>
</template>

<script>
import axios from "axios";

export default {
    name: "ProductDelivery",

    mounted: function () {
        EventBus.$on("click", (product) => {
            this.inventory = product.inventory;
            this.calculate = product.inventory.product.productType.calculate;
            this.productName = product.inventory.product.name;
            this.disabledNewDelivery = false;
        });
    },

    destroyed: function () {
        EventBus.$off("click");
    },

    watch: {
        newDeliveryQuantity: function () {
            this.newDeliveryArea = this.newDeliveryQuantity * (this.inventory.productWidth * this.inventory.productLength);
        },

        newDeliveryArea: function () {
            this.newDeliveryQuantity = this.newDeliveryArea / (this.inventory.productWidth * this.inventory.productLength);
        },
    },

    data: function () {
        return {
            showAddDeliveryDialog: false,
            showEditDeliveryDialog: false,
            disabledNewDelivery: true,

            inventory: "",
            productName: "",
            calculate: true,

            editedDelivery: [],
            Deliveries: [],

            newDeliveryQuantity: 1.0,
            newDeliveryDate: new Date().toJSON().slice(0, 10),
            newDeliveryDescription: "",
            newDeliveryArea: 0.0,

            columns: [{
                    name: "deliveryDate",
                    label: "Data",
                    field: "deliveryDate",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: "quantity",
                    align: "right",
                    color: "primary",
                    sortable: true,
                },
                {
                    name: "action",
                    align: "right",
                    field: "",
                }
            ]
        }
    },

    methods: {
        getDeliveriesByInventoryId: function () {
            const url = this.$API_URL + "deliveries/inventories/" + this.inventory.id;
            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { Authorization: localStorage.getItem("token") },
                })
                .then((response) => {
                    this.deliveries = response.data;
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
                            message: "Błąd pobierania informacji o dostawach",
                            icon: "report_problem",
                        });
                    };
                });
        },

        clearDeliveryTable: function () {
            this.deliveries = [];
            this.disabledNewDelivery = true;
        }
    }

}
</script>

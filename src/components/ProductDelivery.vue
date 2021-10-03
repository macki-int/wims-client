<template>
<div>
    <q-table dense flat :data="deliveries" :columns="columns" row-key="name" hide-no-data color="primary" v-bind:request="getDeliveriesByInventoryId">
        <q-tr class="my-font" slot="body" slot-scope="props" :props="props">
            <q-tooltip v-if="props.row.description.length>0">
                {{ props.row.description }}
            </q-tooltip>
            <q-td key="dateOfDelivery" :props="props">
                {{ props.row.dateOfDelivery }}
                <q-icon v-if="props.row.description.length>0" class="text-weight-bolder" color="primary" size="16px" name="notes" />
            </q-td>
            <q-td key="quantity" :props="props">
                {{ props.row.quantity }}
            </q-td>
            <q-td key="action" :props="props">
                <q-btn flat size="sm" dense unelevated color="primary" icon="create" v-on:click="editDelivery(props)">
                    <q-tooltip content-class="bg-blue-8">Edytuj dostawę</q-tooltip>
                </q-btn>
                <q-dialog v-model="showEditDeliveryDialog" persistent>
                    <q-card style="min-width: 15vw">
                        <q-card-section>
                            <div class="text-primary">Edycja dostawy:</div>
                        </q-card-section>
                        <q-card-section class="q-pt-none">
                            <q-input dense v-model.trim="editedDelivery.quantity" label="Ilość" type="number" :decimals="2" :rules="[(val) => val >= 0 && val.length > 0]" />
                            <q-input dense v-model="editedDelivery.dateOfDelivery" label="Data dostawy">
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                            <q-date v-model="editedDelivery.dateOfDelivery" mask="YYYY-MM-DD" minimal>
                                                <div class="row items-center justify-end">
                                                    <q-btn v-close-popup label="Zamknij" color="primary" flat />
                                                </div>
                                            </q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                </template>
                            </q-input>
                            <q-input dense v-model="editedDelivery.description" label="Uwagi" type="textarea" autogrow />
                        </q-card-section>
                        <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="Anuluj" v-close-popup />
                            <q-btn flat label="Zapisz" v-on:click="updateDelivery(editedDelivery)" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <q-btn flat size="sm" dense unelevated color="negative" icon="clear" v-on:click="confirmDelete(props)">
                    <q-tooltip content-class="bg-red">Usuń dostawę</q-tooltip>
                </q-btn>
            </q-td>
        </q-tr>
    </q-table>

    <q-btn v-if="loggedUser.role=='ROLE_ADMIN'" flat :disabled="disabledNewDelivery" label="Nowa Dostawa" color="primary" v-on:click="showAddDeliveryDialog = true" />

</div>
</template>

<script>
import axios from "axios";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "ProductDelivery",

    mounted: function () {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
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
            deliveries: [],

            newDeliveryQuantity: 1.0,
            newDeliveryDate: new Date().toJSON().slice(0, 10),
            newDeliveryDescription: "",
            newDeliveryArea: 0.0,

            loggedUser: {
                username: "",
                firstName: "",
                lastName: "",
                role: "",
                active: ""
            },

            columns: [{
                    name: "dateOfDelivery",
                    label: "Data dostawy",
                    field: "dateOfDelivery",
                    align: "left",
                    sortable: true,
                },
                {
                    name: "quantity",
                    label: "Ilość",
                    field: "quantity",
                    align: "left",
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
            console.log(this.deliveries);
        },

        editDelivery: function (props) {
            this.editedDelivery = Object.assign({}, props.row);
            this.showEditDeliveryDialog = true;
        },

        updateDelivery: function (editedDelivery) {
            const url = this.$API_URL + "deliveries";

            axios
                .put(url, {
                    id: this.editedDelivery.id,
                    quantity: this.editedDelivery.quantity,
                    deliveryDate: new Date().toJSON().slice(0, 10),
                    description: this.editedDelivery.description,
                    inventory: {
                        id: this.inventory.id,
                    },
                }, {
                    headers: { Authorization: localStorage.getItem("token") }
                }, {
                    contentType: "application/json"
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zaktualizowano dane o dostawie",
                        icon: "check_circle_outline",
                    });
                    this.getDeliveriesByInventoryId();
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
                            message: "Błąd aktualizacji danych o dostawie",
                            icon: "report_problem",
                        });
                    };
                });
        },

        confirmDelete: function (props) {
            this.$q
                .dialog({
                    title: "<span class=text-negative>Usuwanie dostawy</span>",
                    message: "<span class=text-negative>Czy usunąć dostawę" +
                        "<br/> dla ilości: <strong>" +
                        props.row.quantity +
                        "</strong> z dnia: <strong>" +
                        props.row.dateOfDelivery + "</strong>?</span>",
                    color: 'negative',
                    html: true,
                    persistent: true,
                    ok: {
                        label: 'usuń',
                        flat: true
                    },
                    cancel: true,
                }).onOk(() => {
                    this.deleteDelivery(props.row.id);
                })
        },

        deleteDelivery: function (id) {
            const url = this.$API_URL + "deliveries/" + id;

            axios
                .delete(url, {
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Usunięto dane o dostawie",
                        icon: "check_circle_outline",
                    });
                    this.getDeliveriesByInventoryId();
                    this.$root.$emit("refreshProducts");
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
                            message: "Błąd usuwania dostawy!",
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

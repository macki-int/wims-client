<template>

</template>

<script>
import axios from "axios";

export default {
    name: "ProductTypes",

    mounted() {
        this.getProductTypes();
    },

    data() {
        return {
            productTypes: [],

            columns: [{
                name: "name",
                label: "Nazwa",
                field: (row) => row.inventory.product.name,
                align: "left",
                sortable: true
            }, {

            }]

        }
    },

    methods: {
        getProductTypes: function () {
            const url = this.$API_URL + "product-types/";

            axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.productTypes = response.data;
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
                    } else if (error.response.status === 500) {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Strona nie istnieje",
                            icon: "report_problem",
                        });
                        this.$root.$emit("logout", item, response)
                    } else {
                        this.$q.notify({
                            color: "negative",
                            position: "top",
                            message: "Błąd pobierania kategorii",
                            icon: "report_problem",
                        });
                    };
                });
        }
    }
}
</script>

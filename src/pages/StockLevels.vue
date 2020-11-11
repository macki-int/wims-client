<template>
<q-page class="flex flex-center">

    <div class="row">
        <div class="col-md-6">
            <div class="q-pa-md">
                <q-table title="" :data=" data" :columns="columns" row-key="name" />
            </div>
        </div>

        <div class="col-3"></div>

        <div class=" col-3">
            <p>Typy produktów:
                {{ $route.params.id }}
            </p>
        </div>
    </div>

</q-page>
</template>

<script>
import axios from "axios";

export default {
    name: 'StockLevels',

    // mounted: function () {
    //     this.getProductTypes();
    // },

    data() {
        return {
            title: $route.params.id,
            products: []
        }
    },

    methods: {
        getProducts: function () {
            const url = "http://localhost:8080/products";

            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    //console.log("response: " + JSON.stringify(response.data));
                    this.products = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Products types loading failed",
                        icon: "report_problem"
                    });
                });
            // console.log("refresh");
        }
    }
}
</script>

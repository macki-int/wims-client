<template>
<q-page class="flex flex-center">

    <div class="row">
        <div class="col-md-6">
            <div class="q-pa-md">
                <q-table :title="$route.params.id" :data=" data" :columns="columns" row-key="name" />
            </div>
        </div>

        <div class="col-3"></div>

        <div class=" col-3">
            <p>Szczegóły produktu:

            </p>
        </div>
    </div>

</q-page>
</template>

<script>
import axios from "axios";

export default {
    name: 'StockLevels',

    mounted: function () {
        this.getProductTypeName();
    },

    data() {
        return {
            productType: []
        }
    },
    watch: {
        $route(to, from) {
            alert("router: ");
            // react to route changes...
        }

    },

    methods: {
        getProductTypeName: function () {
            const url = "http://localhost:8080/products/" + $route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.ProductTypeName = response.data;

                    alert(this.ProductTypeName.id);
                    //console.log("response: " + JSON.stringify(response.data));
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

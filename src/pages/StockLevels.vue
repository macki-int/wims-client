<template>
    <q-page class="flex flex-left">

        <div class="q-pa-md">
            <div class="row">
                <div class="col-6-md">
                    <q-card class="my-card" style="width: 1000px">
                        <div style="min-height: 700px">
                            <q-card-section>
                                <div class="text-h6">{{ productTypeName.name }}</div>
                            </q-card-section>
                            <q-markup-table dense>
                                <thead>
                                    <tr>
                                        <th class="text-left">Id</th>
                                        <th class="text-left">Nazwa</th>
                                        <th class="text-right">Szerokość</th>
                                        <th class="text-right">Długość</th>
                                        <th class="text-right">Ilość</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(data, index) in products" :key="index">
                                        <td class="text-left">{{ data.id }}</td>
                                        <td class="text-right">{{ data.employee_salary }}</td>
                                        <td class="text-right">{{ data.employee_age }}</td>
                                        <td class="text-right">{{ data.profile_image }}</td>
                                    </tr>
                                </tbody>

                            </q-markup-table>

                        </div>
                    </q-card>
                </div>

                <div class="col-1-md" style="width: 10px">
                </div>
                <div class="col-3-md" style="width: 500px ">

                    <div class="my-card">

                        <q-card class="my-card">
                            <div style="min-height: 700px">
                                <q-card-section>
                                    <div class="text-h6">{{ nameProduct }}</div>
                                </q-card-section>
                            </div>
                        </q-card>
                    </div>

                </div>
            </div>
        </div>



    </q-page>
</template>

<script>
import axios from "axios";
// import VueRouter from "vue-router";

export default {
    name: "StockLevels",

    mounted() {
        this.getProductTypeName();
        this.getProductsByProductTypeId();

    },

    data() {
        return {
            productTypeName: [],
            products: [],
            nameProduct: ''
        }
    },

    // afterRouteUpdate(to, from, next) {

    // this.productTypeName = null;
    // pretendGet((err, name) => {
    //     this.setName(err, name);
    // next();
    // });
    // },
    // routes: [{
    //     router.beforeEach((to, from, next) => {
    //         alert($route.params.id)
    //     })
    // }],

    watch: {
        $route(to, from) {
            this.getProductTypeName();
        }
    },


    methods: {
        getProductTypeName: function() {
            const url = "http://localhost:8080/product-types/" + this.$route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.productTypeName = response.data;
                    // nameProduct = this.productTypeName.name;
                    // alert(event.target.tagName);
                    //console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product type loading failed",
                        icon: "report_problem"
                    });
                });
            // console.log("refresh");
        },

        getProductsByProductTypeId: function() {
            const url = "http://localhost:8080/products/" + this.$route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.productTypeName = response.data;
                    // nameProduct = this.productTypeName.name;
                    // alert(event.target.tagName);
                    //console.log("response: " + JSON.stringify(response.data));
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Product type loading failed",
                        icon: "report_problem"
                    });
                });
            // console.log("refresh");
        }
    }
};
</script>

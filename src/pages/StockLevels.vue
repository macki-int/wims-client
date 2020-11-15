<template>
    <q-page class="flex flex-left">
        <div class="q-pa-md">
            <div class="row">
                <div class="col-6-md q-pr-md">
                    <q-card class="my-card" style="width: 1000px">
                        <div style="min-height: 800px">
                            <q-card-section>
                                <div class="text-h6">{{ productTypeName.name }}</div>
                            </q-card-section>
                            <q-markup-table dense class="no-shadow">
                                <thead>
                                    <tr>
                                        <th class="text-left">Id</th>
                                        <th class="text-left">Nazwa</th>
                                        <th class="text-right">Szerokość</th>
                                        <th class="text-right">Długość</th>
                                        <th class="text-right">Ilość</th>
                                        <th class="text-right">Powierzchnia</th>
                                        <th class="text-right">Aktywny</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(product, id) in products" :key="id">
                                        <td class="text-left">{{ product.id }}</td>
                                        <td class="text-left">{{ product.name }}</td>
                                        <!--td class="text-right">{{ product.width }}</td>
                                                                                                <td class="text-right">{{ product.lenght }}</td>
                                                                                                <td class="text-right">{{ product.quantity }}</td-->
                                    </tr>
                                </tbody>
                            </q-markup-table>
                        </div>
                    </q-card>
                </div>

                <div class="col-3-md" style="width: 500px" >
                    <q-card class="my-card">
                        <div style="min-height: 800px">
                            <q-card-section>
                                <!--div class="text-h6">{{ productTypeName.name }}</div-->
                                <template>
                                              <div class="q-pa-md" style="max-width: 470px">

                                                <q-form
                                                  @submit="onSubmit"
                                                  @reset="onReset"
                                                  class="q-gutter-md">

                                                <q-select
                                                  v-model="productTypeName.name"
                                                  :options="productTypeName"
                                                  label="Kategoria wyrobu"
                                                  lazy-rules
                                                  :rules="[ val => val && val.length > 0 || 'Podaj nazwę wyrobu!']"
                                                  />
                                                <q-select
                                                  v-model="nameSelectedProduct"
                                                  :options="products"
                                                  label="Nazwa"
                                                  lazy-rules
                                                  :rules="[ val => val && val.length > 0 || 'Podaj nazwę wyrobu!']"
                                                  />
                                                  <q-input
                                                    full-width no-outline
                                                    type="number"
                                                    v-model="width"
                                                    label="Szerokość"/>
                                                  <q-input
                                                    full-width no-outline
                                                    type="number"
                                                    v-model="length"
                                                    label="Długość"/>
                                                  <q-input
                                                    full-width no-outline
                                                    type="number"
                                                    v-model="quantity"
                                                    label="Ilość"/>
                                                  <q-input
                                                    full-width no-outline
                                                    readonly
                                                    type="number"
                                                    v-model="area"
                                                    label="Powierzchnia"/>
                                                  <q-toggle v-model="activeValue" label="Produkt aktywny" />
                                                  <q-input
                                                    full-width no-outline
                                                    v-model="description"
                                                    type="textarea"
                                                    label="Uwagi"/>

                                                  <div>
                                                    <q-btn label="Zapisz" type="submit" color="primary"/>
                                                    <q-btn label="Rezerwacja" type="reset" color="primary" flat class="q-ml-sm" />
                                                  </div>

                                                </q-form>
                                              </div>
</template>
                            </q-card-section>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script>
import axios from "axios";

export default {
    name: "StockLevels",

    watch: {
        $route(to, from) {
            this.getProductTypeName();
            this.getProductsByProductTypeId();
        }
    },

    mounted() {
        this.getProductTypeName();
        this.getProductsByProductTypeId();

    },

    data() {
        return {
            activeValue: true,
            productTypeName: [],
            products: [],
            nameSelectedProduct: ''
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
        },

        getProductsByProductTypeId: function() {
            const url = "http://localhost:8080/products/product-types/" + this.$route.params.id;
            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.products = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Products loading failed",
                        icon: "report_problem"
                    });
                });
        }
    }
};
</script>

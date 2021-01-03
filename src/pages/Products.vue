<template>
<q-page class='flex flex-left'>
    <div class='q-pa-md'>
        <q-card class='my-card' style='width: 1300px'>
            <div style='min-height: 800px'>
                <q-card-section>
                    <div class='text-h6'>Wszystkie produkty</div>
                </q-card-section>
                <q-markup-table dense class='no-shadow'>
                    <thead>
                        <q-tr>
                            <th class='text-left'>Id</th>
                            <th class='text-left'>Nazwa</th>
                            <th class='text-left'>Typ</th>
                            <th class='text-right'>Aktywny</th>
                            <th class='text-right'></th>
                        </q-tr>
                    </thead>
                    <tbody>
                        <q-tr v-for='(product, id) in products' :key='id'>
                            <td class='text-left'>{{ product.id }}</td>
                            <td class='text-left'>{{ product.name }}</td>
                            <td class='text-left'>{{ product.productType.name }}</td>
                            <td class='text-right'>
                                <q-checkbox size='xs' color='grey' v-model='product.active' v-on:click.native='activateProduct(product)'>
                                </q-checkbox>
                            </td>
                            <td class='text-right'>
                                <q-btn-group>
                                    <q-btn color='blue' icon='edit' v-on:click='save = true' size=sm></q-btn>
                                    <!-- <q-dialog v-model='save' persistent>
                                        <q-card style='min-width: 350px'>
                                            <q-card-section>
                                                <div class='text-primary'>Edycja nazwy produktu</div>
                                            </q-card-section>

                                            <q-card-section class='q-pt-none'>
                                                <q-input v-model.trim='newProductName' @focus='$event.target.select()' autofocus dense v-on:keyup.enter='save = false' />
                                            </q-card-section>

                                            <q-card-actions align='right' class='text-primary'>
                                                <q-btn flat label='Anuluj' v-close-popup />
                                                <q-btn flat label='Zapisz' v-on:click='editProductName' v-close-popup />
                                            </q-card-actions>
                                        </q-card>
                                    </q-dialog> -->

                                    <q-btn color='red' icon='disabled_by_default' v-on:click='deleteProduct(product)' size=sm no-caps />
                                </q-btn-group>
                            </td>
                        </q-tr>
                    </tbody>
                </q-markup-table>
            </div>
        </q-card>
    </div>
</q-page>
</template>

<script>
import axios from 'axios';

export default {
    name: 'Products',

    mounted() {
        this.getProducts();
    },

    data() {
        return {
            products: [],
            confirmDelete: false,
            newProductName: '',

            save: false
        };
    },

    methods: {
        getProducts: function () {
            const url =
                'https://wims-mj.herokuapp.com/products';
            axios
                .get(url, {
                    dataType: 'json',
                    headers: {}
                })
                .then(response => {
                    this.products = response.data;
                })
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'Products loading failed',
                        icon: 'report_problem'
                    });
                });
        },

        editProductName: function () {
            const url = 'https://wims-mj.herokuapp.com/products';

            axios
                .put(url, {
                    id: this.id,
                    name: this.newProductName,
                })
                .then((response) => {
                    this.$q.notify({
                        color: 'positive',
                        position: 'top',
                        message: 'Product name saving OK',
                        icon: 'check_circle',
                    });
                })
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'The name of product saving failed',
                        icon: 'report_problem',
                    });
                });
        },

        deleteProduct: function (product) {
            const url = 'https://wims-mj.herokuapp.com/products/' + product.id;

            axios
                .delete(url)
                .then(response => {
                    this.$q.notify({
                            color: 'positive',
                            position: 'top',
                            message: 'Product deleted: ' + product.name,
                            icon: 'check_circle'
                        }),
                        location.reload();
                })
                .catch(() => {
                    this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: 'The product deleting failed!',
                        icon: 'report_problem',
                    });
                });
        },

        activateProduct: function (product) {
            const url = '';

            if (product.active) {
                this.url = 'https://wims-mj.herokuapp.com/products/activate/' + product.id;

            } else {
                this.url = 'https://wims-mj.herokuapp.com/products/deactivate/' + product.id;
            };

            axios
                .patch(this.url)
                .then(response => {
                    this.$q.notify({
                        color: 'positive',
                        position: 'top',
                        message: 'Product updated: ' + product.name,
                        icon: 'check_circle'
                    })
                })
                .catch(() => {
                    this.$q.notify({
                            color: 'negative',
                            position: 'top',
                            message: 'The product updating failed!',
                            icon: 'report_problem',
                        }),
                        location.reload();
                });
            // location.reload();
            //EventBus.$emit('productTypesUpdated');
        }
    },
};
</script>

<template>
    <q-page class="flex flex-center">

        <div class="row">
            <div class="col-md-6">
                <div class="q-pa-md">
                    <q-table dense :title="$route.params.id" :data=" data" :columns="columns" :filter="filter" no-data-label="Brak danych" no-results-label="Nie znaleziono danych spełniających podane kryteria" row-key=" name">
                        <template v-slot:top-right>
                                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                                    <q-icon slot="append" name="search" />
                                </q-input>
</template>

<template v-slot:no-data="{ icon, message, filter }">
    <div class="full-width row flex-center text-primary q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied" />
        <span>
                                        Niestety, to smutne... {{ message }}
                                    </span>
        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
    </div>
</template>
                </q-table>
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

    mounted: function() {
        this.getProductTypeName();
    },

    data() {
        return {
            productTypeName: [],
            filter: '',
            columns: [{
                    name: 'id',
                    label: 'Id',
                    field: 'id',
                    align: 'left'
                },
                {
                    name: 'name',
                    label: 'Nazwa',
                    field: 'name',
                    align: 'left'
                }
            ],
        }
    },

    watch: {
        $route(to, from) {
            // console.log("router: " + $route.params.id);
            this.getProductTypeName();
        }
    },

    methods: {
        getProductTypeName: function() {
            const url = "http://localhost:8080/products/" + $route.params.id;
            alert(url);

            axios
                .get(url, {
                    dataType: "json",
                    headers: {}
                })
                .then(response => {
                    this.ProductTypeName = response.data;

                    alert(event.target.tagName);
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

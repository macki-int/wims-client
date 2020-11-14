<template>
    <q-page class="flex flex-left">

        <div class="q-pa-md">
            <div class="row">
                <div class="col-6-md">
                    <q-card class="my-card" style="width: 1000px">
                        <div style="min-height: 700px">
                            <q-card-section>
                                <div class="text-h6">{{ $route.params.id }}</div>
                            </q-card-section>
                            <q-markup-table dense :filter="filter" no-data-label="Brak danych" no-results-label="Nie znaleziono danych spełniających podane kryteria">
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
                                    <tr v-for="(data, index) in myJson" :key="index">
                                        <td class="text-left">{{ data.id }}</td>
                                        <td class="text-right">{{ data.employee_salary }}</td>
                                        <td class="text-right">{{ data.employee_age }}</td>
                                        <td class="text-right">{{ data.profile_image }}</td>
                                    </tr>
                                </tbody>

                                <!--template v-slot:top-right>
                                                                                                              <q-input
                                                                                                                borderless
                                                                                                                dense
                                                                                                                debounce="300"
                                                                                                                v-model="filter"
                                                                                                                placeholder="Search">
                                                                                                              <q-icon slot="append" name="search" />
                                                                                                              </q-input>
</template>

<template v-slot:no-data="{ icon, message, filter }">
    <div class="full-width row flex-center text-primary q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied" />
        <span> Niestety, to smutne... {{ message }} </span>
        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
    </div>
    </template-->
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
                        <div class="text-h6">{{ $route.params.id }}</div>
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

export default {
    name: "StockLevels",

    mounted: function() {
        this.getProductTypeName();
    },

    data() {
        return {
            productTypeName: [],
            filter: "",
            columns: [{
                    name: "id",
                    label: "Id",
                    field: "id",
                    align: "left"
                },
                {
                    name: "name",
                    label: "Nazwa",
                    field: "name",
                    align: "left"
                }
            ]
        };
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
};
</script>

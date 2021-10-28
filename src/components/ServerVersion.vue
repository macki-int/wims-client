<template>
<q-dialog v-model="card" ref="dialog">
    <q-card class="my-card text-primary" style="min-width:400px">
        <div class="row">
            <img alt="Wims logo" src="~assets/icon-96x96.png" style="width: 23%;">
            <q-card-section>
                <div class="text-h4 ellipsis">
                    <strong>WIMS</strong>
                </div>
                <div class="text-caption">
                    Warehouse Inventory Management System
                </div>
            </q-card-section>
        </div>
        <q-card-section class="bg-primary text-white">
            TROLL-Systems Marek Janicki &copy; 2021
        </q-card-section>
        <q-card-actions>
            <div class="col q-ml-sm text-caption" align="left">
                Wersja serwera: <strong>{{ infoServerVersion }}</strong>
            </div>
            <div class="col" align="right">
                <q-btn v-close-popup flat color="primary" label="OK" />
            </div>
        </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script>
import axios from "axios";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "ServerVersion",

    mounted: function () {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
        this.getServerVersion();
    },

    data() {
        return {
            card: false,

            infoRole: "",
            infoServerVersion: "",

            loggedUser: {
                username: "",
                firstName: "",
                lastName: "",
                role: "",
                active: ""
            },
        }
    },

    methods: {
        getServerVersion: function () {
            const url = this.$API_URL + "server-versions";

             axios
                .get(url, {
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "Authorization": localStorage.getItem("token") }
                })
                .then((response) => {
                    this.infoServerVersion = response.data;
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
                            message: "Błąd pobierania wersji serwera",
                            icon: "report_problem",
                        });
                    };
                });

        },

        show: function () {
            this.infoRole = this.loggedUser.role.split('_')
            this.$refs.dialog.show()
        }
    }
}
</script>

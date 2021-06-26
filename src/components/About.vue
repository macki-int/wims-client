<template>
<q-dialog v-model="card" ref="dialog" >
    <q-card class="my-card text-primary" style="min-width:400px">
        <div class="row">
            <img alt="Wims logo" src="~assets/icon-96x96.png" style="width: 23%;">
            <q-card-section >
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
        <q-card-section class="bg-primary text-white">
            Zalogowany: <strong> {{ this.loggedUser.firstName }} {{ this.loggedUser.lastName }} </strong><br>
            Uprawnienia:<strong> {{ this.infoRole[1] }}</strong>
        </q-card-section>
        <q-card-actions>
            <div class="col q-ml-sm text-caption" align="left">
                v0.16 &beta;
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

export default {
    name: "About",

    mounted: function () {
        this.getLoggedUserFromLocalStore();
    },

    data() {
        return {
            card: false,
            infoRole: "",
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
        show: function () {
            this.infoRole = this.loggedUser.role.split('_')
            this.$refs.dialog.show()
        },

        getLoggedUserFromLocalStore: function() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    }
}
</script>

<template>
<q-dialog v-model="card" ref="dialog">
    <q-card class="my-card text-primary">
        <div class="row">
        <img alt="Wims logo" src="~assets/icon-96x96.png" style="width: 12%;">
        <q-card-section>
            <div class="text-h6 ellipsis" >
                Warehouse Inventory Management System
            </div>
        </q-card-section>
        </div>
        <q-card-section>
            Zalogowany: <strong> {{this.loggedUser.firstName}} {{this.loggedUser.lastName}} </strong>
            <br>
            Uprawnienia:<strong> {{ this.infoRole[1] }}</strong>
            <br>
        </q-card-section>
        <q-card-actions align="right">
            <!-- <img alt="Troll-Systems logo" src="~assets/..." style="width: 30%;"> -->
            <q-btn v-close-popup flat color="primary" label="OK" />
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
        // showInfoDialog: function () {
            //     const role = this.loggedUser.role.split('_')
        //     this.$q
        //         .dialog({
            //             title: "<span class=text-primary><strong>WIMS</strong> v0.07(beta)",
        //             message: "<span class=text-primary><strong> Warehouse Inventory Management System</strong>" +
        //                 "<br>" +
        //                 "TROLL-Systems Marek Janicki (C)" +
        //                 "<br>" +
        //                 "<br>" +
        //                 "<div class=text-caption> Zalogowany: <strong>" + this.loggedUser.firstName + " " + this.loggedUser.lastName + "</strong>" +
        //                 "<br>" +
        //                 " Uprawnienia: <strong>" + role[1] + "</strong></div></span>",
        //             html: true,
        //         })
        // },

        show() {
            this.infoRole = this.loggedUser.role.split('_')
            this.$refs.dialog.show()
        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    }
}
</script>

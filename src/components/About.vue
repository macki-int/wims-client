<template>

</template>

<script>
import axios from "axios";

export default {
    name: "About",
    data() {
        },

    methods: {
        showInfoDialog: function () {
            const role = this.loggedUser.role.split('_')
            this.$q
                .dialog({
                    title: "<span class=text-primary><strong>WIMS</strong> v0.07(beta)",
                    message: "<span class=text-primary><strong> Warehouse Inventory Management System</strong>" +
                        "<br>" +
                        "TROLL-Systems Marek Janicki (C)" +
                        "<br>" +
                        "<br>" +
                        "<div class=text-caption> Zalogowany: <strong>" + this.loggedUser.firstName + " " + this.loggedUser.lastName + "</strong>" +
                        "<br>" +
                        " Uprawnienia: <strong>" + role[1] + "</strong></div></span>",
                    html: true,
                })
        },

        getLoggedUserFromLocalStore() {
            this.loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
        }
    }
}
</script>

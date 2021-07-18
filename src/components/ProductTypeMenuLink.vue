<template>
<q-item clickable>
    <q-item-section v-if="icon" avatar v-on:click="getProductsByProductType(name)">
        <q-icon color="blue-3" size="14px" :name="icon" />
    </q-item-section>

    <q-item-section v-on:click="getProductsByProductType(id)">
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label hidden caption>{{ id }}</q-item-label>
    </q-item-section>
</q-item>
</template>

<script>
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "ProductTypeMenuLink",

    props: {
        id: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "forward",
        },
    },

    mounted() {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
    },

    data() {
        return {
            confirmDelete: false,
            save: false,
            newNameProductType: this.name,

            loggedUser: {
                username: "",
                firstName: "",
                lastName: "",
                role: "",
                active: ""
            }
        };
    },

    methods: {
        getProductsByProductType: function (id) {
            this.$router.push({
                path: "/" + this.id,
            });
        }
    },
};
</script>

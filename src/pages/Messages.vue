<template>
    
</template>

<script>
import axios from "axios";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "Messages",

    mounted() {
        this.loggedUser = LoggedUserFromLocalStore.getLoggedUserFromLocalStore();
        
    },

    data() {
        
    }
}
</script>

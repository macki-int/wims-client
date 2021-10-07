<template>
<q-page class="flex flex-left">
    <div class="q-pa-md">
        <q-card class="my-card fit" style="min-width: 60vw; min-height: 75vh">
            <q-card>
            </q-card>
        </q-card>
    </div>
</q-page>
</template>

<script>
import axios from "axios";
import { setNumericFormat } from "../js/setNumericFormat.js";
import LoggedUserFromLocalStore from "../js/LoggedUserFromLocalStore.js"

export default {
    name: "AllDeliveriesInProgress",

    data() {

    },
}
</script>

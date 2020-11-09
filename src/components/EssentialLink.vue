<template>
<q-item clickable tag="a" target="_blank" :href="link">
    <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label caption>{{ id }}</q-item-label>
    </q-item-section>
</q-item>
</template>

<script>
export default {
    name: "EssentialLink",
    props: {
        name: {
            type: String,
            required: true,
        },

        id: {
            type: Number,
            required: true,
        },

        link: {
            type: String,
            default: "#",
        },

        icon: {
            type: String,
            default: "",
        },
    },
};
</script>

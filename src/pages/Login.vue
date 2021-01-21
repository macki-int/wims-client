<template>
<q-page class="flex flex-left">
    <q-card class="my-card" style="width: 500px; height: 400px">
        <q-card-section>
            <q-form v-on:submit.prevent="login" class="q-gutter-md">
                <q-card-section>
                    <img src="~assets/wims-logo-full.svg" style="height: 50px;" />
                    <div class="text-h6 text-primary">Logowanie:</div>
                </q-card-section>
                <q-card-section>
                    <q-input required v-model="user" no-outline type="text" clearable label="Nazwa użytkownika" />
                    <q-input required v-model="password" no-outline type="password" clearable label="Hasło" />
                </q-card-section>
                <q-card-actions align="left" class="text-primary">
                    <q-btn flat type="submit" label="Zaloguj" color="primary" />
                </q-card-actions>
            </q-form>
        </q-card-section>
    </q-card>

</q-page>
</template>

<script>
export default {
    name: "Login",
    data() {
        return {
            user: "",
            password: ""
        }
    },
    methods: {
        login: function () {
            const user = this.user
            const password = this.password
            this.$store.dispatch('login', { user, password })
                .then(() => this.$router.push('/'))
                .catch(err => console.log(err))
        }
    }
}
</script>

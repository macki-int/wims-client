<template>
<q-page class="flex flex-center">
    <q-card class="my-card" style="width: 500px; height: 400px">
        <q-card-section>
            <q-form v-on:submit.prevent="login" class="q-gutter-md">
                <q-card-section>
                    <img src="~assets/wims-logo-full.svg" style="height: 50px;" />
                    <div class="text-h6 text-primary">LOGOWANIE</div>
                </q-card-section>
                <q-card-section>
                    <q-input required v-model="username" no-outline type="text" label="Nazwa użytkownika (nick)" />
                    <q-input required v-model="password" no-outline :type="isPwd ? 'password' : 'text'" label="Hasło">
                        <template v-slot:append>
                            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                        </template>
                    </q-input>
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
import axios from "axios";

export default {
    name: "Login",

    data() {
        return {
            isPwd: true,
            username: "",
            password: ""
        }

    },

    methods: {
        login: function () {
            const user = this.username.toLowerCase();
            const password = this.password;
            const url = this.$API_URL + "users/login";

            return axios
                .post(url, {
                    userName: user,
                    password: password
                })
                .then((response) => {
                    const token = response.headers.authorization;

                    localStorage.setItem("token", token);

                    this.$q.notify({
                        color: "positive",
                        position: "top",
                        message: "Zalogowano",
                        icon: "check_circle_outline",
                    });

                    EventBus.$emit("logged", user);
                    this.$router.push("/");
                })
                .catch(() => {
                    localStorage.removeItem("token");

                    this.$q.notify({
                        color: "negative",
                        position: "top",
                        message: "Błąd Logowania",
                        icon: "report_problem",
                    });
                });
        },

    }
}
</script>

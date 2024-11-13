<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h5">Registracija</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="user.name"
          label="Ime"
          filled
          class="q-mb-md"
        />

        <q-input
          v-model="user.email"
          label="E-mail"
          type="email"
          filled
          class="q-mb-md"
        />

        <q-input
          v-model="user.password"
          label="Lozinka"
          type="password"
          filled
          class="q-mb-md"
        />

        <q-input
          v-model="user.confirmPassword"
          label="Potvrdi lozinku"
          type="password"
          filled
          class="q-mb-md"
        />
      </q-card-section>

      <q-card-section>
        <q-btn
          label="Potvrdi"
          color="primary"
          @click="submitForm"
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const user = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    const submitForm = () => {
      if (!user.value.name || !user.value.email || !user.value.password || !user.value.confirmPassword) {
        alert('Ispunite sva polja.');
        return;
      }

      if (user.value.password !== user.value.confirmPassword) {
        alert('Lozinke se ne podudaraju.');
        return;
      }
      alert(`Registracija uspješna za korisnika: ${user.value.name}`);
    };

    return {
      user,
      submitForm,
    };
  },
};
</script> 
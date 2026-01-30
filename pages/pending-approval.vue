<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Compte en attente d'approbation
      </h1>

      <p class="text-gray-600 mb-8">
        Votre inscription a bien été enregistrée. Un administrateur doit approuver votre compte avant que vous puissiez accéder à la plateforme.
      </p>

      <p class="text-sm text-gray-500 mb-8">
        Vous recevrez un email dès que votre compte sera activé.
      </p>

      <div class="space-y-4">
        <button
          @click="checkStatus"
          :disabled="checking"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ checking ? 'Vérification...' : 'Vérifier mon statut' }}
        </button>

        <button
          @click="logout"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Se déconnecter
        </button>
      </div>

      <p v-if="owner" class="mt-8 text-xs text-gray-400">
        Connecté en tant que {{ owner.email }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const router = useRouter()
const checking = ref(false)
const owner = ref<{ email: string; status: string } | null>(null)

async function checkStatus() {
  checking.value = true
  try {
    const response = await $fetch('/api/auth/me')
    owner.value = response.owner as any

    if (response.owner.status === 'active') {
      router.push('/dashboard')
    }
  } catch (e) {
    router.push('/login')
  } finally {
    checking.value = false
  }
}

async function logout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch (e) {
    // Ignore logout errors
  }
  router.push('/login')
}

onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/me')
    owner.value = response.owner as any

    if (response.owner.status === 'active') {
      router.push('/dashboard')
    } else if (response.owner.status === 'suspended') {
      router.push('/login')
    }
  } catch (e) {
    router.push('/login')
  }
})
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { AppNavbar, AppTabBar, AuthModal } from '@/components'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const transitionName = ref('page-slide-left')

const routeOrder: Record<string, number> = {
  '/': 0,
  '/workouts': 1,
  '/exercises': 2,
  '/progress': 3,
  '/session': 4,
  '/settings': 5,
  '/components': 6,
}

router.beforeEach((to, from) => {
  const toDepth = routeOrder[to.path] ?? 99
  const fromDepth = routeOrder[from.path] ?? 0
  transitionName.value = toDepth >= fromDepth ? 'page-slide-left' : 'page-slide-right'
})
</script>

<template>
  <div class="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
    <!-- Universal Top Navbar across all views -->
    <AppNavbar />

    <!-- Main Content Area with safe bottom spacing for mobile tab bar -->
    <main class="flex-1 pb-24 md:pb-10 overflow-x-clip">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentRoute.path">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </main>

    <!-- Mobile Bottom Tabs Bar (Hidden during active workout session) -->
    <AppTabBar v-if="route.path !== '/session'" />

    <!-- Modal Global de Autenticação / Sincronização em Nuvem -->
    <AuthModal
      :is-open="authStore.isAuthModalOpen"
      @close="authStore.closeAuthModal"
    />
  </div>
</template>

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'today',
      component: () => import('@/views/TodayView.vue'),
    },
    {
      path: '/workouts',
      name: 'workouts',
      component: () => import('@/views/WorkoutsView.vue'),
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import('@/views/ExercisesView.vue'),
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('@/views/ProgressView.vue'),
    },
    {
      path: '/session',
      name: 'session',
      component: () => import('@/views/SessionExecutionView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/components',
      name: 'components-library',
      component: () => import('@/views/ComponentsLibraryView.vue'),
    },
    {
      path: '/components-library',
      redirect: '/components',
    },
  ],
})

export default router

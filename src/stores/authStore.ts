import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/services/firebase'
import { SyncService, syncStatus } from '@/services/syncService'
import { usePreferencesStore } from './preferencesStore'
import { useWorkoutsStore } from './workoutsStore'
import { useSessionsStore } from './sessionsStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const isAuthActionLoading = ref(false)
  const authError = ref<string | null>(null)
  const isAuthModalOpen = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.uid ?? null)
  const userDisplayName = computed(() => user.value?.displayName || 'Atleta')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.photoURL || null)

  function openAuthModal() {
    authError.value = null
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
    authError.value = null
  }

  function reloadAllStores() {
    const preferencesStore = usePreferencesStore()
    const workoutsStore = useWorkoutsStore()
    const sessionsStore = useSessionsStore()

    preferencesStore.load()
    workoutsStore.load()
    sessionsStore.load()
  }

  /**
   * Inicializa o observador de estado do Firebase Auth
   */
  function initAuth() {
    if (!auth || !isFirebaseConfigured) {
      isLoading.value = false
      return
    }

    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser
      isLoading.value = false

      if (currentUser) {
        // Dispara sincronização em nuvem e recarrega dados nas stores
        await SyncService.syncOnLogin(currentUser.uid, reloadAllStores)
      } else {
        syncStatus.value = 'idle'
      }
    })
  }

  /**
   * Login com Google via Popup
   */
  async function signInWithGoogle(): Promise<boolean> {
    if (!auth || !isFirebaseConfigured) {
      authError.value = 'Firebase não está configurado. Verifique o arquivo .env.'
      return false
    }

    isAuthActionLoading.value = true
    authError.value = null

    try {
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      closeAuthModal()
      return true
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        // Usuário apenas fechou a janela do Google
        authError.value = null
      } else if (error.code === 'auth/popup-blocked') {
        authError.value = 'O navegador bloqueou a janela pop-up do Google. Permita pop-ups para continuar.'
      } else if (error.code === 'auth/unauthorized-domain') {
        authError.value = 'Este domínio não está autorizado no Firebase Console. Adicione-o em Authentication > Settings > Authorized Domains.'
      } else {
        authError.value = error.message || 'Falha ao autenticar com o Google. Tente novamente.'
      }
      return false
    } finally {
      isAuthActionLoading.value = false
    }
  }

  /**
   * Desconecta o usuário do Firebase Auth
   */
  async function signOutUser(): Promise<void> {
    if (!auth) {
      user.value = null
      return
    }

    isAuthActionLoading.value = true
    try {
      await signOut(auth)
      user.value = null
      syncStatus.value = 'idle'
    } catch (err) {
      console.error('Erro ao desconectar usuário:', err)
    } finally {
      isAuthActionLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    isAuthActionLoading,
    authError,
    isAuthModalOpen,
    isAuthenticated,
    userId,
    userDisplayName,
    userEmail,
    userPhotoURL,
    openAuthModal,
    closeAuthModal,
    initAuth,
    signInWithGoogle,
    signOutUser,
  }
})

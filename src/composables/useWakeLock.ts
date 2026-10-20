import { ref, onMounted, onUnmounted } from 'vue'

export function useWakeLock() {
  const isSupported = ref(typeof navigator !== 'undefined' && 'wakeLock' in navigator)
  const isActive = ref(false)
  let wakeLockSentinel: WakeLockSentinel | null = null

  async function requestWakeLock() {
    if (!isSupported.value) return
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen')
      isActive.value = true
      wakeLockSentinel.addEventListener('release', () => {
        isActive.value = false
      })
    } catch {
      // Falha silenciosa permitida pela spec (ex: bateria baixa ou permissão)
      isActive.value = false
    }
  }

  async function releaseWakeLock() {
    if (wakeLockSentinel) {
      try {
        await wakeLockSentinel.release()
      } catch {
        // Ignora
      }
      wakeLockSentinel = null
      isActive.value = false
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && isActive.value) {
      requestWakeLock()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    releaseWakeLock()
  })

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  }
}

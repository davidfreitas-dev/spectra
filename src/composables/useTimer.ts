import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useTimer(targetTimestamp = ref<number | null>(null)) {
  const now = ref(Date.now())
  let intervalId: ReturnType<typeof setInterval> | null = null

  function update() {
    now.value = Date.now()
  }

  onMounted(() => {
    intervalId = setInterval(update, 250)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
    window.removeEventListener('focus', update)
    document.removeEventListener('visibilitychange', update)
  })

  const remainingSeconds = computed(() => {
    if (!targetTimestamp.value) return 0
    const diff = targetTimestamp.value - now.value
    return Math.max(0, Math.ceil(diff / 1000))
  })

  const isFinished = computed(() => {
    if (!targetTimestamp.value) return false
    return now.value >= targetTimestamp.value
  })

  const formattedTime = computed(() => {
    const total = remainingSeconds.value
    const mins = Math.floor(total / 60)
    const secs = total % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  })

  function start(durationSeconds: number) {
    targetTimestamp.value = Date.now() + durationSeconds * 1000
    update()
  }

  function addSeconds(seconds: number) {
    if (!targetTimestamp.value) {
      start(seconds)
    } else {
      targetTimestamp.value += seconds * 1000
      update()
    }
  }

  function stop() {
    targetTimestamp.value = null
    update()
  }

  return {
    targetTimestamp,
    remainingSeconds,
    isFinished,
    formattedTime,
    start,
    addSeconds,
    stop,
    update,
  }
}

import { watch, onBeforeUnmount, type Ref } from 'vue'

let lockCount = 0
let scrollY = 0

function lock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  lockCount++
  if (lockCount === 1) {
    scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
  }
}

function unlock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (lockCount <= 0) return
  lockCount--
  if (lockCount === 0) {
    const rawTop = document.body.style.top
    const restoreY = rawTop ? Math.abs(parseInt(rawTop, 10)) : scrollY

    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.documentElement.style.overscrollBehavior = ''

    window.scrollTo({
      top: restoreY,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    })
  }
}

/**
 * Trava o scroll do body (evitando que a página de fundo role ao arrastar em dispositivos móveis/iOS)
 * e restaura exatamente a posição de rolagem prévia ao fechar.
 */
export function useBodyScrollLock(isOpen: Ref<boolean>) {
  watch(
    isOpen,
    (val, oldVal) => {
      if (val && !oldVal) {
        lock()
      } else if (!val && oldVal) {
        unlock()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (isOpen.value) {
      unlock()
    }
  })
}

interface ConfettiParticle {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  angle: number
  angularVelocity: number
  color: string
  shape: 'rect' | 'circle'
  opacity: number
  scale: number
}

export interface ConfettiOptions {
  particleCount?: number
  spread?: number
  origin?: { x: number; y: number }
  colors?: string[]
  gravity?: number
  scalar?: number
}

const SPECTRA_COLORS = [
  '#f26a21', // Laranja Spectra (Identidade da aplicação)
  '#fbbf24', // Amarelo Dourado (Recordes e Conquistas)
  '#22c55e', // Verde Vivo (Metas batidas e Sucesso)
]

export function useConfetti() {
  function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function fireConfetti(options: ConfettiOptions = {}) {
    if (typeof window === 'undefined' || prefersReducedMotion()) return

    const {
      particleCount = 50,
      spread = 60,
      origin = { x: 0.5, y: 0.5 },
      colors = SPECTRA_COLORS,
      gravity = 0.8,
      scalar = 1,
    } = options

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999'

    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const startX = width * origin.x
    const startY = height * origin.y

    const particles: ConfettiParticle[] = []

    for (let i = 0; i < particleCount; i++) {
      const angleRad = ((Math.random() - 0.5) * spread * Math.PI) / 180 - Math.PI / 2
      const speed = (Math.random() * 12 + 8) * scalar
      const vx = Math.cos(angleRad) * speed + (Math.random() - 0.5) * 4
      const vy = Math.sin(angleRad) * speed - Math.random() * 4

      particles.push({
        x: startX,
        y: startY,
        w: (Math.random() * 8 + 6) * scalar,
        h: (Math.random() * 12 + 8) * scalar,
        vx,
        vy,
        angle: Math.random() * 360,
        angularVelocity: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.3 ? 'rect' : 'circle',
        opacity: 1,
        scale: 1,
      })
    }

    let animationFrameId: number | null = null
    const startTime = performance.now()
    const maxDurationMs = 2800

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      if (elapsed >= maxDurationMs || particles.length === 0) {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas)
        }
        return
      }

      ctx?.clearRect(0, 0, width, height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.vy += gravity * 0.45
        p.vx *= 0.985
        p.angle += p.angularVelocity

        if (elapsed > 1200) {
          p.opacity = Math.max(0, 1 - (elapsed - 1200) / (maxDurationMs - 1200))
        }

        if (p.opacity <= 0 || p.y > height + 20) {
          particles.splice(i, 1)
          continue
        }

        ctx?.save()
        ctx?.translate(p.x, p.y)
        ctx?.rotate((p.angle * Math.PI) / 180)
        if (ctx) {
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color

          if (p.shape === 'rect') {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx?.restore()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    // Fallback de segurança para garantir a remoção
    setTimeout(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }, maxDurationMs + 200)
  }

  /**
   * Disparo duplo festivo vindo dos dois cantos inferiores ou do centro
   */
  function fireCelebrationBurst() {
    if (prefersReducedMotion()) return

    // Canhão esquerdo
    fireConfetti({
      origin: { x: 0.15, y: 0.75 },
      spread: 70,
      particleCount: 45,
      scalar: 1.1,
    })

    // Canhão direito com leve atraso
    setTimeout(() => {
      fireConfetti({
        origin: { x: 0.85, y: 0.75 },
        spread: 70,
        particleCount: 45,
        scalar: 1.1,
      })
    }, 150)
  }

  /**
   * Chuva suave de partículas caindo do topo
   */
  function fireMilestoneRain() {
    if (prefersReducedMotion()) return

    fireConfetti({
      origin: { x: 0.3, y: 0.1 },
      spread: 90,
      particleCount: 35,
      gravity: 0.5,
      scalar: 0.9,
    })

    setTimeout(() => {
      fireConfetti({
        origin: { x: 0.7, y: 0.1 },
        spread: 90,
        particleCount: 35,
        gravity: 0.5,
        scalar: 0.9,
      })
    }, 200)
  }

  return {
    fireConfetti,
    fireCelebrationBurst,
    fireMilestoneRain,
  }
}

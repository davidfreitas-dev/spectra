interface CustomAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext
}

export function useSound() {
  function playBeep(frequency = 587.33, duration = 0.15, type: OscillatorType = 'sine') {
    try {
      const customWindow = window as CustomAudioWindow
      const AudioCtx = window.AudioContext || customWindow.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Falha silenciosa permitida caso o navegador bloqueie áudio antes de interação
    }
  }

  function playTimerComplete() {
    // Tom triplo de conclusão
    playBeep(523.25, 0.12)
    setTimeout(() => playBeep(659.25, 0.12), 150)
    setTimeout(() => playBeep(783.99, 0.25), 300)

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 100, 200])
      } catch {
        // Ignora
      }
    }
  }

  function playSetComplete() {
    // Tom curto de sucesso
    playBeep(659.25, 0.1)

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(80)
      } catch {
        // Ignora
      }
    }
  }

  return {
    playTimerComplete,
    playSetComplete,
  }
}

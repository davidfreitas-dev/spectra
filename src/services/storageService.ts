import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from '@/constants/domain'
import {
  PreferencesSchema,
  SessionSchema,
  WorkoutSchema,
  type Preferences,
  type Session,
  type Workout,
} from '@/types/domain'
import { z } from 'zod'

export class StorageService {
  /**
   * Obtém a versão atual do schema persistido no localStorage
   */
  static getSchemaVersion(): number {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)
      return raw ? parseInt(raw, 10) : CURRENT_SCHEMA_VERSION
    } catch {
      return CURRENT_SCHEMA_VERSION
    }
  }

  /**
   * Grava a versão do schema no localStorage
   */
  static setSchemaVersion(version: number): void {
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, version.toString())
  }

  /**
   * Lê as preferências do usuário com validação de schema Zod
   */
  static getPreferences(): Preferences | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const validated = PreferencesSchema.safeParse(parsed)
      if (validated.success) {
        return validated.data
      }
      console.warn('Erro de validação nas preferências salvas:', validated.error)
      return null
    } catch (err) {
      console.error('Falha ao ler preferências do localStorage:', err)
      return null
    }
  }

  /**
   * Salva as preferências validadas no localStorage
   */
  static savePreferences(preferences: Preferences): boolean {
    try {
      const validated = PreferencesSchema.parse(preferences)
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(validated))
      return true
    } catch (err) {
      console.error('Falha ao salvar preferências no localStorage:', err)
      return false
    }
  }

  /**
   * Lê os treinos do usuário com validação de schema Zod
   */
  static getWorkouts(): Workout[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WORKOUTS)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      const validated = z.array(WorkoutSchema).safeParse(parsed)
      if (validated.success) {
        return validated.data
      }
      console.warn('Erro de validação nos treinos salvos:', validated.error)
      return []
    } catch (err) {
      console.error('Falha ao ler treinos do localStorage:', err)
      return []
    }
  }

  /**
   * Salva os treinos validados no localStorage
   */
  static saveWorkouts(workouts: Workout[]): boolean {
    try {
      const validated = z.array(WorkoutSchema).parse(workouts)
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(validated))
      return true
    } catch (err) {
      console.error('Falha ao salvar treinos no localStorage:', err)
      return false
    }
  }

  /**
   * Lê o histórico de sessões com validação de schema Zod
   */
  static getSessions(): Session[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      const validated = z.array(SessionSchema).safeParse(parsed)
      if (validated.success) {
        return validated.data
      }
      console.warn('Erro de validação nas sessões salvas:', validated.error)
      return []
    } catch (err) {
      console.error('Falha ao ler sessões do localStorage:', err)
      return []
    }
  }

  /**
   * Salva o histórico de sessões validadas no localStorage
   */
  static saveSessions(sessions: Session[]): boolean {
    try {
      const validated = z.array(SessionSchema).parse(sessions)
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(validated))
      return true
    } catch (err) {
      console.error('Falha ao salvar sessões no localStorage:', err)
      return false
    }
  }

  /**
   * Lê a sessão ativa em andamento com validação de schema Zod
   */
  static getActiveSession(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const validated = SessionSchema.safeParse(parsed)
      if (validated.success) {
        return validated.data
      }
      console.warn('Erro de validação na sessão ativa:', validated.error)
      return null
    } catch (err) {
      console.error('Falha ao ler sessão ativa do localStorage:', err)
      return null
    }
  }

  /**
   * Salva ou atualiza a sessão ativa
   */
  static saveActiveSession(session: Session | null): boolean {
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION)
        return true
      }
      const validated = SessionSchema.parse(session)
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(validated))
      return true
    } catch (err) {
      console.error('Falha ao salvar sessão ativa no localStorage:', err)
      return false
    }
  }

  /**
   * Limpa todos os dados locais do aplicativo
   */
  static clearAll(): void {
    // Remove todas as chaves do Spectra do localStorage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}

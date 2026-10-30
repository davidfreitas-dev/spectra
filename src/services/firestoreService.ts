import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  PreferencesSchema,
  WorkoutSchema,
  SessionSchema,
  type Preferences,
  type Workout,
  type Session,
} from '@/types/domain'

export class FirestoreService {
  /**
   * Salva as preferências do usuário no Firestore
   */
  static async savePreferences(userId: string, preferences: Preferences): Promise<boolean> {
    if (!db) return false
    try {
      const validated = PreferencesSchema.parse(preferences)
      const ref = doc(db, 'users', userId, 'preferences', 'main')
      await setDoc(ref, validated)
      return true
    } catch (err) {
      console.error('Erro ao salvar preferências no Firestore:', err)
      return false
    }
  }

  /**
   * Lê as preferências do usuário do Firestore
   */
  static async fetchPreferences(userId: string): Promise<Preferences | null> {
    if (!db) return null
    try {
      const ref = doc(db, 'users', userId, 'preferences', 'main')
      const snapshot = await getDoc(ref)
      if (!snapshot.exists()) return null

      const parsed = PreferencesSchema.safeParse(snapshot.data())
      if (parsed.success) {
        return parsed.data
      }
      console.warn('Validação de preferências falhou no Firestore:', parsed.error)
      return null
    } catch (err) {
      console.error('Erro ao buscar preferências no Firestore:', err)
      return null
    }
  }

  /**
   * Salva ou atualiza um treino no Firestore
   */
  static async saveWorkout(userId: string, workout: Workout): Promise<boolean> {
    if (!db) return false
    try {
      const validated = WorkoutSchema.parse(workout)
      const ref = doc(db, 'users', userId, 'workouts', workout.id)
      await setDoc(ref, validated)
      return true
    } catch (err) {
      console.error(`Erro ao salvar treino ${workout.id} no Firestore:`, err)
      return false
    }
  }

  /**
   * Remove um treino do Firestore
   */
  static async deleteWorkout(userId: string, workoutId: string): Promise<boolean> {
    if (!db) return false
    try {
      const ref = doc(db, 'users', userId, 'workouts', workoutId)
      await deleteDoc(ref)
      return true
    } catch (err) {
      console.error(`Erro ao remover treino ${workoutId} no Firestore:`, err)
      return false
    }
  }

  /**
   * Busca todos os treinos do usuário no Firestore
   */
  static async fetchWorkouts(userId: string): Promise<Workout[]> {
    if (!db) return []
    try {
      const colRef = collection(db, 'users', userId, 'workouts')
      const snapshot = await getDocs(colRef)
      const workouts: Workout[] = []

      snapshot.forEach((docSnap) => {
        const parsed = WorkoutSchema.safeParse(docSnap.data())
        if (parsed.success) {
          workouts.push(parsed.data)
        } else {
          console.warn(`Treino ${docSnap.id} inválido ignorado:`, parsed.error)
        }
      })

      return workouts
    } catch (err) {
      console.error('Erro ao buscar treinos no Firestore:', err)
      return []
    }
  }

  /**
   * Salva uma sessão finalizada no Firestore (imutável)
   */
  static async saveSession(userId: string, session: Session): Promise<boolean> {
    if (!db) return false
    try {
      const validated = SessionSchema.parse(session)
      const ref = doc(db, 'users', userId, 'sessions', session.id)
      await setDoc(ref, validated)
      return true
    } catch (err) {
      console.error(`Erro ao salvar sessão ${session.id} no Firestore:`, err)
      return false
    }
  }

  /**
   * Remove uma sessão do Firestore
   */
  static async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    if (!db) return false
    try {
      const ref = doc(db, 'users', userId, 'sessions', sessionId)
      await deleteDoc(ref)
      return true
    } catch (err) {
      console.error(`Erro ao remover sessão ${sessionId} no Firestore:`, err)
      return false
    }
  }

  /**
   * Busca todas as sessões do usuário no Firestore
   */
  static async fetchSessions(userId: string): Promise<Session[]> {
    if (!db) return []
    try {
      const colRef = collection(db, 'users', userId, 'sessions')
      const snapshot = await getDocs(colRef)
      const sessions: Session[] = []

      snapshot.forEach((docSnap) => {
        const parsed = SessionSchema.safeParse(docSnap.data())
        if (parsed.success) {
          sessions.push(parsed.data)
        } else {
          console.warn(`Sessão ${docSnap.id} inválida ignorada:`, parsed.error)
        }
      })

      return sessions
    } catch (err) {
      console.error('Erro ao buscar sessões no Firestore:', err)
      return []
    }
  }

  /**
   * Salva lote de treinos (usado no merge inicial após primeiro login)
   */
  static async batchSaveWorkouts(userId: string, workouts: Workout[]): Promise<boolean> {
    const firestore = db
    if (!firestore || workouts.length === 0) return true
    try {
      const batch = writeBatch(firestore)
      workouts.forEach((w) => {
        const validated = WorkoutSchema.parse(w)
        const ref = doc(firestore, 'users', userId, 'workouts', w.id)
        batch.set(ref, validated)
      })
      await batch.commit()
      return true
    } catch (err) {
      console.error('Erro ao salvar lote de treinos no Firestore:', err)
      return false
    }
  }

  /**
   * Salva lote de sessões (usado no merge inicial após primeiro login)
   */
  static async batchSaveSessions(userId: string, sessions: Session[]): Promise<boolean> {
    const firestore = db
    if (!firestore || sessions.length === 0) return true
    try {
      const batch = writeBatch(firestore)
      sessions.forEach((s) => {
        const validated = SessionSchema.parse(s)
        const ref = doc(firestore, 'users', userId, 'sessions', s.id)
        batch.set(ref, validated)
      })
      await batch.commit()
      return true
    } catch (err) {
      console.error('Erro ao salvar lote de sessões no Firestore:', err)
      return false
    }
  }
}

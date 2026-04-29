import type { Timestamp } from 'firebase/firestore'
import type { AptNum } from '../config/building'

export interface Resident {
  id?: string
  torre: number
  andar: number
  apt: AptNum
  nome: string
  whatsapp?: string
  tipo: 'proprietario' | 'inquilino'
  registeredAt?: Timestamp
}

export interface Complaint {
  id?: string
  torre: number
  andar: number
  apt: AptNum
  direction: 'cima' | 'baixo' | 'lado'
  intensity?: 1 | 2 | 3 | 4 | 5
  description?: string
  createdAt?: Timestamp
}

export interface Suspect {
  torre: number
  andar: number
  apt: string
  count: number
  score: number
  sources: Array<{
    reporter: string
    intensity?: number
    createdAt?: Timestamp
  }>
}

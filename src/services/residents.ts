import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Resident } from '../types'

const COL = 'residents'

export async function addResident(data: Omit<Resident, 'id' | 'registeredAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), { ...data, registeredAt: serverTimestamp() })
  return ref.id
}

export async function getResidents(): Promise<Resident[]> {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('torre'), orderBy('andar'), orderBy('apt'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident))
}

export async function updateResident(id: string, data: Omit<Resident, 'id' | 'registeredAt'>): Promise<void> {
  await updateDoc(doc(db, COL, id), data as Record<string, unknown>)
}

export async function deleteResident(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}

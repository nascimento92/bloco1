import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Complaint } from '../types'

const COL = 'complaints'

export async function addComplaint(data: Omit<Complaint, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function getComplaints(): Promise<Complaint[]> {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint))
}

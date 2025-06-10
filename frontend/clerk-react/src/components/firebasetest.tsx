import { useAuth } from '@clerk/clerk-react'
// @ts-ignore
import { auth, db } from '../lib/firebase'

import { signInWithCustomToken } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function FirebaseTest() {
  const { getToken, userId } = useAuth()

  const signIntoFirebase = async () => {
    const token = await getToken({ template: 'integration_firebase' })
    if (!token) {
      console.error('No token found')
      return
    }
    const userCred = await signInWithCustomToken(auth, token)
    console.log('Signed into Firebase:', userCred.user)
  }

  const getFirestoreData = async () => {
    const docRef = doc(db, 'example', 'example-document')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data())
    } else {
      console.log('No such document!')
    }
  }

  if (!userId) return <p>Please sign in to test Firebase.</p>

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <button onClick={signIntoFirebase}>Sign in to Firebase</button>
      <button onClick={getFirestoreData} style={{ marginLeft: '1rem' }}>
        Get Firestore Data
      </button>
    </div>
  )
}

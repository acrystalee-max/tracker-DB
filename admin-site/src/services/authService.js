import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'

export function signInWithEmail(email, password){
  return signInWithEmailAndPassword(auth, email, password)
}

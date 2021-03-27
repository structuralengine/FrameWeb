import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// import { auth } from '@angular/fire/auth';
import auth from "firebase";
import * as firebase from 'firebase/app';
// import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserInfoService } from '../providers/user-info.service';
// import { LoginJudgeService } from './login-judge.service';



interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  favoriteColor?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    public User: UserInfoService,
    // private judge:LoginJudgeService
  ) {

    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    );
  }

  login(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(user => {
        console.log(user);
        return this.updateUserData(user.user);
      })
  }

  googleLogin() {
    const provider = new auth.auth.GoogleAuthProvider()
    return  this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    // this.User.loggedIn = true;
    return this.afAuth.signInWithPopup(provider)
      .then((credential) => {
        // this.User.loggedIn = true;
        this.updateUserData(credential.user);
      }) 
      .catch(err => console.log(err));
  }


  private updateUserData(user) {
    // Sets user data to firestore on login

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }
    // this.User.loggedIn = true;
    return userRef.set(data, { merge: true });

  }


  signOut() {
    this.User.loggedIn = false;
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}

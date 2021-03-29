import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// import { auth } from '@angular/fire/auth';
import auth from "firebase";
import * as firebase from 'firebase/app';
// import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable } from 'rxjs/observable';
import { of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserInfoService } from '../providers/user-info.service';
// import { LoginJudgeService } from './login-judge.service';


export interface Shirt { name: string; price: number; }
// export interface ShirtId extends Shirt { id: string; }

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  favoriteColor?: string;
}

interface Item { name: string; }


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private shirtCollection: AngularFirestoreCollection<Shirt>;
  user: Observable<User>;
  private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  amount:number;
  currentUser:any;
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
        this.currentUser = user.user.uid;
        console.log("current",this.currentUser);
      this.afs.collection('customers').doc(this.currentUser).collection('subscriptions').valueChanges().subscribe(value =>{
          console.log("value",value);
          this.amount =  value[0].items[0].plan.amount;
          console.log('amount',this.amount);
        },error => {
          console.log("error",error);
        });
        console.log("user",user)
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

  public calc(amount){
    this.afs.collection('customers').doc(this.currentUser).collection('subscriptions').valueChanges().subscribe(value =>{
      console.log("value",value);
      value[0].items[0].plan.amount += amount;
      this.amount = value[0].items[0].plan.amount;
      console.log('amount',this.amount);
    },error => {
      console.log("error",error);
    });
  }


  signOut() {
    this.User.loggedIn = false;
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}

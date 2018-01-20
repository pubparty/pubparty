import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subscription } from 'rxjs/Subscription';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { AuthConfig } from '../configs/auth-config';
import { ToastProvider } from './toast';
import * as firebase from 'firebase';

@Injectable()
export class AuthProvider {
  private authSubscription: Subscription;

  constructor(private platform: Platform,
    private angularfireAuth: AngularFireAuth,
    private facebook: Facebook,
    private googlePlus: GooglePlus,
    private toast: ToastProvider) {
    console.log("Initializing Auth Provider");
  }

  public destroy(): void {
    this.authSubscription.unsubscribe();
  }

  public getUser(): Promise<any> {
    return new Promise((resolve) => {
      this.authSubscription = this.angularfireAuth.authState.subscribe((user: firebase.User) => {
        resolve(user);
      });
    });
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.googlePlus.logout();
      this.facebook.logout();
      this.angularfireAuth.auth.signOut().then(() => {
        this.destroy();
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  }

  public checkFacebookLogin(resolve, reject){
    firebase.auth().getRedirectResult().then((res) => {
      if(res.credential){
        resolve("login");
      }
    })
  }
  public loginWithFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {

      let provider = new firebase.auth.FacebookAuthProvider;
      firebase.auth().signInWithRedirect(provider)

      //** Below code is for using native Facebook */
      // if (this.platform.is('cordova')) {
      //   this.facebook.login(['public_profile', 'user_friends', 'email']).then((res: FacebookLoginResponse) => {
      //     let credential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
      //     this.angularfireAuth.auth.signInWithCredential(credential).then(res => {
      //       console.log("Facebook Login Success: " + JSON.stringify(res));
      //       resolve(res);
      //     }).catch((error: any) => {
      //       this.toast.showError(error.code);
      //       reject();
      //     });
      //   }).catch(error => {
      //     console.error("Facebook Login Error: " + JSON.stringify(error));
      //     reject(error);
      //   });
      // } else {
        // let error = "Cordova not found. Please deploy on actual device or simulator.";
        // console.error("Facebook Login Error: " + error);
        // reject(error);

      // }
    });
  }

  public loginWithGoogle(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        this.googlePlus.login({
          'webClientId': AuthConfig.googleWebClientId
        }).then(res => {
          let credential = firebase.auth.GoogleAuthProvider.credential(res.idToken, res.accessToken);
          this.angularfireAuth.auth.signInWithCredential(credential).then(res => {
            console.log("Google Login Success: " + JSON.stringify(res));
            resolve(res);
          }).catch((error: any) => {
            console.error("Google Login Error: " + JSON.stringify(error));
            this.toast.showError(error.code);
            reject();
          });
        }).catch(error => {
          console.error("Google Login Error: " + JSON.stringify(error));
          reject(error);
        });
      } else {
        let error = "Cordova not found. Please deploy on actual device or simulator.";
        console.error("Google Login Error: " + error);
        reject(error);
      }
    });
  }

  public loginWithEmail(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.angularfireAuth.auth.signInWithEmailAndPassword(email, password).then(res => {
        resolve(res);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public sendPasswordResetEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.angularfireAuth.auth.sendPasswordResetEmail(email).then(res => {
        resolve(res);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public createUserWithEmailAndPassword(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.angularfireAuth.auth.createUserWithEmailAndPassword(email, password).then(res => {
        resolve(res);
      }).catch(error => {
        reject(error);
      });
    });
  }
}

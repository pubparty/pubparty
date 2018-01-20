import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertProvider, AuthProvider, LoadingProvider, NetworkProvider, ToastProvider, TranslateProvider } from '../../providers';
import * as firebase from 'firebase';
import { ToastConfig } from '../../configs/toast-config';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-verification',
  templateUrl: 'verification.html',
})
export class VerificationPage {
  private user: firebase.User;
  private emailSent: boolean;
  private subscription: Subscription;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthProvider,
    private toast: ToastProvider,
    private network: NetworkProvider,
    private loading: LoadingProvider,
    private alert: AlertProvider,
    private translate: TranslateProvider) {
    this.subscription = this.network.subscription.subscribe((connected: boolean) => {
      //Check if verification email is not sent for the first time and resend it when the user goes online.
      //It might not be sent successfully when the view is loaded and an internet connection is not available.
      if (connected && !this.emailSent) {
        var self = this;
        setTimeout(function() {
          self.sendEmailVerification();
        }, 1000);
      }
    });
  }

  ionViewDidLoad() {
    this.sendEmailVerification();
    var self = this;
    //Create an interval every second to check if the user has already verified their email.
    let interval = window.setInterval(function() {
      if (self.user) {
        self.user.reload();
        //User already verified their email, proceed to CompleteProfilePage.
        if (self.user.emailVerified) {
          window.clearInterval(interval);
          self.subscription.unsubscribe();
          self.alert.showAlert(self.translate.get('EMAIL_VERIFIED'), self.translate.get('VERIFIED_MESSAGE'), self.translate.get('OK')).then(() => {
            if (self.user.providerData[0].providerId != 'twitter.com')
              self.navCtrl.setRoot('CompleteProfilePage');
            else
              self.navCtrl.setRoot('HomePage');
          });
        }
      }
    }, 1000);
  }

  //Send verification email to user authenticated on Firebase.
  private sendEmailVerification(): void {
    this.loading.show();
    this.auth.getUser().then((user: firebase.User) => {
      this.user = user;
      if (this.user) {
        this.user.sendEmailVerification().then(() => {
          this.emailSent = true;
          this.loading.hide();
          this.toast.showWithDuration(this.translate.get('VERIFICATION_SENT'), ToastConfig.duration);
        }).catch((error) => {
          this.loading.hide();
          this.toast.showWithDuration(this.translate.get('VERIFICATION_FAILED'), ToastConfig.duration);
        });
      }
    });
  }

}

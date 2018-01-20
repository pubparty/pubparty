import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider, LoadingProvider, TranslateProvider, ToastProvider } from '../../providers';
import { ToastConfig } from '../../configs/toast-config';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public auth: AuthProvider,
    public loading: LoadingProvider,
    public translate: TranslateProvider,
    public toast: ToastProvider) {
  }

  ionViewDidLoad() {
    new Promise((resolve, reject)=>{
      this.auth.checkFacebookLogin(resolve, reject);
    }).then(res => {
      this.loading.hide();
      this.navCtrl.setRoot('LoaderPage');
    })
    
  }


  private loginFacebook(): void {
    this.loading.show();
    this.auth.loginWithFacebook().then(res => {
      this.loading.hide();
      this.navCtrl.setRoot('LoaderPage');
    }).catch(err => {
      if (err)
        this.toast.showWithDuration(this.translate.get('LOGIN_FACEBOOK_ERROR'), ToastConfig.duration);
      this.loading.hide();
    });
  }

  private loginGoogle(): void {
    this.loading.show();
    this.auth.loginWithGoogle().then(res => {
      this.loading.hide();
      this.navCtrl.setRoot('LoaderPage');
    }).catch(err => {
      if (err)
        this.toast.showWithDuration(this.translate.get('LOGIN_GOOGLE_ERROR'), ToastConfig.duration);
      this.loading.hide();
    });
  }

}

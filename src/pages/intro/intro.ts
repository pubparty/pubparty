import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { AuthProvider, LoadingProvider, TranslateProvider, ToastProvider } from '../../providers';
import { ToastConfig } from '../../configs/toast-config';

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {
  @ViewChild(Slides) slides: Slides;
  private title: string;
  private subtitle: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthProvider,
    public loading: LoadingProvider,
    public translate: TranslateProvider,
    public toast: ToastProvider) {
  }
  ionViewDidLoad() {
    this.title = "PUBPARTY";
    new Promise((resolve, reject)=>{
      this.auth.checkFacebookLogin(resolve, reject);
    }).then(res => {
      this.loading.hide();
      this.navCtrl.setRoot('LoaderPage');
    })
    
  }


  slideChanged() {
    if (this.slides.getActiveIndex() == 1) {
      this.title = this.translate.get('DISCOVER');
    } else if (this.slides.getActiveIndex() == 2) {
      this.title = this.translate.get('JOIN_NOW');
    } else {
      this.title = "PUBPARTY";
    }
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

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController } from 'ionic-angular';
import { AuthProvider, LoadingProvider, DatabaseProvider, AlertProvider, TranslateProvider, EventsApi } from '../../providers';
import * as firebase from 'firebase';
import { User } from '../../models';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  private user: User;
  private subscription: Subscription;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private auth: AuthProvider,
    private loading: LoadingProvider,
    private database: DatabaseProvider,
    private alert: AlertProvider,
    private translate: TranslateProvider,
    private modalCtrl: ModalController,
    private eventsApi: EventsApi,
    private app: App) {
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      let userId = user.uid;
      this.subscription = this.database.getUserById(userId).subscribe((user: User) => {
        this.user = user;
      });
    });
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showUpdateProfile(): void {
    let modal = this.modalCtrl.create('UpdateProfilePage');
    modal.present();
  }

  private logout(): void {
    this.alert.showConfirm(this.translate.get('CONFIRM_LOGOUT'), this.translate.get('CONFIRM_LOGOUT_MESSAGE'), this.translate.get('CANCEL'), this.translate.get('LOGOUT')).then(confirm => {
      if (confirm) {
        this.loading.show();
        this.eventsApi.destroy().then(() => {
          this.auth.logout().then(() => {
            this.loading.hide();
            this.app.getRootNav().setRoot('LoginPage');
          });
        });
      }
    });
  }

}

import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthConfig } from '../../configs/auth-config';
import { AuthProvider, DatabaseProvider, EventsApi, UsersApi, NotificationMessageProvider } from '../../providers';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-loader',
  templateUrl: 'loader.html',
})
export class LoaderPage {
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    private auth: AuthProvider,
    private database: DatabaseProvider,
    private eventsApi: EventsApi,
    private usersApi: UsersApi,
    private zone: NgZone,
    private notification: NotificationMessageProvider) {
  }

  ionViewDidLoad() {
    this.storage.get('introShown').then(result => {
      if (!result) {
        this.storage.set('introShown', true);
        this.navCtrl.setRoot('IntroPage');
      } else {
        this.auth.getUser().then((user: firebase.User) => {
          if (user) {
            this.database.exists('users/' + user.uid).then(exists => {
              if (exists) {
                this.usersApi.init().then(() => {
                  this.eventsApi.init().then(() => {
                    this.notification.init();
                    this.zone.run(() => {
                      this.navCtrl.setRoot('TabsPage');
                    });
                  });
                });
              } else {
                this.navCtrl.setRoot('CompleteProfilePage');
              }
            });
          } else {
            this.navCtrl.setRoot('LoginPage');
          }
        });
      }
    });
  }
}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import { EventsApi, UsersApi, AuthProvider, DatabaseProvider } from '../../providers';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-party-requests',
  templateUrl: 'party-requests.html',
})
export class PartyRequestsPage {
  private user: User;
  private userSubscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public eventsApi: EventsApi, public usersApi: UsersApi, public auth: AuthProvider, public database: DatabaseProvider) {
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      let userId = user.uid;
      this.userSubscription = this.database.getUserById(userId).subscribe((user: User) => {
        this.user = user;
        if (!this.user.eventInvites && !this.user.eventRequests)
          this.back();
      });

      this.user = this.usersApi.getCurrentUser();
    });
  }

  private back(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.navCtrl.pop();
  }

  itemTrackBy(index: number, item) {
    return item.id;
  }

}

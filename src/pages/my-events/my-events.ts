import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { AuthProvider, DatabaseProvider, UsersApi, EventsApi } from '../../providers';
import { User, Event } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-my-events',
  templateUrl: 'my-events.html',
})
export class MyEventsPage {
  private user: User;
  private subscription: Subscription;
  private mode: number;
  private events: Event[];
  private eventsSubscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, private auth: AuthProvider, private database: DatabaseProvider, private usersApi: UsersApi, private eventsApi: EventsApi) {
  }

  ionViewDidLoad() {
    this.mode = 0;
    this.auth.getUser().then((user: firebase.User) => {
      let userId = user.uid;
      this.subscription = this.database.getUserById(userId).subscribe((user: User) => {
        this.user = user;
      });

      this.user = this.usersApi.getCurrentUser();

      //Subscribe to all events of the app.
      this.eventsSubscription = this.eventsApi.eventsSubscription.subscribe((events: Event[]) => {
        this.events = this.eventsApi.getEvents();
      });

      this.events = this.eventsApi.getEvents();
    });
  }

  itemTrackBy(index: number, item) {
    return item.id;
  }

  private showFavorites(): void {
    this.app.getRootNav().push('FavoritesPage');
  }

  private showRequests(): void {
    this.app.getRootNav().push('PartyRequestsPage');
  }

  private changeTab(): void {
    this.navCtrl.parent.select(0);
  }

}

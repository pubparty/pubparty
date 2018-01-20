import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DatabaseProvider, EventsApi } from '../../providers';
import * as firebase from 'firebase';
import { User, Event } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { SMS } from '@ionic-native/sms';

@IonicPage()
@Component({
  selector: 'page-view-profile',
  templateUrl: 'view-profile.html',
})
export class ViewProfilePage {
  private user: User;
  private subscription: Subscription;
  private eventsSubscription: Subscription;
  private events: Event[];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private eventsApi: EventsApi,
    private database: DatabaseProvider,
    private viewCtrl: ViewController,
    private photoViewer: PhotoViewer,
    private sms: SMS) {
  }

  ionViewDidLoad() {
    this.subscription = this.database.getUserById(this.navParams.get('userId')).subscribe((user: User) => {
      this.user = user;
    });

    this.eventsSubscription = this.eventsApi.eventsSubscription.subscribe((events: Event[]) => {
      this.events = this.eventsApi.getEvents();
    });

    this.events = this.eventsApi.getEvents();
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  // private back(): void {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }
  //   if (this.eventsSubscription) {
  //     this.eventsSubscription.unsubscribe();
  //   }
  //   this.navCtrl.pop();
  // }

  itemTrackBy(index: number, item) {
    return item.id;
  }

  private showEvent(eventId: string): void {
    this.viewCtrl.dismiss(eventId);
  }

  private contact(): void {
    this.sms.send(this.user.number, '');
  }

  private viewPhoto(url: string): void {
    if (url != 'assets/images/profile.png') {
      this.photoViewer.show(url);
    }
  }

  private viewEvent(eventId: string): void {
    this.viewCtrl.dismiss(eventId);
  }
}

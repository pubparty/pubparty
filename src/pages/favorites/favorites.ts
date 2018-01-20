import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { EventsApi } from '../../providers';
import { Event } from '../../models';

@IonicPage()
@Component({
  selector: 'page-favorites',
  templateUrl: 'favorites.html',
})
export class FavoritesPage {
  private eventsSubscription: Subscription;
  private events: Event[];
  constructor(public navCtrl: NavController, public navParams: NavParams, private eventsApi: EventsApi) {
  }

  ionViewDidLoad() {
    //Subscribe to all events of the app.
    this.eventsSubscription = this.eventsApi.eventsSubscription.subscribe((events: Event[]) => {
      this.events = this.eventsApi.getEvents();
    });

    this.events = this.eventsApi.getEvents();
  }

  itemTrackBy(index: number, item) {
    return item.id;
  }

  private back(): void {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
    this.navCtrl.pop();
  }
}

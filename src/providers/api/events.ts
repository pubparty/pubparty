import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Event } from '../../models';
import { DatabaseProvider, NetworkProvider, UsersApi, NotificationProvider } from '../../providers';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';
import { HostedEventsPipe } from '../../pipes/hosted-events';

@Injectable()
export class EventsApi {
  private loaded: boolean;
  private events: Event[];
  private eventsIndexMap: Map<string, number>;

  private subscriptionMap: Map<string, Subscription>;
  public subscriptions: Map<string, Subject<Event>>;

  private subscription: Subscription;
  private networkSubscription: Subscription;

  public eventsSubscription: Subject<Event[]> = new Subject<Event[]>();

  constructor(private database: DatabaseProvider, private network: NetworkProvider, private usersApi: UsersApi, private notification: NotificationProvider) {
    console.log("Initializing EventsApi");
    this.networkSubscription = this.network.subscription.subscribe((connected: boolean) => {
      if (connected && !this.loaded) {
        var self = this;
        setTimeout(function() {
          self.init();
        }, 1000);
      }
    });

    this.eventsSubscription = new Subject<Event[]>();
    this.eventsIndexMap = new Map<string, number>();

    this.subscriptionMap = new Map<string, Subscription>();
    this.subscriptions = new Map<string, Subject<Event>>();
  }

  public destroy(): Promise<any> {
    return new Promise(resolve => {
      this.subscriptionMap.forEach((value: Subscription, key: string) => {
        if (value) {
          value.unsubscribe();
        }
      });
      this.subscriptionMap = new Map<string, Subscription>();
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      resolve();
    });
  }

  public init(): Promise<any> {
    return new Promise(resolve => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      //Subscribe to all events.
      this.subscription = this.database.getEvents().subscribe((events: Event[]) => {
        //Update the events.
        this.events = JSON.parse(JSON.stringify(events));
        this.eventsSubscription.next(this.events); //Publish that the events of the app has been updated.

        //Populate our eventsIndexMap and subscriptions based on the events.
        for (let i = 0; i < this.events.length; i++) {
          let eventId = this.events[i].eventId;
          this.eventsIndexMap.set(eventId, i);

          if (!this.subscriptionMap.get(eventId)) {
            this.subscriptions.set(eventId, new Subject<Event>());
            let subscription = this.database.getEventById(eventId).subscribe((event: Event) => {
              this.subscriptions.get(eventId).next(event);
            });
            this.subscriptionMap.set(eventId, subscription);
          }
        }
        this.loaded = true;
        let hosted = new HostedEventsPipe(this.usersApi).transform(this.events, [-1, '']);
        let unread = 0;
        for (let i = 0; i < hosted.length; i++) {
          if (hosted[i].userRequests) {
            unread += hosted[i].userRequests.length;
          }
        }
        this.notification.setUnread(unread);
        resolve();
      });
    });
  }

  public getEvent(eventId: string): Event {
    if (this.loaded)
      return this.events[this.eventsIndexMap.get(eventId)];
    else
      return null;
  }

  public getEvents(): Event[] {
    if (this.loaded)
      return JSON.parse(JSON.stringify(this.events));
    else
      return null;
  }
}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Event, User } from '../../models';
import { UsersApi, EventsApi, AuthProvider, DatabaseProvider, ToastProvider, AlertProvider, NotificationProvider } from '../../providers';
import { Subscription } from 'rxjs/Subscription';
import { ToastConfig } from '../../configs/toast-config';

declare var google;

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {
  private event: Event;
  private eventId: string;
  private user: User;
  private eventsSubscription: Subscription;
  private eventSubscription: Subscription;
  private userSubscription: Subscription;
  private isHost: boolean;
  private isGoing: boolean;
  private isInvited: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private usersApi: UsersApi,
    private auth: AuthProvider, private database: DatabaseProvider, private eventsApi: EventsApi, private toast: ToastProvider, private modalCtrl: ModalController, private alert: AlertProvider, private notification: NotificationProvider) {
  }

  ionViewDidLoad() {
    this.eventId = this.navParams.get('eventId');
    this.auth.getUser().then((user: firebase.User) => {
      let userId = user.uid;
      this.userSubscription = this.database.getUserById(userId).subscribe((user: User) => {
        this.user = user;
        this.setState();
      });

      this.user = this.usersApi.getCurrentUser();

      //Subscribe to event.
      this.eventSubscription = this.eventsApi.subscriptions.get(this.eventId).subscribe((event: Event) => {
        let self = this;
        setTimeout(() => {
          self.event = this.eventsApi.getEvent(this.eventId);
          self.setState();
        }, 0);
      });

      this.event = this.eventsApi.getEvent(this.eventId);

      this.setState();
    });
  }

  private back(): void {
    if (this.eventsSubscription)
      this.eventsSubscription.unsubscribe();
    if (this.eventSubscription)
      this.eventSubscription.unsubscribe();
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    this.navCtrl.pop();
  }

  private setState(): void {
    if (this.event && this.user) {
      if (this.event.participants[0] == this.user.userId) {
        //User is host of the event.
        this.isHost = true;
      } else {
        if (this.event.participants.indexOf(this.user.userId) > 0) {
          //User is attending the event.
          this.isGoing = true;
        } else {
          this.isHost = false;
          this.isGoing = false;
        }
      }
      this.isInvited = false;
      if (this.user.eventInvites) {
        if (this.user.eventInvites.indexOf(this.eventId) > -1) {
          this.isInvited = true;
        }
      }
    }
  }

  private getLocationImage(): string {
    if (this.event) {
      return 'https://maps.googleapis.com/maps/api/staticmap?center=' + this.event.location.lat + ',' + this.event.location.lng + '&zoom=17&size=400x400&markers=' + this.event.location.lat + ',' + this.event.location.lng + '&key=AIzaSyBVqbZ2Mh5xyYyj_mXPWCd9v4xFgkhvlTw';
    } else {
      return '';
    }
  }

  private updateEvent(): void {
    this.navCtrl.push('UpdateEventPage', { event: this.event });
  }

  private manageRequests(): void {
    this.navCtrl.push('ViewRequestsPage', { eventId: this.event.eventId });
  }

  private removeFromFavorites(eventId: string): void {
    let userId = this.usersApi.getCurrentUser().userId;
    this.database.getUserById(userId).take(1).subscribe((user: User) => {
      let favorites = user.favorites;
      favorites.splice(favorites.indexOf(eventId), 1);
      this.database.getUserById(userId).update({
        favorites: favorites
      }).then(() => {
        this.toast.showWithDuration('Event removed from favorites.', ToastConfig.duration);
      });
    });
  }

  private addToFavorites(eventId: string): void {
    let userId = this.usersApi.getCurrentUser().userId;
    this.database.getUserById(userId).take(1).subscribe((user: User) => {
      let favorites = user.favorites;
      if (!favorites) {
        favorites = [];
      }
      favorites.push(eventId);
      this.database.getUserById(userId).update({
        favorites: favorites
      }).then(() => {
        this.toast.showWithDuration('Event added to favorites.', ToastConfig.duration);
      });
    });
  }

  private viewProfile(userId: string): void {
    if (userId != this.usersApi.getCurrentUser().userId) {
      let modal = this.modalCtrl.create('ViewProfilePage', { userId: userId });
      modal.present();
      modal.onDidDismiss((eventId: string) => {
        if (eventId) {
          this.navCtrl.push('EventPage', { eventId: eventId });
        }
      });
    }
  }

  private sendRequest(): void {
    this.alert.showConfirm('Request to Join?', 'Do you want to request to join <b>' + this.event.title + '</b>?', 'Cancel', 'Yes').then(confirm => {
      if (confirm) {
        this.database.sendJoinRequest(this.event.eventId, this.user.userId).then(() => {
          this.toast.showWithDuration('You have requested to join ' + this.event.title + '.', ToastConfig.duration);
          this.notification.sendPushNotification(this.usersApi.getUser(this.event.hostId), this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, 'requestes to join ' + this.event.title, { eventId: this.event.eventId });
        });
      }
    });
  }

  private cancelRequest(): void {
    this.alert.showConfirm('Cancel Request?', 'Do you want to cancel your request to join <b>' + this.event.title + '</b>?', 'Cancel', 'Yes').then(confirm => {
      if (confirm) {
        this.database.cancelJoinRequest(this.event.eventId, this.user.userId).then(() => {
          this.toast.showWithDuration('You have cancelled your request to join ' + this.event.title + '.', ToastConfig.duration);
        });
      }
    });
  }

  private acceptRequest(): void {
    this.alert.showConfirm('Accept Request?', 'Do you want to accept your invitation to join <b>' + this.event.title + '</b>?', 'Cancel', 'Accept').then(confirm => {
      if (confirm) {
        this.database.acceptInvite(this.event.eventId, this.user.userId).then(() => {
          this.toast.showWithDuration('You are going to ' + this.event.title + '.', ToastConfig.duration);
          this.notification.sendPushNotification(this.usersApi.getUser(this.event.hostId), this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, 'has joined ' + this.event.title, { eventId: this.event.eventId });
        });
      }
    });
  }

  private rejectRequest(): void {
    this.alert.showConfirm('Reject Request?', 'Do you want to reject your invitation to join <b>' + this.event.title + '</b>?', 'Cancel', 'Reject').then(confirm => {
      if (confirm) {
        this.database.cancelInvite(this.event.eventId, this.user.userId).then(() => {
          this.toast.showWithDuration('You rejected your invite to join ' + this.event.title + '.', ToastConfig.duration);
        });
      }
    });
  }
}

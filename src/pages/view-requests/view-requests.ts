import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Event } from '../../models';
import { EventsApi, UsersApi, AlertProvider, DatabaseProvider, ToastProvider, NotificationProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-view-requests',
  templateUrl: 'view-requests.html',
})
export class ViewRequestsPage {
  private event: Event;
  private eventId: string;
  private eventSubscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, private eventsApi: EventsApi, private usersApi: UsersApi,
    private modalCtrl: ModalController, public alert: AlertProvider, public database: DatabaseProvider, public toast: ToastProvider, private notification: NotificationProvider) {
  }

  ionViewDidLoad() {
    this.eventId = this.navParams.get('eventId');
    this.eventSubscription = this.eventsApi.subscriptions.get(this.eventId).subscribe((event: Event) => {
      let self = this;
      setTimeout(() => {
        self.event = this.eventsApi.getEvent(this.eventId);
      }, 0);
    });

    this.event = this.eventsApi.getEvent(this.eventId);
  }

  private invite(): void {
    this.navCtrl.push('InvitePeoplePage', { eventId: this.eventId });
  }

  private back(): void {
    if (this.eventSubscription)
      this.eventSubscription.unsubscribe();
    this.navCtrl.pop();
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

  private acceptRequest(userId: string): void {
    this.alert.showConfirm('Accept User',
      'Are you sure you want to accept this user to the event?',
      'Cancel',
      'Accept').then(confirm => {
        if (confirm) {
          this.database.acceptRequest(this.eventId, userId).then(() => {
            this.toast.showWithDuration('User has been accepted to the event.', 3000);
            this.notification.sendPushNotification(this.usersApi.getUser(userId), this.usersApi.getUser(this.event.hostId).firstName + ' ' + this.usersApi.getUser(this.event.hostId).lastName, 'has accepted your request to join ' + this.event.title, { eventId: this.eventId });
          });
        }
      });
  }

  private rejectRequest(userId: string): void {
    this.alert.showConfirm('Reject User',
      'Are you sure you want to reject this user from the event?',
      'Cancel',
      'Reject').then(confirm => {
        if (confirm) {
          this.database.cancelJoinRequest(this.eventId, userId).then(() => {
            this.toast.showWithDuration('User has been rejected to join the event.', 3000);
            this.notification.sendPushNotification(this.usersApi.getUser(userId), this.usersApi.getUser(this.event.hostId).firstName + ' ' + this.usersApi.getUser(this.event.hostId).lastName, 'has rejected your request to join ' + this.event.title, { eventId: this.eventId });
          });
        }
      });
  }

  private cancelRequest(userId: string): void {
    this.alert.showConfirm('Cancel Invitation',
      'Are you sure you want to cancel your invitation for this user to the event?',
      'Cancel',
      'Yes').then(confirm => {
        if (confirm) {
          this.database.cancelInvite(this.eventId, userId).then(() => {
            this.toast.showWithDuration('User\'s invitation to this event has been cancelled.', 3000);
          });
        }
      });
  }
}

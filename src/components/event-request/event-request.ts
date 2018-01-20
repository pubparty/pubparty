import { Component, Input } from '@angular/core';
import { UsersApi, DatabaseProvider, ToastProvider, AlertProvider, NotificationProvider } from '../../providers';
import { Event, User } from '../../models';
import { NavController, App, Modal, ModalController } from 'ionic-angular';
import { ToastConfig } from '../../configs/toast-config';

@Component({
  selector: 'event-request',
  templateUrl: 'event-request.html'
})
export class EventRequestComponent {
  @Input('data') event: Event;
  private modal: Modal;
  constructor(private usersApi: UsersApi, private navCtrl: NavController, private app: App, private modalCtrl: ModalController, private database: DatabaseProvider,
    private toast: ToastProvider, private alert: AlertProvider, private notification: NotificationProvider) {
  }

  private isInvited(): boolean {
    if (this.event.userInvites && this.event.userInvites.indexOf(this.usersApi.getCurrentUser().userId) > -1) {
      return true;
    }
    return false;
  }

  private isPending(): boolean {
    if (this.event.userRequests && this.event.userRequests.indexOf(this.usersApi.getCurrentUser().userId) > -1) {
      return true;
    }
    return false;
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
          this.app.getRootNav().push('EventPage', { eventId: eventId });
        }
      });
    }
  }

  private cancelRequest(): void {
    this.alert.showConfirm('Cancel Request?', 'Do you want to cancel your request to join <b>' + this.event.title + '</b>?', 'Cancel', 'Yes').then(confirm => {
      if (confirm) {
        this.database.cancelJoinRequest(this.event.eventId, this.usersApi.getCurrentUser().userId).then(() => {
          this.toast.showWithDuration('You have cancelled your request to join ' + this.event.title + '.', ToastConfig.duration);
        });
      }
    });
  }

  private acceptRequest(): void {
    this.alert.showConfirm('Accept Request?', 'Do you want to accept your invitation to join <b>' + this.event.title + '</b>?', 'Cancel', 'Accept').then(confirm => {
      if (confirm) {
        this.database.acceptInvite(this.event.eventId, this.usersApi.getCurrentUser().userId).then(() => {
          this.toast.showWithDuration('You are going to ' + this.event.title + '.', ToastConfig.duration);
          this.notification.sendPushNotification(this.usersApi.getUser(this.event.hostId), this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, 'has joined ' + this.event.title, { eventId: this.event.eventId });
        });
      }
    });
  }

  private rejectRequest(): void {
    this.alert.showConfirm('Reject Request?', 'Do you want to reject your invitation to join <b>' + this.event.title + '</b>?', 'Cancel', 'Reject').then(confirm => {
      if (confirm) {
        this.database.cancelInvite(this.event.eventId, this.usersApi.getCurrentUser().userId).then(() => {
          this.toast.showWithDuration('You rejected your invite to join ' + this.event.title + '.', ToastConfig.duration);
        });
      }
    });
  }
}

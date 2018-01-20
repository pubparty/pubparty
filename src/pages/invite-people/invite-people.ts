import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { User, Event } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import { UsersApi, EventsApi, AlertProvider, DatabaseProvider, ToastProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-invite-people',
  templateUrl: 'invite-people.html',
})
export class InvitePeoplePage {
  private searchUser: string;
  private users: User[];
  private usersSubscription: Subscription;
  private excludedIds: string[];
  private eventId: string;
  private eventSubscription: Subscription;
  private event: Event;

  constructor(public navCtrl: NavController, public navParams: NavParams, public usersApi: UsersApi, public eventsApi: EventsApi, public modalCtrl: ModalController, public alert: AlertProvider, public database: DatabaseProvider, public toast: ToastProvider) {
  }

  ionViewDidLoad() {
    this.eventId = this.navParams.get('eventId');
    this.usersSubscription = this.usersApi.usersSubscription.subscribe((users: User[]) => {
      this.users = users;
    });

    this.eventSubscription = this.eventsApi.subscriptions.get(this.eventId).subscribe((event: Event) => {
      let self = this;
      setTimeout(() => {
        self.event = this.eventsApi.getEvent(this.eventId);
        self.excludedIds = self.event.participants;
      }, 0);
    });

    this.users = this.usersApi.getUsers();
    this.event = this.eventsApi.getEvent(this.eventId);
    this.excludedIds = this.event.participants;
  }

  private back(): void {
    if (this.usersSubscription)
      this.usersSubscription.unsubscribe();
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
          });
        }
      });
  }

  private sendRequest(userId: string): void {
    this.alert.showConfirm('Invite User',
      'Are you sure you want to invite this user to the event?',
      'Cancel',
      'Invite').then(confirm => {
        if (confirm) {
          this.database.inviteUser(this.eventId, userId).then(() => {
            this.toast.showWithDuration('User has been invited to join the event.', 3000);
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

  private getStatus(userId: string): number {
    if (this.event.userRequests && this.event.userRequests.indexOf(userId) > -1) {
      return 0;
    } else if (this.event.userInvites && this.event.userInvites.indexOf(userId) > -1) {
      return 2;
    } else if (this.event.participants && this.event.participants.indexOf(userId) == -1) {
      return 1;
    }
  }
}

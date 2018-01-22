import { Component } from '@angular/core';
import { IonicPage, ViewController, ModalController, App } from 'ionic-angular';
import { AlertProvider, UsersApi, DatabaseMessageProvider, NetworkProvider, ToastProvider, TranslateProvider, NotificationProvider } from '../../providers';
import { User } from '../../models';
import { ToastConfig } from '../../configs/toast-config';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-contact-requests',
  templateUrl: 'contact-requests.html'
})
export class ContactRequestsPage {
  private user: User;
  private received: User[];
  private sent: User[];
  private subscription: Subscription;

  constructor(public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private alert: AlertProvider,
    private usersApi: UsersApi,
    private database: DatabaseMessageProvider,
    private network: NetworkProvider,
    private toast: ToastProvider,
    private translate: TranslateProvider,
    private notification: NotificationProvider,
    private app: App) {
  }

  ionViewDidLoad() {
    //Subscribe to changes to all users.
    this.subscription = this.usersApi.usersSubscription.subscribe((users: User[]) => {
      //Refresh user's requests.
      this.user = this.usersApi.getCurrentUser();
      this.setRequests();
    });

    this.user = this.usersApi.getCurrentUser();
    this.setRequests();
  }

  //Unsubscribe to subscription.
  private back(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
    this.viewCtrl.dismiss();
  }

  //Set user's requests sent or received.
  private setRequests(): void {
    let self = this;
    setTimeout(function() {
      if (self.user) {
        self.sent = [];
        self.received = [];
        if (self.user.requestsSent) {
          for (let i = 0; i < self.user.requestsSent.length; i++) {
            self.sent.push(self.usersApi.getUser(self.user.requestsSent[i]));
          }
        }
        if (self.user.requestsReceived) {
          for (let i = 0; i < self.user.requestsReceived.length; i++) {
            self.received.push(self.usersApi.getUser(self.user.requestsReceived[i]));
          }
        }
        //If there are no requests remaining, automatically close this view.
        if (!self.user.requestsSent && !self.user.requestsReceived) {
          self.back();
        }
      }
    }, 0);
  }

  //Accept a contact request.
  private acceptRequest(user: User): void {
    this.alert.showConfirm('<b>' + user.firstName + ' ' + user.lastName + '</b>',
      this.translate.get('ACCEPT_REQUEST_QUESTION'),
      this.translate.get('CANCEL'),
      this.translate.get('ACCEPT')).then(confirm => {
        if (confirm) {
          this.database.addContact(user.userId, this.user.userId).then(() => {
            this.database.cancelRequest(user.userId, this.user.userId).then(() => {
              //Send a push notification that a user has accepted their request.
              this.notification.sendPushNotification(user, this.user.firstName + ' ' + this.user.lastName, this.translate.get('PUSH_CONTACT_ACCEPTED'), { accepted: this.user });
              this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('ACCEPTED_REQUEST'), ToastConfig.duration);
            });
          });
        }
      });
  }

  //Reject a contact request.
  private rejectRequest(user: User): void {
    this.alert.showConfirm('<b>' + user.firstName + ' ' + user.lastName + '</b>',
      this.translate.get('REJECT_REQUEST_QUESTION'),
      this.translate.get('CANCEL'),
      this.translate.get('REJECT')).then(confirm => {
        if (confirm) {
          this.database.cancelRequest(user.userId, this.user.userId).then(() => {
            this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('REJECTED_REQUEST'), ToastConfig.duration);
          });
        }
      });
  }

  //Cancel a contact request.
  private cancelRequest(user: User): void {
    this.alert.showConfirm('<b>' + user.firstName + ' ' + user.lastName + '</b>',
      this.translate.get('CANCEL_REQUEST_QUESTION'),
      this.translate.get('CANCEL'),
      this.translate.get('OK')).then(confirm => {
        if (confirm) {
          this.database.cancelRequest(this.user.userId, user.userId).then(() => {
            this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('CANCELLED_REQUEST'), ToastConfig.duration);
          });
        }
      });
  }

  //View profile.
  private viewProfile(user: User): void {
    let modal = this.modalCtrl.create('ViewProfilePage', { userId: user.userId });
    modal.present();
    modal.onDidDismiss((userId: string) => {
      //The user chose to send message to the user profile that they are viewing on ViewProfilePage.
      if (userId) {
        this.back();
        if (this.user.conversations && this.user.conversations[userId]) {
          this.app.getRootNav().push('ChatPage', { conversationId: this.user.conversations[userId].conversationId, members: [this.user.userId, userId] });
        } else {
          this.app.getRootNav().push('ChatPage', { members: [this.user.userId, userId] });
        }
      }
    });
  }

}

import { Component } from '@angular/core';
import { Platform, IonicPage, ViewController, ModalController, App } from 'ionic-angular';
import { AuthProvider, AlertProvider, UsersApi, DatabaseMessageProvider, NetworkProvider, ToastProvider, TranslateProvider, NotificationProvider } from '../../providers';
import { User } from '../../models';
import { ToastConfig } from '../../configs/toast-config';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-search-user',
  templateUrl: 'search-user.html'
})
export class SearchUserPage {
  private users: User[];
  private user: User;
  private searchUser: string;
  private excludedIds: string[];
  private usersSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private platform: Platform,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public auth: AuthProvider,
    public alert: AlertProvider,
    public usersApi: UsersApi,
    public database: DatabaseMessageProvider,
    public network: NetworkProvider,
    public toast: ToastProvider,
    private notification: NotificationProvider,
    public translate: TranslateProvider,
    private app: App) {
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      //Subscribe to all users of the app.
      this.usersSubscription = this.usersApi.usersSubscription.subscribe((users: User[]) => {
        this.users = users;
      });

      //Subscribe to current user.
      this.userSubscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
        this.user = user;
        this.setExcludedIds();
      });

      //Initialize.
      this.users = this.usersApi.getUsers();
      this.user = this.usersApi.getCurrentUser();
      this.setExcludedIds();
    });
  }

  //Unsubscribe to subscription and close this view.
  private back(): void {
    if (this.usersSubscription)
      this.usersSubscription.unsubscribe();
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    this.viewCtrl.dismiss();
  }

  //Set excludedIds, so user their contacts will not show up on the list.
  private setExcludedIds(): void {
    let self = this;
    setTimeout(function() {
      if (self.user) {
        self.excludedIds = [self.user.userId];
        if (self.user.contacts) {
          for (let i = 0; i < self.user.contacts.length; i++) {
            if (self.excludedIds.indexOf(self.user.contacts[i]) == -1) {
              self.excludedIds.push(self.user.contacts[i]);
            }
          }
        }
      }
    }, 0);
  }

  private getStatus(userId: string): number {
    //0 user can be added as contact.
    //1 user's contact request is pending.
    //2 user has sent a contact request.
    if (this.user.requestsSent) {
      if (this.user.requestsSent.indexOf(userId) > -1) {
        return 1;
      }
    }
    if (this.user.requestsReceived) {
      if (this.user.requestsReceived.indexOf(userId) > -1) {
        return 2;
      }
    }
    return 0;
  }

  //Send request.
  private sendRequest(user: User): void {
    this.alert.showConfirm('<b>' + user.firstName + ' ' + user.lastName + '</b>',
      this.translate.get('SEND_REQUEST_QUESTION'),
      this.translate.get('CANCEL'),
      this.translate.get('SEND')).then(confirm => {
        if (confirm) {
          this.database.sendRequest(this.user.userId, user.userId).then(() => {
            //Send a push notification to the receiver of the request.
            this.notification.sendPushNotification(user, this.user.firstName + ' ' + this.user.lastName, this.translate.get('PUSH_CONTACT_REQUEST'), { requested: this.user });
            this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('SENT_REQUEST'), ToastConfig.duration);
          });
        }
      });
  }

  //Accept request.
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

  //Reject request.
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

  //Cancel request.
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

import { Component } from '@angular/core';
import { IonicPage, ViewController, ModalController, NavParams, App } from 'ionic-angular';
import { UsersApi, GroupsApi, NetworkProvider, AlertProvider, TranslateProvider, DatabaseMessageProvider, ToastProvider, NotificationProvider } from '../../providers';
import { User, Group } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import { ToastConfig } from '../../configs/toast-config';

@IonicPage()
@Component({
  selector: 'page-view-members',
  templateUrl: 'view-members.html',
})
export class ViewMembersPage {
  private currentUser: User;
  private group: Group;
  private userSubscription: Subscription;
  private groupSubscription: Subscription;
  private searchUser: string;
  private users: User[];

  constructor(private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private usersApi: UsersApi,
    private groupsApi: GroupsApi,
    private network: NetworkProvider,
    private navParams: NavParams,
    private alert: AlertProvider,
    private translate: TranslateProvider,
    private database: DatabaseMessageProvider,
    private toast: ToastProvider,
    private notification: NotificationProvider,
    private app: App) {
  }

  ionViewDidLoad() {
    //Subscribe to user.
    this.userSubscription = this.usersApi.subscriptions.get(this.navParams.get('userId')).subscribe((user: User) => {
      this.currentUser = user;
    });

    //Subscribe to group.
    this.groupSubscription = this.groupsApi.subscriptions.get(this.navParams.get('groupId')).subscribe((group: Group) => {
      this.group = group;
      this.setMembers();
    });

    //Initialize.
    this.currentUser = this.usersApi.getUser(this.navParams.get('userId'));
    this.group = this.groupsApi.getGroup(this.navParams.get('groupId'));
    this.setMembers();
  }

  //Unsubscribe to subscription and close the view.
  private back(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    if (this.groupSubscription)
      this.groupSubscription.unsubscribe();
    this.viewCtrl.dismiss();
  }

  //Set the members to show.
  private setMembers(): void {
    let self = this;
    setTimeout(function() {
      if (self.group) {
        self.users = [];
        if (self.group.members) {
          for (let i = 0; i < self.group.members.length; i++) {
            self.users.push(self.usersApi.getUser(self.group.members[i]));
          }
        }
      }
    }, 0);
  }

  private getStatus(userId: string): number {
    //-1 user is friend or is the current user.
    //0 user can be added as contact.
    //1 user's contact request is pending.
    //2 user has sent a contact request.
    if (this.currentUser.requestsSent) {
      if (this.currentUser.requestsSent.indexOf(userId) > -1) {
        return 1;
      }
    }
    if (this.currentUser.requestsReceived) {
      if (this.currentUser.requestsReceived.indexOf(userId) > -1) {
        return 2;
      }
    }
    if (this.currentUser.contacts) {
      if (this.currentUser.contacts.indexOf(userId) > -1 || this.currentUser.userId == userId) {
        return -1;
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
          this.database.sendRequest(this.currentUser.userId, user.userId).then(() => {
            this.notification.sendPushNotification(user, this.currentUser.firstName + ' ' + this.currentUser.lastName, this.translate.get('PUSH_CONTACT_REQUEST'), { requested: this.currentUser });
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
          this.database.addContact(user.userId, this.currentUser.userId).then(() => {
            this.database.cancelRequest(user.userId, this.currentUser.userId).then(() => {
              //Send a push notification that a user has accepted their request.
              this.notification.sendPushNotification(user, this.currentUser.firstName + ' ' + this.currentUser.lastName, this.translate.get('PUSH_CONTACT_ACCEPTED'), { accepted: this.currentUser });
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
          this.database.cancelRequest(user.userId, this.currentUser.userId).then(() => {
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
          this.database.cancelRequest(this.currentUser.userId, user.userId).then(() => {
            this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('CANCELLED_REQUEST'), ToastConfig.duration);
          });
        }
      });
  }

  //View profile.
  private viewProfile(user: User): void {
    if (this.currentUser.userId != user.userId) {
      let modal = this.modalCtrl.create('ViewProfilePage', { userId: user.userId });
      modal.present();
      modal.onDidDismiss((userId: string) => {
        if (userId) {
          //Pass down data to view-group.ts viewAll modal.onDidDismiss.
          this.viewCtrl.dismiss(userId);
        }
      });
    }

  }
}

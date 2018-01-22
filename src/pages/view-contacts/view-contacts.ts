import { Component } from '@angular/core';
import { IonicPage, ViewController, ModalController, NavParams, App } from 'ionic-angular';
import { UsersApi, NetworkProvider, AlertProvider, TranslateProvider, DatabaseProvider, ToastProvider } from '../../providers';
import { User } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import { ToastConfig } from '../../configs/toast-config';

@IonicPage()
@Component({
  selector: 'page-view-contacts',
  templateUrl: 'view-contacts.html',
})
export class ViewContactsPage {
  private currentUser: User;
  private otherUser: User;
  // private group: Group;
  private userSubscription: Subscription;
  private otherUserSubscription: Subscription;
  private searchUser: string;
  private users: User[];

  constructor(private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private usersApi: UsersApi,
    private network: NetworkProvider,
    private navParams: NavParams,
    private alert: AlertProvider,
    private translate: TranslateProvider,
    private database: DatabaseProvider,
    private toast: ToastProvider,
    private app: App) {
  }

  ionViewDidLoad() {
    //Subscribe to user.
    this.userSubscription = this.usersApi.subscriptions.get(this.navParams.get('currentUserId')).subscribe((user: User) => {
      this.currentUser = user;
    });

    //Subscribe to partner.
    this.otherUserSubscription = this.usersApi.subscriptions.get(this.navParams.get('userId')).subscribe((user: User) => {
      this.otherUser = user;
      this.setContacts();
    });

    //Initialize.
    this.currentUser = this.usersApi.getUser(this.navParams.get('currentUserId'));
    this.otherUser = this.usersApi.getUser(this.navParams.get('userId'));
    this.setContacts();
  }

  private back(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    if (this.otherUserSubscription)
      this.otherUserSubscription.unsubscribe();
    this.viewCtrl.dismiss();
  }

  //Show contacts of the otherUser.
  private setContacts(): void {
    let self = this;
    setTimeout(function() {
      if (self.otherUser) {
        self.users = [];
        if (self.otherUser.contacts) {
          for (let i = 0; i < self.otherUser.contacts.length; i++) {
            self.users.push(self.usersApi.getUser(self.otherUser.contacts[i]));
          }
        }
      }
    }, 0);
  }

  //View profile of contact.
  private viewProfile(user: User): void {
    if (this.currentUser.userId != user.userId) {
      //Dismiss and set userId on modal.onDidDismiss at view-profile.ts.
      this.viewCtrl.dismiss(user.userId);
    }
  }
}

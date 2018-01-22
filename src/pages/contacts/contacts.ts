import { Component } from '@angular/core';
import { IonicPage, ModalController, App } from 'ionic-angular';
import { UsersApi, NetworkProvider, AuthProvider } from '../../providers';
import { User } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html',
})
export class ContactsPage {
  private user: User;
  private searchUser: string;
  private contacts: User[];
  private subscriptions: Map<string, Subscription>;

  constructor(private app: App,
    private modalCtrl: ModalController,
    private usersApi: UsersApi,
    private network: NetworkProvider,
    private auth: AuthProvider) {
    this.subscriptions = new Map<string, Subscription>();
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      //Subscribe to user.
      if (!this.subscriptions.get(user.uid)) {
        let subscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
          //Set and subscribe to user's contacts.
          this.user = user;
          this.setContacts();
          this.subscribeToContacts();
          console.log(this.user.contacts, "contacts")
        });

        this.subscriptions.set(user.uid, subscription);
      }

      //Initialize.
      this.user = this.usersApi.getCurrentUser();
      this.setContacts();
      this.subscribeToContacts();
    });

    // console.log(this.user.contacts, "contacts")

  }

  ionViewWillUnload() {
    //Clear subscriptions when the user logged out.
    this.subscriptions.forEach((value: Subscription, key: string) => {
      value.unsubscribe();
    });
  }

  private showRequests(): void {
    let modal = this.modalCtrl.create('ContactRequestsPage');
    modal.present();
  }

  private showAddContact(): void {
    let modal = this.modalCtrl.create('SearchUserPage');
    modal.present();
  }

  //Set user's contacts on the list.
  private setContacts(): void {
    let self = this;
    setTimeout(function() {
      if (self.user) {
        self.contacts = [];
        if (self.user.contacts) {
          for (let i = 0; i < self.user.contacts.length; i++) {
            self.contacts.push(self.usersApi.getUser(self.user.contacts[i]));
          }
        }
      }
    }, 0);
  }

  //Subscribe to the contacts.
  private subscribeToContacts(): void {
    if (this.user.contacts) {
      for (let i = 0; i < this.user.contacts.length; i++) {
        if (!this.subscriptions.get(this.user.contacts[i])) {
          let subscription = this.usersApi.subscriptions.get(this.user.contacts[i]).subscribe((user: User) => {
            //Contact has been updated on the database, update contact.
            this.updateContact(user);
          });
          this.subscriptions.set(this.user.contacts[i], subscription);
        }
      }
    }
  }

  private updateContact(user: User): void {
    if (this.contacts) {
      for (let i = 0; i < this.contacts.length; i++) {
        if (this.contacts[i].userId == user.userId) {
          this.contacts[i] = user;
        }
      }
    }
  }

  //Send message to contact.
  private sendMessage(userId: string): void {
    if (this.user.conversations && this.user.conversations[userId]) {
      this.app.getRootNav().push('ChatPage', { conversationId: this.user.conversations[userId].conversationId, members: [this.user.userId, userId] });
    } else {
      this.app.getRootNav().push('ChatPage', { members: [this.user.userId, userId] });
    }
  }

  //View profile of contact.
  private viewProfile(user: User): void {
    let modal = this.modalCtrl.create('ViewProfilePage', { userId: user.userId });
    modal.present();
    modal.onDidDismiss((userId: string) => {
      //The user chose to send message to the user profile that they are viewing on ViewProfilePage.
      if (userId) {
        if (this.user.conversations && this.user.conversations[userId]) {
          this.app.getRootNav().push('ChatPage', { conversationId: this.user.conversations[userId].conversationId, members: [this.user.userId, userId] });
        } else {
          this.app.getRootNav().push('ChatPage', { members: [this.user.userId, userId] });
        }
      }
    });
  }
}

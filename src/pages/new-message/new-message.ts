import { Component } from '@angular/core';
import { IonicPage, ViewController, ModalController } from 'ionic-angular';
import { UsersApi, NetworkProvider } from '../../providers';
import { User } from '../../models';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-new-message',
  templateUrl: 'new-message.html',
})
export class NewMessagePage {
  private user: User;
  private subscription: Subscription;
  private searchUser: string;
  private contacts: User[];
  private users: string[];

  constructor(private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private usersApi: UsersApi,
    private network: NetworkProvider) {
  }

  ionViewDidLoad() {
    //Subscribe to user.
    this.subscription = this.usersApi.usersSubscription.subscribe((users: User[]) => {
      this.user = this.usersApi.getCurrentUser();
      this.setContacts();
    });

    //Initialize.
    this.user = this.usersApi.getCurrentUser();
    this.setContacts();

    this.users = [];
  }

  private back(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
    this.viewCtrl.dismiss();
  }

  //Set user's contacts.
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

  private toggle(user: User): void {
    if (this.users.indexOf(user.userId) == -1) {
      this.add(user);
    } else {
      this.remove(user);
    }
  }

  private add(user: User): void {
    if (this.users.indexOf(user.userId) == -1) {
      this.users.push(user.userId);
    }
  }

  private remove(user: User): void {
    if (this.users.indexOf(user.userId) > -1) {
      this.users.splice(this.users.indexOf(user.userId), 1);
    }
  }

  //Pop this view while passing the usersIds of the user to initiate a chat with.
  private done(): void {
    this.viewCtrl.dismiss(this.users);
  }
}

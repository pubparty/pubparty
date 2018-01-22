import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { AuthProvider, UsersApi, DatabaseMessageProvider, NetworkProvider, ToastProvider, TranslateProvider, GroupsApi } from '../../providers';
import { User, Group } from '../../models';
import { ToastConfig } from '../../configs/toast-config';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-add-members',
  templateUrl: 'add-members.html'
})
export class AddMembersPage {
  private users: User[];
  private user: User;
  private group: Group;
  private searchUser: string;
  private excludedIds: string[];
  private userSubscription: Subscription;
  private groupSubscription: Subscription;
  private usersToAdd: string[];

  private imageLoadedMap: Map<string, boolean>;
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public auth: AuthProvider,
    public usersApi: UsersApi,
    public groupsApi: GroupsApi,
    public database: DatabaseMessageProvider,
    public network: NetworkProvider,
    public toast: ToastProvider,
    public translate: TranslateProvider) {
    this.imageLoadedMap = new Map<string, boolean>();
  }

  ionViewDidLoad() {
    this.usersToAdd = [];

    this.auth.getUser().then((user: firebase.User) => {
      //Subscribe to user.
      this.userSubscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
        this.user = user;
        this.setContacts();
      });

      //Subscribe to group.
      this.groupSubscription = this.groupsApi.subscriptions.get(this.navParams.get('groupId')).subscribe((group: Group) => {
        this.group = group;
        this.setExcludedIds();
        //Checks if all contacts are already a member of the group, and closes the view automatically.
        if (this.contactsInGroup()) {
          this.back();
        }
      });

      //Set contacts and set group's members as excludedIds - so they will not show up on the list (usersFilter pipe).
      this.user = this.usersApi.getCurrentUser();
      this.setContacts();
      this.group = this.groupsApi.getGroup(this.navParams.get('groupId'));
      this.setExcludedIds();
    });
  }

  //Checks if all contacts are already a member of the group.
  private contactsInGroup(): boolean {
    let self = this;
    return this.user.contacts.every(function(value) {
      return (self.group.members.indexOf(value) >= 0);
    });
  }

  //Add or remove user to the members to add.
  private toggle(userId: string): void {
    if (this.usersToAdd.indexOf(userId) == -1) {
      this.usersToAdd.push(userId);
    } else {
      this.usersToAdd.splice(this.usersToAdd.indexOf(userId), 1);
    }
  }

  //Close the view and unsubscribe to subscriptions.
  private back(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    if (this.groupSubscription)
      this.groupSubscription.unsubscribe();
    this.viewCtrl.dismiss();
  }

  private done(): void {
    for (let i = 0; i < this.usersToAdd.length; i++) {
      //Add users to the group on the database.
      this.database.addUserToGroup(this.group.groupId, this.usersToAdd[i]).then((userId: string) => {
        if (userId == this.usersToAdd[this.usersToAdd.length - 1]) {
          //Means the last user to add to the group has already been added.
          //Show appropriate toast message and close this view.
          if (this.usersToAdd.length == 1) {
            this.toast.showWithDuration(this.usersApi.getUser(userId).firstName + ' ' + this.usersApi.getUser(userId).lastName + this.translate.get('MEMBER_ADDED_GROUP'), ToastConfig.duration);
          } else {
            this.toast.showWithDuration('MEMBERS_ADDED_GROUP', ToastConfig.duration);
          }
          this.back();
        }

      });
    }
  }

  //Set group's members as excludedIds - so they will not show up on the list (usersFilter pipe)
  private setExcludedIds(): void {
    this.excludedIds = this.group.members;
  }

  //Populate this list with the user's contacts. Only contacts can be added to a group.
  private setContacts(): void {
    let self = this;
    setTimeout(function() {
      if (self.user) {
        self.users = [];
        if (self.user.contacts) {
          for (let i = 0; i < self.user.contacts.length; i++) {
            self.users.push(self.usersApi.getUser(self.user.contacts[i]));
          }
        }
      }
    }, 0);
  }
}

import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { NetworkProvider, UsersApi, AuthProvider, GroupsApi, TranslateProvider } from '../../providers';
import { User, Group } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html',
})
export class GroupsPage {
  private user: User;
  private groups: Group[];
  private subscriptions: Map<string, Subscription>;
  private groupsSubscription: Subscription;
  private searchGroup: string;

  private imageLoadedMap: Map<string, boolean>;
  constructor(public app: App,
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private network: NetworkProvider,
    private usersApi: UsersApi,
    private groupsApi: GroupsApi,
    private translate: TranslateProvider,
    private auth: AuthProvider) {
    this.subscriptions = new Map<string, Subscription>();
    this.imageLoadedMap = new Map<string, boolean>();
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      if (!this.subscriptions.get(user.uid)) {
        //Subscribe to user.
        let subscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
          this.user = user;
          this.subscribeToGroups();
        });

        this.subscriptions.set(user.uid, subscription);
      }

      //Subscribe to groups.
      this.groupsSubscription = this.groupsApi.groupsSubscription.subscribe((groupsCount: number) => {
        //Only refresh groups, if the user has new groups added.
        //Updating group are done on subscribeToGroups() function.
        if (this.groups.length < groupsCount) {
          this.setGroups();
          this.subscribeToGroups();
        }
      });

      //Initialize.
      this.user = this.usersApi.getCurrentUser();
      this.setGroups();
      this.subscribeToGroups();
    });
  }

  private back(): void {
    //Clear subscriptions
    this.subscriptions.forEach((value: Subscription, key: string) => {
      value.unsubscribe();
    });
    if (this.groupsSubscription) {
      this.groupsSubscription.unsubscribe();
    }
    this.navCtrl.pop();
  }

  //Set groups.
  private setGroups(): void {
    this.groups = [];
    let self = this;
    setTimeout(function() {
      if (self.user && self.user.groups) {
        //Get user's groups.
        let groupIds = Object.keys(self.user.groups);
        for (let i = 0; i < groupIds.length; i++) {
          let groupId = groupIds[i];
          let group = self.groupsApi.getGroup(groupId);
          //Add or update group.
          if (group) {
            group.groupId = groupId;
            self.addOrUpdateGroup(group);
          }
        }
      }
    }, 0);
  }

  //Subscribe to user's groups.
  private subscribeToGroups(): void {
    if (this.user.groups) {
      let groupIds = Object.keys(this.user.groups);
      for (let i = 0; i < groupIds.length; i++) {
        let groupId = groupIds[i];
        //Check if subscription already exists, if not, add a new subscription to group.
        if (!this.subscriptions.get(groupId) && this.groupsApi.subscriptions.get(groupId)) {
          let subscription = this.groupsApi.subscriptions.get(groupId).subscribe((group: Group) => {
            group.groupId = groupId;
            this.addOrUpdateGroup(group);
          });
          this.subscriptions.set(groupId, subscription);
        }
      }
    }
  }

  //Add or update the group if it exists already.
  private addOrUpdateGroup(group: Group): void {
    if (this.groups) {
      let index = -1;
      for (let i = 0; i < this.groups.length; i++) {
        if (this.groups[i].groupId == group.groupId) {
          index = i;
        }
      }
      if (index > -1) {
        this.groups[index] = group;
      } else {
        this.groups.push(group);
      }
    } else {
      this.groups = [group];
    }
  }

  //Get last message of the group.
  private getGroupLastMessage(group: Group): string {
    let message = group.messages[group.messages.length - 1];
    //User is the sender of the message.
    if (message.sender == this.user.userId) {
      if (message.type == 'text') {
        return this.translate.get('YOU') + message.text;
      } else if (message.type == 'image') {
        return this.translate.get('YOU_SENT_PHOTO_MESSAGE');
      }
    } else {
      let user = this.usersApi.getUser(message.sender);
      if (message.type == 'text') {
        return user.firstName + ': ' + message.text;
      } else if (message.type == 'image') {
        return user.firstName + ' ' + this.translate.get('SENT_PHOTO_MESSAGE');
      }
    }
  }

  //Get unread messages of the group.
  private getUnreadGroupMessages(group: Group): number {
    if (this.user.groups && group.messages) {
      let messagesRead = this.user.groups[group.groupId].messagesRead;
      return group.messages.length - messagesRead;
    }
    return null;
  }

  //Open the group conversation.
  private viewGroup(group: Group): void {
    let members = [this.user.userId];
    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] != this.user.userId)
        members.push(group.members[i]);
    }
    this.app.getRootNav().push('ChatPage', { groupId: group.groupId, members: members });
  }

  //Show the NewMessagePage.
  private showCompose(): void {
    let modal = this.modalCtrl.create('NewMessagePage');
    modal.present();
    modal.onDidDismiss((users: string[]) => {
      if (users) {
        if (users.length > 1) {
          //User wanted to create a chat with more than one person -> Group.
          let members = [this.user.userId];
          for (let i = 0; i < users.length; i++) {
            members.push(users[i]);
          }
          this.app.getRootNav().push('ChatPage', { members: members });
        } else {
          //User wanted to create a chat with one person -> Conversation. Check if they already have an existing conversation.
          if (this.user.conversations && this.user.conversations[users[0]]) {
            this.app.getRootNav().push('ChatPage', { conversationId: this.user.conversations[users[0]].conversationId, members: [this.user.userId, users[0]] });
          } else {
            this.app.getRootNav().push('ChatPage', { members: [this.user.userId, users[0]] });
          }
        }
      }
    });
  }
}

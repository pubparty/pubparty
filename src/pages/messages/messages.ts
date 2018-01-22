import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { NetworkMessageProvider, UsersApi, ConversationsApi, AuthMessageProvider, GroupsApi, TranslateProvider } from '../../providers';
import { User, Conversation, Group } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  private user: User;
  private conversations: Conversation[];
  private groups: Group[];
  private subscriptions: Map<string, Subscription>;
  private conversationsSubscription: Subscription;
  private groupsSubscription: Subscription;

  private imageLoadedMap: Map<string, boolean>;

  private numOfConversations: number = 6; //Set to how many conversations to show, before 'More' shows up.
  private numOfGroups: number = 4; //Set to how many groups to show, before 'More' shows up.
  constructor(public app: App,
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private network: NetworkMessageProvider,
    private usersApi: UsersApi,
    private conversationsApi: ConversationsApi,
    private groupsApi: GroupsApi,
    private translate: TranslateProvider,
    private auth: AuthMessageProvider) {
    this.subscriptions = new Map<string, Subscription>();
    this.imageLoadedMap = new Map<string, boolean>();
  }

  ionViewDidLoad() {

  
    ;
    this.auth.getUser().then((user: firebase.User) => {
      if (!this.subscriptions.get(user.uid)) {
        //Subscribe to user and update the conversations and groups.
        
        console.log(this.groupsApi, "aaaa");
        let subscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
          this.user = user;
          //Subscribe to conversations.
          this.subscribeToConversations();

          if (!this.user.groups) {
            //Check if the user left on their last group, and unsubscribe.
            if (this.groups && this.groups.length > 0) {
              this.unsubscribeToGroup(this.groups[0].groupId);
              this.setGroups();
            }
          } else {
            //Check if user left on a group, and unsubscribe to it.
            if (Object.keys(this.user.groups).length < this.groups.length) { //Means the user left on a group.
              let groupIds = Object.keys(this.user.groups);
              //Find the groupId of the group the user left.
              for (let i = 0; i < this.groups.length; i++) {
                if (groupIds.indexOf(this.groups[i].groupId) == -1) { //This group should already be removed from groups, since the user left already.
                  this.unsubscribeToGroup(this.groups[i].groupId);
                }
              }
              //Refresh the groups.
              this.setGroups();
            }
          }
        });
        this.subscriptions.set(user.uid, subscription);
      }

      this.conversationsSubscription = this.conversationsApi.conversationsSubscription.subscribe((conversationsCount: number) => {
        //Only refresh conversations, if the user has new conversations added.
        //Updating conversation are done on subscribeToConversations() function.
        if (this.conversations.length < conversationsCount) {
          this.setConversations();
          this.subscribeToConversations();
        }
      });

      this.groupsSubscription = this.groupsApi.groupsSubscription.subscribe((groupsCount: number) => {
        //Only refresh groups, if the user has new groups added when the user left the group it is checked on the users subscription.
        //Updating group are done on subscribeToGroups() function.
        if (this.groups.length < groupsCount) {
          this.setGroups();
          this.subscribeToGroups();
        }
      });

      //Initialize variables.
      this.user = this.usersApi.getCurrentUser();
      this.setConversations();
      this.subscribeToConversations();
      this.setGroups();
      this.subscribeToGroups();
    });
  }

  ionViewWillUnload() {
    //Clear subscriptions when the user logged out.
    this.subscriptions.forEach((value: Subscription, key: string) => {
      value.unsubscribe();
    });
    if (this.conversationsSubscription) {
      this.conversationsSubscription.unsubscribe();
    }
    if (this.groupsSubscription) {
      this.groupsSubscription.unsubscribe();
    }
    this.conversationsApi.destroy();
    this.groupsApi.destroy();
  }

  //Unsubscribe to group when user has left/deleted a group.
  private unsubscribeToGroup(groupId: string): void {
    this.subscriptions.get(groupId).unsubscribe();
    this.groupsApi.unsubscribeToGroup(groupId);
  }

  //Set conversations.
  private setConversations(): void {
    this.conversations = [];
    let self = this;
    setTimeout(function() {
      if (self.user && self.user.conversations) {
        let userIds = Object.keys(self.user.conversations);
        for (let i = 0; i < userIds.length; i++) {
          let userId = userIds[i];
          let conversationId = self.user.conversations[userId].conversationId;
          let conversation = self.conversationsApi.getConversation(conversationId);
          if (conversation) {
            conversation.conversationId = conversationId;
            conversation.partnerId = userId;
            self.addOrUpdateConversation(conversation);
          }
        }
      }
    }, 0);
  }

  //Set groups.
  private setGroups(): void {
    this.groups = [];
    let self = this;
    setTimeout(function() {
      if (self.user && self.user.groups) {
        let groupIds = Object.keys(self.user.groups);
        for (let i = 0; i < groupIds.length; i++) {
          let groupId = groupIds[i];
          let group = self.groupsApi.getGroup(groupId);
          if (group) {
            group.groupId = groupId;
            self.addOrUpdateGroup(group);
          }
        }
      }
    }, 0);
  }

  //Subscribe to user's conversations.
  private subscribeToConversations(): void {
    if (this.user.conversations) {
      let userIds = Object.keys(this.user.conversations);
      for (let i = 0; i < userIds.length; i++) {
        let userId = userIds[i];
        let conversationId = this.user.conversations[userId].conversationId;
        if (!this.subscriptions.get(conversationId) && this.conversationsApi.subscriptions.get(conversationId)) {
          let subscription = this.conversationsApi.subscriptions.get(conversationId).subscribe((conversation: Conversation) => {
            conversation.conversationId = conversationId;
            conversation.partnerId = userId;
            this.addOrUpdateConversation(conversation);
          });
          this.subscriptions.set(conversationId, subscription);
        }
      }
    }
  }

  //Subscribe to user's groups.
  private subscribeToGroups(): void {
    if (this.user.groups) {
      let groupIds = Object.keys(this.user.groups);
      for (let i = 0; i < groupIds.length; i++) {
        let groupId = groupIds[i];
        if (!this.subscriptions.get(groupId) && this.groupsApi.subscriptions.get(groupId)) {
          let subscription = this.groupsApi.subscriptions.get(groupId).subscribe((group: Group) => {
            group.groupId = groupId;
            this.addOrUpdateGroup(group);
            this.imageLoadedMap.set(group.groupId, false);
          });
          this.subscriptions.set(groupId, subscription);
        }
      }
    }
  }

  //Add or update conversation if it exists already.
  private addOrUpdateConversation(conversation: Conversation): void {
    if (this.conversations) {
      let index = -1;
      for (let i = 0; i < this.conversations.length; i++) {
        if (this.conversations[i].conversationId == conversation.conversationId) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations[index] = conversation;
      } else {
        this.conversations.push(conversation);
      }
    } else {
      this.conversations = [conversation];
    }
  }

  //Add or update group if it exists already.
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

  //Get last message of the conversation.
  private getLastMessage(conversation: Conversation): string {
    let message = conversation.messages[conversation.messages.length - 1];
    if (message.sender == this.user.userId) {
      //User is the sender.
      if (message.type == 'text') {
        return this.translate.get('YOU') + message.text;
      } else if (message.type == 'image') {
        return this.translate.get('YOU_SENT_PHOTO_MESSAGE');
      }
    } else {
      if (message.type == 'text') {
        return message.text;
      } else if (message.type == 'image') {
        return this.translate.get('SENT_PHOTO_MESSAGE');
      }
    }
  }

  //Get last message of the group.
  private getGroupLastMessage(group: Group): string {
    let message = group.messages[group.messages.length - 1];
    if (message.sender == this.user.userId) {
      //User is the sender.
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

  //Get unreadMessages of the user in the conversation.
  private getUnreadMessages(conversation: Conversation): number {
    if (this.user.conversations && conversation.messages) {
      let messagesRead = this.user.conversations[conversation.partnerId].messagesRead;
      return conversation.messages.length - messagesRead;
    }
    return null;
  }

  //Get unreadMessages of the user in the group.
  private getUnreadGroupMessages(group: Group): number {
    if (this.user.groups && group.messages) {
      let messagesRead = this.user.groups[group.groupId].messagesRead;
      return group.messages.length - messagesRead;
    }
    return null;
  }

  //View conversation.
  private viewConversation(conversation: Conversation): void {
    this.app.getRootNav().push('ChatPage', { conversationId: conversation.conversationId, members: [this.user.userId, conversation.partnerId] });
  }

  //View group chat.
  private viewGroup(group: Group): void {
    let members = [this.user.userId];
    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] != this.user.userId)
        members.push(group.members[i]);
    }
    this.app.getRootNav().push('ChatPage', { groupId: group.groupId, members: members });
  }

  //View all of user's groups, when they have more groups than shown on the view.
  private viewAllGroups(): void {
    this.app.getRootNav().push('GroupsPage');
  }

  //View all of user's conversations, when they have more conversations than shown on the view.
  private viewAllConversations(): void {
    this.app.getRootNav().push('ConversationsPage');
  }

  //Show NewMessagePage.
  private showCompose(): void {
    let modal = this.modalCtrl.create('NewMessagePage');
    modal.present();
    modal.onDidDismiss((users: string[]) => {
      if (users) {
        let userId = firebase.auth().currentUser.uid;
        if (users.length > 1) {
          //User wanted to create a chat with more than one person -> Group.
          let members = [userId];
          for (let i = 0; i < users.length; i++) {
            members.push(users[i]);
          }
          this.app.getRootNav().push('ChatPage', { members: members });
        } else {
          //User wanted to create a chat with one person -> Conversation. Check if they already have an existing conversation.
          if (this.user.conversations && this.user.conversations[users[0]]) {
            this.app.getRootNav().push('ChatPage', { conversationId: this.user.conversations[users[0]].conversationId, members: [userId, users[0]] });
          } else {
            this.app.getRootNav().push('ChatPage', { members: [userId, users[0]] });
          }
        }
      }
    });
  }
}

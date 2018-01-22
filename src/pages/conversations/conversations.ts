import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { NetworkProvider, UsersApi, ConversationsApi, AuthProvider, TranslateProvider } from '../../providers';
import { User, Conversation } from '../../models';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-conversations',
  templateUrl: 'conversations.html',
})
export class ConversationsPage {
  private user: User;
  private conversations: Conversation[];
  private subscriptions: Map<string, Subscription>;
  private conversationsSubscription: Subscription;
  private searchConversation: string;

  private imageLoadedMap: Map<string, boolean>;
  constructor(public app: App,
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private network: NetworkProvider,
    private usersApi: UsersApi,
    private conversationsApi: ConversationsApi,
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
          //Subscribe to user's conversations.
          this.subscribeToConversations();
        });

        this.subscriptions.set(user.uid, subscription);
      }

      //Subscribe to conversations.
      this.conversationsSubscription = this.conversationsApi.conversationsSubscription.subscribe((conversationsCount: number) => {
        //Only refresh conversations, if the user has new conversations added.
        //Updating conversation are done on subscribeToConversations() function.
        if (this.conversations.length < conversationsCount) {
          this.setConversations();
          this.subscribeToConversations();
        }
      });

      //Initialize.
      this.user = this.usersApi.getCurrentUser();
      this.setConversations();
      this.subscribeToConversations();
    });
  }

  private back(): void {
    //Clear subscriptions.
    this.subscriptions.forEach((value: Subscription, key: string) => {
      value.unsubscribe();
    });
    if (this.conversationsSubscription) {
      this.conversationsSubscription.unsubscribe();
    }
    this.navCtrl.pop();
  }

  //Set conversations.
  private setConversations(): void {
    this.conversations = [];
    let self = this;
    setTimeout(function() {
      if (self.user && self.user.conversations) {
        //Get user's conversations.
        let userIds = Object.keys(self.user.conversations);
        for (let i = 0; i < userIds.length; i++) {
          let userId = userIds[i];
          //Get conversationId
          let conversationId = self.user.conversations[userId].conversationId;
          let conversation = self.conversationsApi.getConversation(conversationId);
          //Add or update conversation.
          if (conversation) {
            conversation.conversationId = conversationId;
            conversation.partnerId = userId;
            self.addOrUpdateConversation(conversation);
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
        //Check if subscription already exists, if not, add a new subscription to conversation.
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

  //Add or update the conversation if it exists already.
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

  //Get last message of the conversation.
  private getLastMessage(conversation: Conversation): string {
    let message = conversation.messages[conversation.messages.length - 1];
    //User is the sender of the message.
    if (message.sender == this.user.userId) {
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

  //Get unread messages of the conversation.
  private getUnreadMessages(conversation: Conversation): number {
    if (this.user.conversations && conversation.messages) {
      let messagesRead = this.user.conversations[conversation.partnerId].messagesRead;
      return conversation.messages.length - messagesRead;
    }
    return null;
  }

  //Open the conversation.
  private viewConversation(conversation: Conversation): void {
    this.app.getRootNav().push('ChatPage', { conversationId: conversation.conversationId, members: [this.user.userId, conversation.partnerId] });
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

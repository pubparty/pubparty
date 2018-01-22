import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ModalController, ActionSheetController, App, Modal } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Conversation, Message, UserConversation, User, Group, UserGroup } from '../../models';
import { DatabaseMessageProvider, ConversationsApi, UsersApi, TranslateProvider, StorageMessageProvider, GroupsApi, AlertProvider, ToastProvider, NetworkProvider, NotificationMessageProvider, LoadingProvider } from '../../providers';
import { Subscription } from 'rxjs/Subscription';
import { ToastConfig } from '../../configs/toast-config';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;
  private title: string;
  private message: string;
  private conversationId: string;
  private conversation: Conversation;
  private groupId: string;
  private group: Group;
  private subscriptions: Map<string, Subscription>;

  private members: string[];
  private users: Map<string, User>;
  private messages: Message[];

  private imageLoadedMap: Map<string, boolean>;

  private scrollDirection: string = 'bottom';
  private numOfMessages: number = 10; //Set to show how many messages to load at a time.
  private messagesToShow: number;
  private membersSeen: number;
  private usersTyping: User[];
  private modal: Modal;
  constructor(public navCtrl: NavController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    public navParams: NavParams,
    public keyboard: Keyboard,
    private photoViewer: PhotoViewer,
    private database: DatabaseMessageProvider,
    private conversationsApi: ConversationsApi,
    private usersApi: UsersApi,
    private groupsApi: GroupsApi,
    private translate: TranslateProvider,
    private storage: StorageMessageProvider,
    private toast: ToastProvider,
    private camera: Camera,
    private app: App,
    private alert: AlertProvider,
    private network: NetworkProvider,
    private notification: NotificationMessageProvider,
    private loading: LoadingProvider) {
    this.subscriptions = new Map<string, Subscription>();
    this.imageLoadedMap = new Map<string, boolean>();
    this.users = new Map<string, User>();
  }

  ionViewDidLoad() {
    this.message = '';
    this.messagesToShow = this.numOfMessages; //Show the last numOfMessages at a time.

    if (!this.conversationId)
      this.conversationId = this.navParams.get('conversationId');

    if (!this.groupId)
      this.groupId = this.navParams.get('groupId');

    this.members = this.navParams.get('members'); 

    //Check if a new conversation between the users has been made!
    if (this.members.length == 2 && !this.conversationId) {
      let subscription = this.usersApi.subscriptions.get(this.members[0]).subscribe((user: User) => {
        if (user.conversations && user.conversations[this.members[1]]) {
          let conversationId = user.conversations[this.members[1]].conversationId;
          //Subscribe to the new conversation.
          this.conversationsApi.subscribeToConversation(conversationId);
          //Reload this view.
          this.conversationId = conversationId;
          this.ionViewDidLoad();
        }
      });
    }
    //Subscribe to and get the members of the conversation/group.
    for (let i = 0; i < this.members.length; i++) {
      let userId = this.members[i];
      let subscription = this.usersApi.subscriptions.get(userId).subscribe((user: User) => {
        //Update usersMap with the user when the member gets updated.
        this.users.set(userId, user);
        this.setTitle();
      });
      this.subscriptions.set(userId, subscription);

      this.users.set(userId, this.usersApi.getUser(userId));
    }

    //Set title based on conversation or group.
    this.setTitle();

    //Subscribe to conversation.
    if (this.conversationId) {
      if (!this.subscriptions.get(this.conversationId)) {
        let y =  this.conversationsApi;
        console.log(y ,"covo nigga")
        let conversationSubscription = this.conversationsApi.subscriptions.get(this.conversationId).subscribe((conversation: Conversation) => {
          this.scrollDirection = 'bottom';
          //Check for conversation and append only the new messages at the bottom of the list.
          if (!this.conversation) {
            //Set messages.
            this.conversation = conversation;
            if (this.conversation && this.conversation.messages)
              this.messages = this.conversation.messages;
          } else {
            //Set the number of messagesRead
            this.database.setMessagesRead(firebase.auth().currentUser.uid, this.getPartnerId(), this.conversation.messages.length);
            //Append to bottom.
            if (this.conversation.messages.length < conversation.messages.length) {
              this.conversation.messages.push(conversation.messages[conversation.messages.length - 1]);
              //Set the number of messagesRead
              this.database.setMessagesRead(firebase.auth().currentUser.uid, this.getPartnerId(), this.conversation.messages.length);
            } else {
              //Check if a message is deleted and update the messagesRead.
              if (this.messages.length > conversation.messages.length) {
                this.conversation = conversation;
                this.messages = conversation.messages;
                //Set the number of messagesRead
                this.database.setMessagesRead(firebase.auth().currentUser.uid, this.getPartnerId(), this.messages.length);
              }
            }
          }
        });
        this.subscriptions.set(this.conversationId, conversationSubscription);
      }
      //Initialize conversation.
      this.conversation = this.conversationsApi.getConversation(this.conversationId);
      if (this.conversation && this.conversation.messages) {
        this.messages = this.conversation.messages;
        //Set the number of messagesRead
        this.database.setMessagesRead(firebase.auth().currentUser.uid, this.getPartnerId(), this.messages.length);
      }
      this.scrollBottom();
    }

    //Subscribe to group.
    if (this.groupId) {
      let usersTypingSubscription = this.database.getUsersTyping(this.groupId).subscribe((users: User[]) => {
        this.usersTyping = users;
        //Do not show currentUser from usersTyping.
        let index = -1;
        for (let i = 0; i < this.usersTyping.length; i++) {
          if (this.usersTyping[i].userId == firebase.auth().currentUser.uid) {
            index = i;
          }
        }
        if (index > -1) {
          this.usersTyping.splice(index, 1);
        }
      });
      this.subscriptions.set('usersTyping', usersTypingSubscription);

      if (!this.subscriptions.get(this.groupId)) {
        let groupSubscription = this.groupsApi.subscriptions.get(this.groupId).subscribe((group: Group) => {
          this.scrollDirection = 'bottom';
          //Check for group - set title, and append only the new messages at the bottom of the list.
          this.title = group.name;
          if (!this.group) {
            //Set messages.
            this.group = group;
            if (this.group && this.group.messages)
              this.messages = this.group.messages;
          } else {
            //Set the number of messagesRead
            this.database.setGroupMessagesRead(firebase.auth().currentUser.uid, this.groupId, this.group.messages.length);
            //Append message to bottom.
            if (this.group.messages.length < group.messages.length) {
              this.group.messages.push(group.messages[group.messages.length - 1]);
              //Set the number of messagesRead
              this.database.setGroupMessagesRead(firebase.auth().currentUser.uid, this.groupId, this.group.messages.length);
            } else {
              //Check if a message is deleted and update the messagesRead.
              if (this.messages.length > group.messages.length) {
                this.group = group;
                this.messages = group.messages;
                //Set the number of messagesRead
                this.database.setGroupMessagesRead(firebase.auth().currentUser.uid, this.groupId, this.messages.length);
              }
            }
          }
        });
        this.subscriptions.set(this.groupId, groupSubscription);
      }

      //Initialize group.
      this.group = this.groupsApi.getGroup(this.groupId);
      if (this.group && this.group.name)
        this.title = this.group.name;
      if (this.group && this.group.messages) {
        this.messages = this.group.messages;
        //Set the number of messagesRead
        this.database.setGroupMessagesRead(firebase.auth().currentUser.uid, this.groupId, this.messages.length);
      }
      this.scrollBottom();
    }

    let showKeyboardSubscription = this.keyboard.onKeyboardShow().subscribe(() => {
      if (!this.modal)
        if (this.conversationId) {
          this.database.setIsTyping(this.conversationId);
        } else if (this.groupId) {
          this.database.setIsTyping(this.groupId);
        }
    });

    let hideKeyboardSubscription = this.keyboard.onKeyboardHide().subscribe(() => {
      this.database.setIsTyping('');
    });

    this.subscriptions.set('showKeyboard', showKeyboardSubscription);
    this.subscriptions.set('hideKeyboard', hideKeyboardSubscription);
  }

  keyDownFunction(event) {
    //User pressed return on the keyboard, send the text message.
    if (event.keyCode == 13) {
      this.keyboard.close();
      this.send();
    }
  }

  doRefresh(refresher) {
    this.scrollDirection = 'top';
    //Load more messages depending on numOfMessages.
    this.messagesToShow += this.numOfMessages;
    let self = this;
    setTimeout(() => {
      self.scrollTop();
      refresher.complete();
    }, 1000);
  }

  //Option to delete message when the user long taps on it.
  onPress(message: Message) {
    //Disable deleting the last message.
    let index = this.messages.indexOf(message);
    if (this.network.online() && this.messages.length > 1 && index > 0) {
      this.alert.showConfirm(this.translate.get('CONFIRM_DELETE_MESSAGE'), this.translate.get('CONFIRM_DELETE_MESSAGE_QUESTION'), this.translate.get('CANCEL'), this.translate.get('DELETE')).then(confirm => {
        if (confirm) {
          //If photo message, delete the photo on storage.
          if (message.type == 'image') {
            this.storage.deleteUserPic(firebase.auth().currentUser.uid, message.url);
          }
          //Delete message and update messagesRead.
          this.messages.splice(index, 1);
          //Update conversation.
          if (this.conversationId) {
            this.database.getConversationById(this.conversationId).update({
              messages: this.messages
            });
            //Update partner's messagesRead so it will not be negative.
            let conversation = this.usersApi.getUser(this.getPartnerId()).conversations[firebase.auth().currentUser.uid];
            if (conversation.messagesRead >= this.messages.length) {
              //Partner has unread messages that is deleted, so we subtract that to the count. Otherwise, partner has read all messages so we set it to the new number of messages.
              if ((this.messages.length - conversation.messagesRead) > 0)
                this.database.setMessagesRead(this.getPartnerId(), firebase.auth().currentUser.uid, conversation.messagesRead - 1);
              else
                this.database.setMessagesRead(this.getPartnerId(), firebase.auth().currentUser.uid, this.messages.length);
            }
            this.toast.showWithDuration(this.translate.get('MESSAGE_DELETED'), ToastConfig.duration);
          }
          //Update group.
          if (this.groupId) {
            this.database.getGroupById(this.groupId).update({
              messages: this.messages
            });
            //Update member's messagesRead so it will not be negative.
            for (let i = 0; i < this.group.members.length; i++) {
              this.group.members[i];
              let group = this.usersApi.getUser(this.group.members[i]).groups[this.groupId];
              if (group.messagesRead >= this.messages.length) {
                //Member has unread group messages that is deleted, so we subtract that to the count. Otherwise, member has read all group messages so we set it to the new number of messages.
                if ((this.messages.length - group.messagesRead) > 0)
                  this.database.setGroupMessagesRead(this.group.members[i], this.groupId, group.messagesRead - 1);
                else
                  this.database.setGroupMessagesRead(this.group.members[i], this.groupId, this.messages.length);
              }
            }
            this.toast.showWithDuration(this.translate.get('MESSAGE_DELETED'), ToastConfig.duration);
          }
        }
      });
    }
  }

  private setTitle(): void {
    if (this.members.length == 2) {
      //Set conversation title.
      let user = this.usersApi.getUser(this.getPartnerId());
      this.title = user.firstName + ' ' + user.lastName;
    } else {
      //Set group title.
      let title = '';
      for (let i = 0; i < this.members.length; i++) {
        title += this.users.get(this.members[i]).firstName + ', ';
      }
      this.title = title.substr(0, title.length - 2);
    }
  }

  private scrollTop(): void {
    let self = this;
    setTimeout(function() {
      self.content.scrollToTop();
    }, 300);
  }

  private scrollBottom(): void {
    let self = this;
    setTimeout(function() {
      self.content.scrollToBottom();
    }, 300);
  }

  private doScroll(): void {
    if (this.navCtrl.getActive().component === ChatPage) {
      if (this.scrollDirection == 'bottom') {
        this.scrollBottom();
      } else if (this.scrollDirection == 'top') {
        this.scrollTop();
      }
    }
  }

  //Unsubscribe to subscriptions.
  private back(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((value: Subscription, key: string) => {
        value.unsubscribe();
      });
      this.subscriptions.clear();
    }
    this.navCtrl.pop();
  }

  //Send text message.
  private send(): void {
    if (this.message != '') {
      let message = new Message(firebase.auth().currentUser.uid, this.message, null, 'text', new Date().toString());
      this.message = '';
      this.sendMessage(message);
    }
  }

  //Send photo message.
  private sendPhoto(): void {
    this.actionSheetCtrl.create({
      title: this.translate.get('SEND_PHOTO'),
      buttons: [
        {
          text: this.translate.get('TAKE_A_PHOTO'),
          role: 'destructive',
          handler: () => {
            //Upload photo.
            this.storage.uploadPicture(firebase.auth().currentUser.uid, this.camera.PictureSourceType.CAMERA).then(url => {
              let message = new Message(firebase.auth().currentUser.uid, null, url, 'image', new Date().toString());
              this.sendMessage(message);
            });
          }
        },
        {
          text: this.translate.get('CHOOSE_FROM_GALLERY'),
          handler: () => {
            //Upload photo.
            this.storage.uploadPicture(firebase.auth().currentUser.uid, this.camera.PictureSourceType.PHOTOLIBRARY).then(url => {
              let message = new Message(firebase.auth().currentUser.uid, null, url, 'image', new Date().toString());
              this.sendMessage(message);
            });
          }
        },
        {
          text: this.translate.get('CANCEL'),
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    }).present();
  }

  private sendMessage(message: Message): void {
    //Check if a conversation or group exists, and add the message.
    //Send a push notification to the user if they are offline and their device is registered to accept push notifications.
    //If no conversation or group exists yet, create a new conversation or group.
    if (this.conversationId) {
      //Add message to conversation.
      this.conversation.messages.push(message);
      this.database.getConversationById(this.conversationId).update({
        messages: this.conversation.messages
      }).then(() => {
        //Send push notification to partner if they are offline and pushToken is registered.
        let partner = this.usersApi.getUser(this.getPartnerId());
        if (message.type == 'text') {
          this.notification.sendPushNotification(partner, this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, message.text,
            { conversationId: this.conversationId, members: this.members });
        }
        else
          this.notification.sendPushNotification(partner, this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, this.translate.get('PUSH_SENT_PHOTO'),
            { conversationId: this.conversationId, members: this.members });
      });
    }
    else if (this.groupId) {
      this.group.messages.push(message);
      this.database.getGroupById(this.groupId).update({
        messages: this.group.messages
      }).then(() => {
        for (let i = 0; i < this.members.length; i++) {
          //Send push notification to group members if they are offline and pushToken is registered.
          let user = this.usersApi.getUser(this.members[i]);
          if (message.type == 'text')
            this.notification.sendPushNotification(user, this.group.name, this.usersApi.getCurrentUser().firstName + ': ' + message.text,
              { groupId: this.groupId, members: this.members });
          else
            this.notification.sendPushNotification(user, this.group.name, this.usersApi.getCurrentUser().firstName + ' ' + this.translate.get('PUSH_SENT_PHOTO'),
              { groupId: this.groupId, members: this.members });
        }
      });
    } else {
      this.loading.show();
      //Create new conversation or group.
      if (this.members.length == 2) {
        let partnerId = this.getPartnerId();
        //Add Conversation to database.
        let conversation = new Conversation(this.members, [message], null, null);
        this.database.addConversation(conversation).then((conversationId: string) => {
          //Subscribe to the new conversation.
          this.conversationsApi.subscribeToConversation(conversationId);
          let userConversation = new UserConversation(conversationId, 1);
          this.database.setUserConversation(firebase.auth().currentUser.uid, partnerId, userConversation);
          userConversation = new UserConversation(conversationId, 0);
          this.database.setUserConversation(partnerId, firebase.auth().currentUser.uid, userConversation);
          //Send push notification to partner if they are offline and pushToken is registered.
          let partner = this.usersApi.getUser(this.getPartnerId());
          if (message.type == 'text')
            this.notification.sendPushNotification(partner, this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, message.text,
              { conversationId: conversationId, members: this.members });
          else
            this.notification.sendPushNotification(partner, this.usersApi.getCurrentUser().firstName + ' ' + this.usersApi.getCurrentUser().lastName, this.translate.get('PUSH_SENT_PHOTO'),
              { conversationId: conversationId, members: this.members });
          //Reload this view.
          this.loading.hide();
          this.conversationId = conversationId;
          this.ionViewDidLoad();
        });
      } else {
        //Add Group to database.
        let userId = firebase.auth().currentUser.uid;
        if (this.members.indexOf(userId) == -1) {
          this.members.push(userId);
        }
        let group = new Group(this.title, this.members, [message], null, 'assets/images/group.png');
        this.database.addGroup(group).then((groupId: string) => {
          //Subscribe to the new group.
          this.groupsApi.subscribeToGroup(groupId);
          for (let i = 0; i < this.members.length; i++) {
            let userGroup: UserGroup;
            if (i == 0) {
              userGroup = new UserGroup(groupId, 1);
            } else {
              userGroup = new UserGroup(groupId, 0);
            }
            this.database.setUserGroup(this.members[i], groupId, userGroup);
            //Send push notification to group members if they are offline and pushToken is registered.
            let user = this.usersApi.getUser(this.members[i]);
            if (message.type == 'text')
              this.notification.sendPushNotification(user, this.title, this.usersApi.getCurrentUser().firstName + ': ' + message.text,
                { groupId: groupId, members: this.members });
            else
              this.notification.sendPushNotification(user, this.title, this.usersApi.getCurrentUser().firstName + ' ' + this.translate.get('PUSH_SENT_PHOTO'),
                { groupId: groupId, members: this.members });
          }
          //Reload this view.
          this.loading.hide();
          this.groupId = groupId;
          this.ionViewDidLoad();
        });
      }
    }
  }

  //Get the partner of the user having the conversation with.
  private getPartnerId(): string {
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i] != firebase.auth().currentUser.uid) {
        return this.members[i];
      }
    }
  }

  //Check if this is the currentUser or not.
  private isSender(userId: string): boolean {
    if (firebase.auth().currentUser.uid == userId) {
      return true;
    }
    return false;
  }

  private viewProfile(user: User): void {
    this.modal = this.modalCtrl.create('ViewProfilePage', { userId: user.userId });
    this.modal.present();
    this.modal.onDidDismiss((userId: string) => {
      //The user chose to send message to the user profile that they are viewing on ViewProfilePage.
      if (userId != this.getPartnerId()) {
        let user = this.usersApi.getCurrentUser();
        if (userId) {
          if (user.conversations && user.conversations[userId]) {
            this.app.getRootNav().push('ChatPage', { conversationId: user.conversations[userId].conversationId, members: [user.userId, userId] });
          } else {
            this.app.getRootNav().push('ChatPage', { members: [user.userId, userId] });
          }
        }
      } else {
        //The user chose to send message to the user profile that they are viewing in a Group conversation.
        if (this.group) {
          let user = this.usersApi.getCurrentUser();
          this.app.getRootNav().push('ChatPage', { conversationId: user.conversations[userId].conversationId, members: [user.userId, userId] });
        }
      }
      this.modal = null;
    });
  }

  private viewGroup(group: Group): void {
    this.modal = this.modalCtrl.create('ViewGroupPage', { groupId: group.groupId });
    this.modal.present();
    this.modal.onDidDismiss((data: any) => {
      if (data) {
        let conversationId = data.conversationId;
        let members = data.members;
        let groupId = data.groupId;
        //The user chose to send message to the user profile that they are viewing on ViewGroupPage.
        if (conversationId) {
          this.app.getRootNav().push('ChatPage', { conversationId: conversationId, members: members });
        } else if (members) {
          this.app.getRootNav().push('ChatPage', { members: members });
        } else {
          //The user left or deleted a group, close this chat window.
          if (groupId == null) {
            this.back();
          }
        }
      }
      this.modal = null;
    });
  }

  private viewImage(url: string): void {
    if (this.network.online())
      this.photoViewer.show(url);
  }

  private isSeen(): boolean {
    //Check if partner has seen the lastMessage.
    if (this.conversationId) {
      let partnerId = this.getPartnerId();
      return this.usersApi.getUser(partnerId).conversations[firebase.auth().currentUser.uid].messagesRead == this.messages.length;
    } else {
      this.membersSeen = 0;
      //Check if member has seen the lastMessage.
      for (let i = 0; i < this.group.members.length; i++) {
        let user = this.usersApi.getUser(this.group.members[i]);
        if (user.userId != firebase.auth().currentUser.uid && user.groups[this.groupId].messagesRead == this.messages.length) {
          //Member has seen the lastMessage.
          this.membersSeen++;
        }
      }
      return this.membersSeen > 0;
    }
  }

  private isTyping(): boolean {
    if (this.conversationId) {
      return this.getPartner().isTyping == this.conversationId;
    }
  }

  private getPartner(): User {
    return this.usersApi.getUser(this.getPartnerId());
  }
}

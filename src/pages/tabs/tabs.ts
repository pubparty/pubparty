import { Component, ViewChild } from '@angular/core';
import { IonicPage, Tabs, App } from 'ionic-angular';
import { UsersApi, DatabaseMessageProvider, AuthProvider, NotificationMessageProvider, NotificationProvider, GroupsApi } from '../../providers';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs/Subscription';
import { User, Conversation } from '../../models';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ConversationsApi } from '../../providers/api/conversations';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild("tabs") tabs: Tabs;
  tab1Root: string = 'HomePage';
  tab2Root: string = 'MyEventsPage';
  tab3Root: string = 'MessagesPage';
  tab4Root: string = 'ContactsPage';
  tab5Root: string = 'ProfilePage';
  private user: User;
  private userSubscription: Subscription;
  private conversationSubscription: Subscription;
  private groupSubscription: Subscription;
  private notificationSubscription: Subscription;
  private unreadMessages: number;

  constructor(
    private modalCtrl: ModalController,
    private app: App, 
    private usersApi: UsersApi, 
    private database:DatabaseMessageProvider,
     private auth: AuthProvider, 
     private n: NotificationProvider,
     private notification: NotificationMessageProvider,
     private conversationsApi: ConversationsApi,
     private groupsApi: GroupsApi,
) {
  }


  ionViewDidLoad() {
    console.log("tabs");
    // this.auth.getUser().then((user: firebase.User) => {
    //   if (!this.usersApi.subscriptions.get(user.uid)) {
    //     this.app.getRootNav().setRoot('LoaderPage');
    //   }
    // });

    this.notificationSubscription = this.notification.subscription.subscribe((res: any) => {
      let data = JSON.parse(JSON.stringify(res));
      if (data.eventId) {
        this.app.getRootNav().popToRoot().then(() => {
          this.tabs.select(1);
          this.app.getRootNav().push('EventPage', { eventId: data.eventId });
        });
      }
    });
    this.auth.getUser().then((user: firebase.User) => {
      //Check if data has been loaded successfully, if not revert back to LoaderPage.
      if (!this.usersApi.subscriptions.get(user.uid)) {
        this.app.getRootNav().setRoot('LoaderPage');
      } else {
        //Initialize NotificationProvider in order to accept push notifications.
        this.notification.init();
        //Set user to online on database.
        this.database.setUserOnline(true);

        //Subscribe to changes made to the user.
        if (!this.userSubscription) {
          this.userSubscription = this.usersApi.subscriptions.get(user.uid).subscribe((user: User) => {
            this.user = user;
            if (this.user && this.user.requestsReceived) {
              this.notification.requestsReceived = this.user.requestsReceived.length;
            } else {
              this.notification.requestsReceived = 0;
            }
            //Recompute unread messages.
            this.computeUnreadMessages();
          });
        }

        //Subscribe to changes made to the user's conversations.
        this.conversationSubscription = this.conversationsApi.conversationsSubscription.subscribe(() => {
          //Recompute unread messages.
          this.computeUnreadMessages();
        });

        //Subscribe to changes made to the user's conversations.
        this.groupSubscription = this.groupsApi.groupsSubscription.subscribe(() => {
          //Recompute unread messages.
          this.computeUnreadMessages();
        });

        //Subscribe to push notifications deeplink and do appropriate action based on the notification the user tapped.
        this.notificationSubscription = this.notification.subscription.subscribe((res: any) => {
          let data = JSON.parse(JSON.stringify(res));
          if (data.requested) {
            //Go to contact requests page.
            this.app.getRootNav().popToRoot().then(() => {
              this.tabs.select(1);
              let modal = this.modalCtrl.create('ContactRequestsPage');
              modal.present();
            });
          } else if (data.accepted) {
            //Go to contacts page.
            this.app.getRootNav().popToRoot().then(() => {
              this.tabs.select(1);
            });
          } else if (data.conversationId) {
            let members = JSON.parse(data.members);
            //Open conversation
            this.app.getRootNav().popToRoot().then(() => {
              this.tabs.select(0);
              this.app.getRootNav().push('ChatPage', { conversationId: data.conversationId, members: members });
            });
          } else if (data.groupId) {
            let members = JSON.parse(data.members);
            //Open group
            this.app.getRootNav().popToRoot().then(() => {
              this.tabs.select(0);
              this.app.getRootNav().push('ChatPage', { groupId: data.groupId, members: members });
            });
          }
        });

        this.user = this.usersApi.getCurrentUser();
        this.computeUnreadMessages();
      }
    });
  }


  //Compute for the unread messages based on the user's conversations and groups.
  private computeUnreadMessages(): void {
    this.unreadMessages = 0;
    if (this.user && this.user.conversations) {
      let userIds = Object.keys(this.user.conversations);
      //Get all conversation of the user.
      for (let i = 0; i < userIds.length; i++) {
        let userId = userIds[i];
        let conversationId = this.user.conversations[userId].conversationId;
        let conversation = this.conversationsApi.getConversation(conversationId);
        if (conversation && conversation.messages) {
          //Compute for unread messages.
          this.unreadMessages += conversation.messages.length - this.user.conversations[userId].messagesRead;
        }
      }
    }
    if (this.user && this.user.groups) {
      let groupIds = Object.keys(this.user.groups);
      //Get all group of the user.
      for (let i = 0; i < groupIds.length; i++) {
        let groupId = groupIds[i];
        let group = this.groupsApi.getGroup(groupId);
        if (group && group.messages) {
          //Compute for unread messages.
          this.unreadMessages += group.messages.length - this.user.groups[groupId].messagesRead;
        }
      }
    }
    this.notification.unreadMessages = this.unreadMessages;
  }

  //Return requestsReceived by the user.
  private getRequestsReceived(): number {
    if (this.user && this.user.requestsReceived) {
      return this.user.requestsReceived.length;
    }
    return null;
  }

  //Return the unread messages if there are any.
  private getUnreadMessages(): number {
    if (this.unreadMessages == 0)
      return null;
    else
      return this.unreadMessages;
  }

  ionViewWillLeave() {
    if (this.notificationSubscription)
      this.notificationSubscription.unsubscribe();

       //Clear subscription when the user logged out.
    if (!firebase.auth().currentUser) {
      if (this.userSubscription)
        this.userSubscription.unsubscribe();
      if (this.conversationSubscription)
        this.conversationSubscription.unsubscribe();
      if (this.groupSubscription)
        this.groupSubscription.unsubscribe();
      if (this.notificationSubscription)
        this.notificationSubscription.unsubscribe();
    }
  }
  
}

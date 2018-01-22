import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { User, Conversation, UserConversation, Group, UserGroup } from '../models';
import 'rxjs/add/operator/take';
import { AuthMessageProvider } from '../providers';
import * as firebase from 'firebase';

@Injectable()
export class DatabaseMessageProvider {

  constructor(private database: AngularFireDatabase, private auth: AuthMessageProvider) {
    console.log("Initializing Database Provider");
  }

  public exists(query: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.database.object(query).take(1).subscribe((obj) => {
        if (obj.$exists()) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  public getUserById(userId: string): FirebaseObjectObservable<any> {
    return this.database.object('users/' + userId);
  }

  public getUsers(): FirebaseListObservable<any> {
    return this.database.list('/users', {
      query: {
        orderByChild: 'firstName'
      }
    });
  }

  public getUsersTyping(groupId: string): FirebaseListObservable<any> {
    return this.database.list('/users', {
      query: {
        orderByChild: 'isTyping',
        equalTo: groupId
      }
    });
  }

  public getUserByUserName(userName: string): FirebaseListObservable<any> {
    return this.database.list('/users', {
      query: {
        orderByChild: 'userName',
        equalTo: userName
      }
    });
  }

  public getConversations(): FirebaseListObservable<any> {
    return this.database.list('conversations');
  }

  public getConversationById(conversationId: string): FirebaseObjectObservable<any> {
    return this.database.object('conversations/' + conversationId);
  }

  public getGroups(): FirebaseListObservable<any> {
    return this.database.list('groups');
  }

  public getGroupById(groupId: string): FirebaseObjectObservable<any> {
    return this.database.object('groups/' + groupId);
  }

  public setUserConversation(senderId: string, receiverId: string, userConversation: UserConversation): Promise<any> {
    return new Promise(resolve => {
      this.database.object('users/' + senderId + '/conversations/' + receiverId).set(userConversation).then(() => {
        resolve();
      });
    });
  }

  public setUserGroup(userId: string, groupId: string, userGroup: UserGroup): Promise<any> {
    return new Promise(resolve => {
      this.database.object('users/' + userId + '/groups/' + groupId).set(userGroup).then(() => {
        resolve();
      });
    });
  }

  public setUser(user: User): Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.object('users/' + user.userId).set(user).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public setUserOnline(online: boolean): Promise<any> {
    return new Promise(resolve => {
      this.auth.getUser().then((user: firebase.User) => {
        let userId = user.uid;
        this.getUserById(userId).take(1).subscribe((user) => {
          if (user.$exists()) {
            this.getUserById(userId).update({
              online: online
            }).then(() => {
              resolve();
            }).catch(() => {
              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    });
  }

  public setPushToken(userId, token): void {
    this.database.list('/users', {
      query: {
        orderByChild: 'pushToken',
        equalTo: token
      }
    }).take(1).subscribe((users) => {
      if (users.length > 0) {
        this.database.object('users/' + users[0].$key).update({
          pushToken: ''
        });
      }
      this.database.object('users/' + userId).update({
        pushToken: token
      });
    });
  }

  public removePushToken(userId): void {
    this.database.object('users/' + userId).update({
      pushToken: ''
    });
  }

  public sendRequest(senderId: string, receiverId: string): Promise<any> {
    return new Promise(resolve => {
      this.getUserById(senderId).take(1).subscribe((sender: User) => {
        let sent = sender.requestsSent;
        if (sent) {
          sent.push(receiverId);
        } else {
          sent = [receiverId];
        }
        this.getUserById(senderId).update({
          requestsSent: sent
        }).then(() => {
          this.getUserById(receiverId).take(1).subscribe((receiver: User) => {
            let receive = receiver.requestsReceived;
            if (receive) {
              receive.push(senderId);
            } else {
              receive = [senderId];
            }
            this.getUserById(receiverId).update({
              requestsReceived: receive
            }).then(() => {
              resolve();
            });
          });
        });
      });
    });
  }

  public cancelRequest(senderId: string, receiverId: string): Promise<any> {
    return new Promise<any>(resolve => {
      this.getUserById(senderId).take(1).subscribe((sender: User) => {
        let sent = sender.requestsSent;
        if (sent) {
          sent.splice(sent.indexOf(receiverId), 1);
        }
        this.getUserById(senderId).update({
          requestsSent: sent
        }).then(() => {
          this.getUserById(receiverId).take(1).subscribe((receiver: User) => {
            let receive = receiver.requestsReceived;
            if (receive) {
              receive.splice(receive.indexOf(senderId), 1);
            }
            this.getUserById(receiverId).update({
              requestsReceived: receive
            }).then(() => {
              resolve();
            });
          });
        });
      });
    });
  }

  public addContact(firstUserId: string, secondUserId: string): Promise<any> {
    return new Promise<any>(resolve => {
      this.getUserById(firstUserId).take(1).subscribe((firstUser: User) => {
        let contacts = firstUser.contacts;
        if (contacts) {
          contacts.push(secondUserId);
        } else {
          contacts = [secondUserId];
        }
        this.getUserById(firstUserId).update({
          contacts: contacts
        }).then(() => {
          this.getUserById(secondUserId).take(1).subscribe((secondUser: User) => {
            let contacts = secondUser.contacts;
            if (contacts) {
              contacts.push(firstUserId);
            } else {
              contacts = [firstUserId];
            }
            this.getUserById(secondUserId).update({
              contacts: contacts
            }).then(() => {
              resolve();
            });
          });
        });
      });
    });
  }

  public addConversation(conversation: Conversation): Promise<string> {
    return new Promise<string>(resolve => {
      this.getConversations().push(conversation).then(res => {
        resolve(res.key);
      });
    });
  }

  public setMessagesRead(userId: string, partnerId: string, messagesCount: number) {
    this.database.object('users/' + userId + '/conversations/' + partnerId).take(1).subscribe((userConversation: UserConversation) => {
      this.getConversationById(userConversation.conversationId).take(1).subscribe((conversation: Conversation) => {
        let messages = conversation.messages.length;
        if (messagesCount <= messages) {
          this.database.object('users/' + userId + '/conversations/' + partnerId).update({
            messagesRead: messagesCount
          });
        } else {
          this.database.object('users/' + userId + '/conversations/' + partnerId).update({
            messagesRead: messages
          });
        }
      });
    });
  }

  public setGroupMessagesRead(userId: string, groupId: string, messagesCount: number) {
    this.getGroupById(groupId).take(1).subscribe(group => {
      if (group.$exists()) {
        if (group.members.indexOf(userId) > -1) {
          this.getGroupById(groupId).take(1).subscribe((group: Group) => {
            let messages = group.messages.length;
            if (messagesCount <= messages) {
              this.database.object('users/' + userId + '/groups/' + groupId).update({
                messagesRead: messagesCount
              });
            } else {
              this.database.object('users/' + userId + '/groups/' + groupId).update({
                messagesRead: messages
              });
            }
          });
        }
      }
    });
  }

  public addGroup(group: Group): Promise<string> {
    return new Promise<string>(resolve => {
      this.getGroups().push(group).then(res => {
        resolve(res.key);
      });
    });
  }

  public addUserToGroup(groupId: string, userId: string): Promise<any> {
    return new Promise<any>(resolve => {
      this.getGroupById(groupId).take(1).subscribe((group: Group) => {
        let members = group.members;
        members.push(userId);
        this.getGroupById(groupId).update({
          members: members
        }).then(() => {
          let userGroup = new UserGroup(groupId, 0);
          this.setUserGroup(userId, groupId, userGroup).then(() => {
            resolve(userId);
          });
        });
      });
    });
  }

  public removeUserFromGroup(groupId: string, userId: string): Promise<any> {
    return new Promise<any>(resolve => {
      this.getGroupById(groupId).take(1).subscribe((group: Group) => {
        let members = group.members;
        members.splice(members.indexOf(userId), 1);
        this.getGroupById(groupId).update({
          members: members
        }).then(() => {
          this.getUserById(userId).take(1).subscribe((user: User) => {
            let groups = user.groups;
            groups[groupId] = null;
            this.getUserById(userId).update({
              groups: groups
            }).then(() => {
              resolve();
            });
          });
        });
      });
    });
  }

  public deleteGroup(groupId: string): Promise<any> {
    return new Promise<any>(resolve => {
      this.getGroupById(groupId).set(null).then(() => {
        resolve();
      });
    });
  }

  public setUserNotifications(userId: string, notifications: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getUserById(userId).take(1).subscribe((user) => {
        if (user.$exists()) {
          this.getUserById(userId).update({
            notifications: notifications
          }).then(() => {
            resolve();
          }).catch(error => {
            reject();
          });
        } else {
          reject();
        }
      });
    });
  }

  public setIsTyping(isTyping: string): void {
    this.auth.getUser().then((user: firebase.User) => {
      let userId = user.uid;
      this.getUserById(userId).take(1).subscribe((user) => {
        if (user.$exists()) {
          this.getUserById(userId).update({
            isTyping: isTyping
          });
        }
      });
    });
  }
}

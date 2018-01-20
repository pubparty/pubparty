import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { User, Event } from '../models';
import 'rxjs/add/operator/take';

@Injectable()
export class DatabaseProvider {

  constructor(private database: AngularFireDatabase) {
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

  public getUserByUserName(userName: string): FirebaseListObservable<any> {
    return this.database.list('/users', {
      query: {
        orderByChild: 'userName',
        equalTo: userName
      }
    });
  }

  public getUsers(): FirebaseListObservable<any> {
    return this.database.list('/users', {
      query: {
        orderByChild: 'firstName'
      }
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

  public addEvent(event: Event): Promise<string> {
    return new Promise<string>(resolve => {
      this.getEvents().push(event).then(res => {
        resolve(res.key);
      });
    });
  }

  public getEvents(): FirebaseListObservable<any> {
    return this.database.list('/events');
  }

  public getEventById(eventId: string): FirebaseObjectObservable<any> {
    return this.database.object('events/' + eventId);
  }

  public setEvent(event: Event): Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.object('events/' + event.eventId).set(event).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public sendJoinRequest(eventId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.object('events/' + eventId).take(1).subscribe((event: Event) => {
        let userRequests = event.userRequests;
        if (userRequests) {
          if (userRequests.indexOf(userId) == -1)
            userRequests.push(userId);
        } else {
          userRequests = [userId];
        }
        this.database.object('events/' + eventId).update({
          userRequests: userRequests
        }).then(() => {
          this.database.object('users/' + userId).take(1).subscribe((user: User) => {
            let eventRequests = user.eventRequests;
            if (eventRequests) {
              if (eventRequests.indexOf(eventId) == -1)
                eventRequests.push(eventId);
            } else {
              eventRequests = [eventId];
            }
            this.database.object('users/' + userId).update({
              eventRequests: eventRequests
            }).then(() => {
              resolve();
            });
          });
        }).catch(error => {
          reject(error);
        });
      });
    });
  }

  public cancelJoinRequest(eventId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.object('events/' + eventId).take(1).subscribe((event: Event) => {
        // let userRequests = event.userRequests;
        if (event.userRequests) {
          let index = event.userRequests.indexOf(userId);
          event.userRequests.splice(index, 1);
          this.database.object('events/' + eventId).update({
            userRequests: event.userRequests
          }).then(() => {
            this.database.object('users/' + userId).take(1).subscribe((user: User) => {
              if (user.eventRequests) {
                let index = user.eventRequests.indexOf(eventId);
                user.eventRequests.splice(index, 1);
                this.database.object('users/' + userId).update({
                  eventRequests: user.eventRequests
                }).then(() => {
                  resolve();
                });
              }
            });
          }).catch(error => {
            reject(error);
          });
        } else {
          reject();
        }
      });
    });
  }

  public inviteUser(eventId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.object('events/' + eventId).take(1).subscribe((event: Event) => {
        let userInvites = event.userInvites;
        if (userInvites) {
          if (userInvites.indexOf(userId) == -1)
            userInvites.push(userId);
        } else {
          userInvites = [userId];
        }
        this.database.object('events/' + eventId).update({
          userInvites: userInvites
        }).then(() => {
          this.database.object('users/' + userId).take(1).subscribe((user: User) => {
            let eventInvites = user.eventInvites;
            if (eventInvites) {
              if (eventInvites.indexOf(eventId) == -1)
                eventInvites.push(eventId);
            } else {
              eventInvites = [eventId];
            }
            this.database.object('users/' + userId).update({
              eventInvites: eventInvites
            }).then(() => {
              resolve();
            });
          });
        }).catch(error => {
          reject(error);
        });
      });
    });
  }

  public cancelInvite(eventId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.object('events/' + eventId).take(1).subscribe((event: Event) => {
        // let userRequests = event.userRequests;
        if (event.userInvites) {
          let index = event.userInvites.indexOf(userId);
          event.userInvites.splice(index, 1);
          this.database.object('events/' + eventId).update({
            userInvites: event.userInvites
          }).then(() => {
            this.database.object('users/' + userId).take(1).subscribe((user: User) => {
              if (user.eventInvites) {
                let index = user.eventInvites.indexOf(eventId);
                user.eventInvites.splice(index, 1);
                this.database.object('users/' + userId).update({
                  eventInvites: user.eventInvites
                }).then(() => {
                  resolve();
                });
              }
            });
          }).catch(error => {
            reject(error);
          });
        } else {
          reject();
        }
      });
    });
  }

  public acceptInvite(eventId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cancelInvite(eventId, userId).then(() => {
        this.database.object('events/' + eventId).take(1).subscribe((event: Event) => {
          let participants = event.participants;
          if (participants) {
            if (participants.indexOf(userId) == -1) {
              participants.push(userId);
            }
            this.database.object('events/' + eventId).update({
              participants: participants
            }).then(() => {
              resolve();
            }).catch(error => {
              reject(error);
            });
          } else {
            reject();
          }
        });
      });
    });
  }

  public acceptRequest(eventId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cancelJoinRequest(eventId, userId).then(() => {
        this.database.object('events/' + eventId).take(1).subscribe((event: Event) => {
          let participants = event.participants;
          if (participants) {
            if (participants.indexOf(userId) == -1) {
              participants.push(userId);
            }
            this.database.object('events/' + eventId).update({
              participants: participants
            }).then(() => {
              resolve();
            }).catch(error => {
              reject(error);
            });
          } else {
            reject();
          }
        });
      });
    });
  }
}

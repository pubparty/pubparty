import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { DatabaseMessageProvider } from './database-message';
import { ToastProvider } from './toast';
import { TranslateProvider } from './translate';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppConfig } from '../configs/app-config';
import { ToastConfig } from '../configs/toast-config';
import { FCM } from '@ionic-native/fcm';
import * as firebase from 'firebase';
import { User } from '../models';
import 'rxjs/add/operator/take';
import { Subject } from 'rxjs/Subject';
import { Badge } from '@ionic-native/badge';

@Injectable()
export class NotificationMessageProvider {
  public subscription: Subject<any>;
  public requestsReceived: number = 0;
  public unreadMessages: number = 0;
  constructor(private platform: Platform,
    private fcm: FCM,
    private database: DatabaseMessageProvider,
    private toast: ToastProvider,
    private translate: TranslateProvider,
    private badge: Badge,
    private http: Http) {
    this.subscription = new Subject<any>();
  }

  public init(): void {
    console.log("Initializing Notification Message Provider");
    if (this.platform.is('cordova')) {
      this.fcm.getToken().then(token => {
        console.log('Generated Token: ', JSON.stringify(token));
        //Set deviceToken on database, to receive push notifications.
        this.database.setPushToken(firebase.auth().currentUser.uid, token);
        //Update deviceToken on database, to receive push notifications.
        this.fcm.onTokenRefresh().subscribe(token => {
          this.database.setPushToken(firebase.auth().currentUser.uid, token);
        });
        //Listener when push notification is tapped.
        this.fcm.onNotification().subscribe(data => {
          if (data.wasTapped) {
            //Notification was received when app is minimized and tapped by the user.
            this.subscription.next(data);
            //Pass data to subscription used by tabs.ts
          } else {
            //Notification was received while the app is opened or in foreground. In case the user needs to be notified.
            if (data.requested) {
              let user: User = JSON.parse(data.requested);
              this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('PUSH_CONTACT_REQUEST'), ToastConfig.duration);
            } else if (data.accepted) {
              let user: User = JSON.parse(data.accepted);
              this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' ' + this.translate.get('PUSH_CONTACT_ACCEPTED'), ToastConfig.duration);
            }
          }
        });
      }).catch(error => {
        console.log('Error Saving Token: ', JSON.stringify(error));
      });
    }
  }

  public destroy(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        this.database.removePushToken(firebase.auth().currentUser.uid);
        resolve();
      } else {
        reject();
      }
    });
  }

  public sendPushNotification(user: User, title: string, message: string, data?: any): Promise<any> {
    let notifications;
    if (user.notifications) {
      notifications = user.notifications + 1;
    } else {
      notifications = 1;
    }
    return new Promise((resolve, reject) => {
      let postParams = {
        "notification": {
          "title": title,
          "body": message,
          "sound": "default",
          "click_action": "FCM_PLUGIN_ACTIVITY",
          "icon": "fcm_push_icon",
          "badge": notifications
        },
        //Pass your data here which will be processed on onNotification.
        "data": data,
        "to": user.pushToken,
        "priority": "high",
        "restricted_package_name": ""
      }
      var headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'key=' + AppConfig.gcmKey);
      let options = new RequestOptions({ headers: headers });
      this.http.post('https://fcm.googleapis.com/fcm/send', postParams, options).subscribe(response => {
        resolve(response);
        this.database.setUserNotifications(user.userId, notifications);
      }, error => {
        reject(error);
      });
    });
  }

  public setBadge(userId: string): void {
    let notifications = 0;
    notifications += this.requestsReceived;
    notifications += this.unreadMessages;
    this.database.setUserNotifications(userId, notifications);
    if (notifications > 0) {
      this.badge.set(notifications);
    } else {
      this.badge.clear();
    }
  }

  public resetBadge(): void {
    this.badge.clear().then(() => {
      this.requestsReceived = 0;
      this.unreadMessages = 0;
    });
  }
}

import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { DatabaseProvider } from './database';
import { ToastProvider } from './toast';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppConfig } from '../configs/app-config';
import { ToastConfig } from '../configs/toast-config';
import { FCM } from '@ionic-native/fcm';
import * as firebase from 'firebase';
import 'rxjs/add/operator/take';
import { User } from '../models';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NotificationProvider {
  public subscription: Subject<any>;
  private unreadCount: number;
  public requestsReceived: number = 0;
  constructor(private platform: Platform,
    private fcm: FCM,
    private database: DatabaseProvider,
    private toast: ToastProvider,
    private http: Http) {
    this.subscription = new Subject<any>();
  }

  public setUnread(unread: number): void {
    this.unreadCount = unread;
  }

  public getUnread(): number {
    if (this.unreadCount > 0) {
      return this.unreadCount;
    } else {
      return null;
    }
  }

  public init(): void {
    console.log("Initializing Notification Provider");
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
            this.subscription.next(data);
          }
          // this.database.getUserById(data.userId).take(1).subscribe(user => {
          //   if (data.wasTapped) {
          //     //Notification was received when app is minimized and tapped by the user.
          //     this.toast.showWithDuration('Opened the notification sent by ' + user.firstName + ' ' + user.lastName + '.', ToastConfig.duration);
          //   } else {
          //     //Notification was received while the app is opened or in foreground. In case the user needs to be notified.
          //     this.toast.showWithDuration(user.firstName + ' ' + user.lastName + ' has sent you a push notification.', ToastConfig.duration);
          //   }
          // });
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
    return new Promise((resolve, reject) => {
      let postParams = {
        "notification": {
          "title": title,
          "body": message,
          "sound": "default",
          "click_action": "FCM_PLUGIN_ACTIVITY",
          "icon": "fcm_push_icon"
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
        console.log("PUSH SUCCESS: " + response);
      }, error => {
        console.log("ERROR PUSH: " + error);
        reject(error);
      });
    });
  }
}

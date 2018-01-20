import { Component, ViewChild } from '@angular/core';
import { IonicPage, Tabs, App } from 'ionic-angular';
import { UsersApi, AuthProvider, NotificationProvider } from '../../providers';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild("tabs") tabs: Tabs;
  tab1Root: string = 'HomePage';
  tab2Root: string = 'MyEventsPage';
  tab3Root: string = 'ProfilePage';
  private notificationSubscription: Subscription;

  constructor(private app: App, private usersApi: UsersApi, private auth: AuthProvider, private notification: NotificationProvider) {
  }

  ionViewDidLoad() {
    this.auth.getUser().then((user: firebase.User) => {
      if (!this.usersApi.subscriptions.get(user.uid)) {
        this.app.getRootNav().setRoot('LoaderPage');
      }
    });

    this.notificationSubscription = this.notification.subscription.subscribe((res: any) => {
      let data = JSON.parse(JSON.stringify(res));
      if (data.eventId) {
        this.app.getRootNav().popToRoot().then(() => {
          this.tabs.select(1);
          this.app.getRootNav().push('EventPage', { eventId: data.eventId });
        });
      }
    });
  }

  ionViewWillLeave() {
    if (this.notificationSubscription)
      this.notificationSubscription.unsubscribe();
  }
}

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../models';
import { LoadingProvider, DatabaseProvider, NetworkProvider } from '../../providers';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class UsersApi {
  public loaded: boolean;
  private users: User[];
  private usersIndexMap: Map<string, number>;

  private subscriptionMap: Map<string, Subscription>;
  public subscriptions: Map<string, Subject<User>>;

  private subscription: Subscription;
  private networkSubscription: Subscription;

  public usersSubscription: Subject<User[]> = new Subject<User[]>();

  constructor(private database: DatabaseProvider, private network: NetworkProvider, private loading: LoadingProvider) {
    console.log("Initializing UsersAPI");
    this.networkSubscription = this.network.subscription.subscribe((connected: boolean) => {
      if (connected && !this.loaded) {
        var self = this;
        setTimeout(function() {
          self.init();
        }, 1000);
      }
    });

    this.usersSubscription = new Subject<User[]>();
    this.usersIndexMap = new Map<string, number>();

    this.subscriptionMap = new Map<string, Subscription>();
    this.subscriptions = new Map<string, Subject<User>>();
  }

  public init(): Promise<any> {
    return new Promise(resolve => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      } else {
        this.loading.show();
      }

      this.subscription = this.database.getUsers().subscribe((users: User[]) => {
        this.users = users;
        this.usersSubscription.next(this.users);
        for (let i = 0; i < this.users.length; i++) {
          let userId = this.users[i].userId;
          this.usersIndexMap.set(userId, i);

          if (!this.subscriptionMap.get(userId)) {
            this.subscriptions.set(userId, new Subject<User>());
            let subscription = this.database.getUserById(userId).subscribe((user: User) => {
              this.subscriptions.get(userId).next(user);
            });
            this.subscriptionMap.set(userId, subscription);
          }
        }
        this.loaded = true;
        this.loading.hide();
        resolve();
      });
    });
  }

  public getCurrentUser(): User {
    if (this.loaded)
      return this.users[this.usersIndexMap.get(firebase.auth().currentUser.uid)];
    else
      return null;
  }

  public getUser(userId: string): User {
    if (this.loaded)
      return this.users[this.usersIndexMap.get(userId)];
    else
      return null;
  }

  public getUsers(): User[] {
    if (this.loaded)
      return this.users;
    else
      return null;
  }
}

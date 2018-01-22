import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Group } from '../../models';
import { LoadingProvider, DatabaseMessageProvider } from '../../providers';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class GroupsApi {
  private groupMap: Map<string, Group>;
  private subscriptionMap: Map<string, Subscription>;
  public groupsSubscription: Subject<number>;
  public subscriptions: Map<string, Subject<Group>>;

  constructor(private database: DatabaseMessageProvider, private loading: LoadingProvider) {
    console.log("Initializing GroupsAPI");
    this.subscriptionMap = new Map<string, Subscription>();
    this.groupMap = new Map<string, Group>();
    this.groupsSubscription = new Subject<number>();
    this.subscriptions = new Map<string, Subject<Group>>();
  }

  public subscribeToGroup(groupId: string): void {
    if (!this.subscriptionMap.get(groupId)) {
      this.subscriptions.set(groupId, new Subject<Group>());
      let subscription = this.database.getGroupById(groupId).subscribe((group: Group) => {
        this.groupMap.set(groupId, group);
        this.subscriptions.get(groupId).next(group);
        this.groupsSubscription.next(this.subscriptionMap.size);
      });
      this.subscriptionMap.set(groupId, subscription);
    }
  }

  public unsubscribeToGroup(groupId: string): void {
    if (this.subscriptionMap.get(groupId))
      this.subscriptionMap.get(groupId).unsubscribe();
    this.subscriptionMap.delete(groupId);
    this.subscriptions.delete(groupId);
    this.groupMap.delete(groupId);
  }

  public getGroup(groupId: string): Group {
    return this.groupMap.get(groupId);
  }

  public destroy(): void {
    //Clear subscriptions when the user logged out.
    if (this.subscriptionMap) {
      this.subscriptionMap.forEach((value: Subscription, key: string) => {
        value.unsubscribe();
      });
      this.subscriptionMap.clear();
    }
    if (this.groupMap)
      this.groupMap.clear();
    if (this.subscriptions)
      this.subscriptions.clear();
  }
}

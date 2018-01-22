import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Conversation } from '../../models';
import { LoadingProvider, DatabaseMessageProvider } from '../../providers';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ConversationsApi {
  private conversationMap: Map<string, Conversation>;
  private subscriptionMap: Map<string, Subscription>;
  public conversationsSubscription: Subject<number>;
  public subscriptions: Map<string, Subject<Conversation>>;

  constructor(private database: DatabaseMessageProvider, private loading: LoadingProvider) {
    console.log("Initializing ConversationsAPI");
    this.subscriptionMap = new Map<string, Subscription>();
    this.conversationMap = new Map<string, Conversation>();
    this.conversationsSubscription = new Subject<number>();
    this.subscriptions = new Map<string, Subject<Conversation>>();
  }

  public subscribeToConversation(conversationId: string): void {
    if (!this.subscriptionMap.get(conversationId)) {
      this.subscriptions.set(conversationId, new Subject<Conversation>());
      let subscription = this.database.getConversationById(conversationId).subscribe((conversation: Conversation) => {
        this.conversationMap.set(conversationId, conversation);
        this.subscriptions.get(conversationId).next(conversation);
        this.conversationsSubscription.next(this.conversationMap.size);
      });
      this.subscriptionMap.set(conversationId, subscription);
    }
  }

  public getConversation(conversationId: string): Conversation {
    return this.conversationMap.get(conversationId);
  }

  public destroy(): void {
    //Clear subscriptions when the user logged out.
    if (this.subscriptionMap) {
      this.subscriptionMap.forEach((value: Subscription, key: string) => {
        value.unsubscribe();
      });
      this.subscriptionMap.clear();
    }
    if (this.conversationMap)
      this.conversationMap.clear();
    if (this.subscriptions)
      this.subscriptions.clear();
  }
}

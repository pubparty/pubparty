import { Injectable, Pipe } from '@angular/core';
import { Conversation } from '../models';
import { UsersApi } from '../providers';

@Pipe({
  name: 'recentConversations',
  pure: false
})
@Injectable()
export class RecentConversationsPipe {

  constructor(public usersApi: UsersApi) { }

  //Order conversations from the most recent ones. Arguments: [limit, search]
  //Limit = limits the number of conversations to show.
  //Search = search for conversation partner's firstName, lastName, or userName and show the conversation.
  transform(conversations: Conversation[], args: [number, string]): any {
    let limit = args[0];
    let term = args[1];
    if (!conversations) {
      return;
    } else {
      let sorted = conversations.sort(function(a, b) {
        let date1 = new Date(a.messages[a.messages.length - 1].date);
        let date2 = new Date(b.messages[b.messages.length - 1].date);

        if (date1 > date2) {
          return 1;
        } else if (date1 < date2) {
          return -1;
        } else {
          return 0;
        }
      }).reverse();
      if (term) {
        term = term.toLowerCase();
        return sorted.filter((conversation: Conversation) => this.usersApi.getUser(conversation.partnerId).firstName.toLowerCase().indexOf(term) > -1 || this.usersApi.getUser(conversation.partnerId).lastName.toLowerCase().indexOf(term) > -1 || this.usersApi.getUser(conversation.partnerId).userName.toLowerCase().indexOf(term) > -1);
      } else {
        return sorted.slice(0, limit);
      }
    }
  }
}

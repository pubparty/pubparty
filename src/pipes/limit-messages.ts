import { Injectable, Pipe } from '@angular/core';
import { Message } from '../models';

@Pipe({
  name: 'limitMessages',
  pure: false
})
@Injectable()
export class LimitMessagesPipe {
  //Limit the number of messages to show.
  //Used by chat.html to limit the number of messages shown to the user. Pulling down increases the limit to show previous messages.
  transform(messages: Message[], limit?: number): any {
    if (!messages) {
      return;
    } else {
      let start = messages.length - limit;
      if (start >= 0)
        return messages.slice(start, messages.length);
      else
        return messages.slice(0, messages.length);
    }
  }
}

import { Injectable, Pipe } from '@angular/core';
import { Event } from '../models';
import { UsersApi } from '../providers';

@Pipe({
  name: 'openEvents',
  pure: false
})
@Injectable()
export class OpenEventsPipe {

  constructor(private usersApi: UsersApi) { }

  transform(events: Event[]): any {
    if (!events) {
      return;
    } else {
      let sorted = events.sort(function(a, b) {
        let date1 = new Date(a.date);
        let date2 = new Date(b.date);

        if (date1 > date2) {
          return 1;
        } else if (date1 < date2) {
          return -1;
        } else {
          return 0;
        }
      });
      // return sorted;
      return sorted.filter((event: Event) => event.participants.indexOf(this.usersApi.getCurrentUser().userId) == -1);
    }
  }
}

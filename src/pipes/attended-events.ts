import { Injectable, Pipe } from '@angular/core';
import { Event } from '../models';
import { UsersApi } from '../providers';

@Pipe({
  name: 'attendedEvents',
  pure: false
})
@Injectable()
export class AttendedEventsPipe {
  constructor(private usersApi: UsersApi) { }

  transform(events: Event[], args: [number, string]): any {
    let limit = args[0];
    let term = args[1];
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
      if (term) {
        term = term.toLowerCase();
        return sorted.filter((event: Event) => event.title.toLowerCase().indexOf(term) > -1 && event.participants.indexOf(this.usersApi.getCurrentUser().userId) > -1);
      } else {
        if (limit > -1) {
          return sorted.filter((event: Event) => event.participants.indexOf(this.usersApi.getCurrentUser().userId) > -1).slice(0, limit);
        } else {
          return sorted.filter((event: Event) => event.participants.indexOf(this.usersApi.getCurrentUser().userId) > -1);
        }
      }
    }
  }
}

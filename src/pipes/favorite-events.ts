import { Injectable, Pipe } from '@angular/core';
import { Event } from '../models';
import { UsersApi } from '../providers';

@Pipe({
  name: 'favoriteEvents',
  pure: false
})
@Injectable()
export class FavoriteEventsPipe {
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
      return sorted.filter((event: Event) => this.usersApi.getCurrentUser().favorites && this.usersApi.getCurrentUser().favorites.indexOf(event.eventId) > -1);
    }
  }
}

import { Injectable, Pipe } from '@angular/core';
import { Group } from '../models';

@Pipe({
  name: 'recentGroups',
  pure: false
})
@Injectable()
export class RecentGroupsPipe {
  //Order groups from the most recent ones. Arguments: [limit, search]
  //Limit = limits the number of groups to show.
  //Search = search for group's name and show the group.
  transform(groups: Group[], args: [number, string]): any {
    let limit = args[0];
    let term = args[1];
    if (!groups) {
      return;
    } else {
      let sorted = groups.sort(function(a, b) {
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
        return sorted.filter((group: Group) => group.name.toLowerCase().indexOf(term) > -1);
      } else {
        return sorted.slice(0, limit);
      }
    }
  }
}

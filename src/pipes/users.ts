import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { User } from '../models/user';

@Pipe({
  name: 'usersFilter',
  pure: false
})
@Injectable()
export class UsersPipe implements PipeTransform {
  transform(users: User[], args: [string, string[]]): any {
    let term = args[0];
    let excludedIds = args[1];
    if (!users) {
      return;
    } else if (!excludedIds) {
      return users;
    } else if (excludedIds && !term) {
      return users.filter((user: User) => excludedIds.indexOf(user.userId) == -1);
    } else {
      term = term.toLowerCase();
      return users.filter((user: User) => excludedIds.indexOf(user.userId) == -1 && (user.firstName.toLowerCase().indexOf(term) > -1 || user.lastName.toLowerCase().indexOf(term) > -1 || user.userName.toLowerCase().indexOf(term) > -1));
    }
  }
}

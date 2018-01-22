import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'limit',
  pure: false
})
@Injectable()
export class LimitPipe {
  //Limit the number of object to show from the list.
  transform(list: any, limit?: number): any {
    if (!list) {
      return;
    } else {
      return list.slice(0, limit);
    }
  }
}

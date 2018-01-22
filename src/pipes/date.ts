import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateFormat',
  pure: false
})
@Injectable()
export class DatePipe implements PipeTransform {
  // Show moment.js dateFormat for time elapsed.
  transform(date: any, args?: any): any {
    return moment(new Date(date)).fromNow();
  }
}

import { NgModule } from '@angular/core';
import { UsersPipe } from './users';
import { FromNowPipe } from './from-now';
import { OpenEventsPipe } from './open-events';
import { TrendingEventsPipe } from './trending-events';
import { AttendedEventsPipe } from './attended-events';
import { HostedEventsPipe } from './hosted-events';
import { FavoriteEventsPipe } from './favorite-events';
import { UserAttendedPipe } from './user-attended';

@NgModule({
  declarations: [
    UsersPipe,
    FromNowPipe,
    OpenEventsPipe,
    TrendingEventsPipe,
    AttendedEventsPipe,
    HostedEventsPipe,
    FavoriteEventsPipe,
    UserAttendedPipe
  ],
  imports: [

  ],
  exports: [
    UsersPipe,
    FromNowPipe,
    OpenEventsPipe,
    TrendingEventsPipe,
    AttendedEventsPipe,
    HostedEventsPipe,
    FavoriteEventsPipe,
    UserAttendedPipe
  ]
})
export class PipesModule { }

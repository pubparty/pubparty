import { NgModule } from '@angular/core';
import { UsersPipe } from './users';
import { FromNowPipe } from './from-now';
import { OpenEventsPipe } from './open-events';
import { TrendingEventsPipe } from './trending-events';
import { AttendedEventsPipe } from './attended-events';
import { HostedEventsPipe } from './hosted-events';
import { FavoriteEventsPipe } from './favorite-events';
import { UserAttendedPipe } from './user-attended';
import { DatePipe } from './date';
import { RecentConversationsPipe } from './recent-conversations';
import { RecentGroupsPipe } from './recent-groups';
import { LimitMessagesPipe } from './limit-messages';
import { LimitPipe } from './limit';

@NgModule({
  declarations: [
    UsersPipe,
    FromNowPipe,
    OpenEventsPipe,
    TrendingEventsPipe,
    AttendedEventsPipe,
    HostedEventsPipe,
    FavoriteEventsPipe,
    UserAttendedPipe,
    DatePipe,
    RecentConversationsPipe,
    RecentGroupsPipe,
    LimitMessagesPipe,
    LimitPipe
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
    UserAttendedPipe,
    DatePipe,
    RecentConversationsPipe,
    RecentGroupsPipe,
    LimitMessagesPipe,
    LimitPipe
  ]
})
export class PipesModule { }

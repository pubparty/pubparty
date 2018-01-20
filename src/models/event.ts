import { Location } from './location';

export class Event {
  constructor(
    public eventId: string,
    public hostId: string,
    public title: string,
    public images: string[],
    public description: string,
    public rules: string,
    public date: string,
    public location: Location,
    public direction: string,
    public notes: string,
    public participants: string[],
    public userRequests: string[], //userIds of user who requested to join
    public userInvites: string[] //userIds of users who are invited
  ) { }
}

import { UserConversation } from './user-conversation';
import { UserGroup } from './user-group';

export class User {
  constructor(
    public userId: string,
    public userName: string,
    public firstName: string,
    public lastName: string,
    public profilePic: string,
    public email: string,
    public number: string,
    public about: string,
    public favorites: string[],
    public pushToken: string,
    public eventInvites: string[],
    public eventRequests: string[],
    public requestsReceived: string[],
    public requestsSent: string[],
    public contacts: string[],
    public conversations: UserConversation[],
    public groups: UserGroup[],
    public online: boolean,
    public notifications: number,
    public isTyping: string
  ) { }
}

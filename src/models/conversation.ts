import { Message } from './message';

export class Conversation {
  constructor(
    public members: string[],
    public messages: Message[],
    public conversationId: string,
    public partnerId: string
  ) { }
}

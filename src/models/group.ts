import { Message } from './message';

export class Group {
  constructor(
    public name: string,
    public members: string[],
    public messages: Message[],
    public groupId: string,
    public image: string
  ) { }
}

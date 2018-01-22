export class Message {
  constructor(
    public sender: string,
    public text: string,
    public url: string,
    public type: string,
    public date: string
  ) { }
}

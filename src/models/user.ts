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
    public eventRequests: string[]
  ) { }
}

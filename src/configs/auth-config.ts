export namespace AuthConfig {
  //Auth Configuration.
  //Set to your Firebase app, you can find your credentials on Firebase app console -> Add Web App.
  export const firebaseConfig = {
    apiKey: "AIzaSyBzSoFszcskhtF3e2qoktjDUGDbg4MIRzc",
    authDomain: "pubparty-914.firebaseapp.com",
    databaseURL: "https://pubparty-914.firebaseio.com",
    projectId: "pubparty-914",
    storageBucket: "pubparty-914.appspot.com",
    messagingSenderId: "85544574838"
  };
  //You can find your googleWebClientId on your Firebase app console -> Authentication -> Sign-in Method -> Google -> Web client ID
  export const googleWebClientId: string = '691061870789-j9oo7o010irp0ao7v66pr0e001k85ogn.apps.googleusercontent.com';
  //Set to true if you want to enable email verifications.
  export const emailVerification: boolean = false;
}

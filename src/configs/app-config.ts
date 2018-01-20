export namespace AppConfig {
  //App Configuration.
  //You can set your app configurations here.
  //For the list of config options, please refer to https://ionicframework.com/docs/api/config/Config/
  export const config = {
    mode: 'ios' //Force app to have the iOS look and feel even when on other platforms.
  };
  //Default language to use.
  export const defaultLanguage = 'en';
  //Firebase Cloud Messaging Server Key.
  //Get your gcmKey on https://console.firebase.google.com, under Overview -> Project Settings -> Cloud Messaging.
  //This is needed to send push notifications.
  export const gcmKey = 'AAAAoOZ_UMU:APA91bHpRO4h64VGJ5_pvruaUbEX5-1g9b1v9ON3514JY6slA2I7QeujArGcJluPwXvJV4OyXk4LSViTMI_1JsEFHK7gQplrlIGAmHJicZetjPh9JTcKHKDqXeqmc8fOnG3RLs_aafnE';
}

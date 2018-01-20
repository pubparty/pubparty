import { Injectable } from '@angular/core';

@Injectable()
export class TranslateProvider {
  private translations: any;

  constructor() {
    console.log("Initializing Translate Provider");
  }

  public setTranslations(translations: any): void {
    this.translations = translations;
  }

  public getTranslations(): any {
    return this.translations;
  }

  public get(key: string): string {
    return this.translations[key];
  }

}

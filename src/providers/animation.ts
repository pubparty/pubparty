import { Injectable } from '@angular/core';

@Injectable()
export class AnimationProvider {

  constructor() {
    console.log("Initializing Animation Provider");
  }

  public animate(element: Element, animateClass: string): void {
    element.className = '';
    setTimeout(function() {
      element.className = animateClass;
    }, 0);
  }
}

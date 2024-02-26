import { Directive, HostListener, HostBinding, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMenudropdown]',
})
export class MenudropdownDirective {
  @HostBinding('class.open') isOpen = false;

  @HostListener('click') toggleOpen() {
    const elements: any = document.getElementsByClassName('menu-item');
    const parentElm = this.renderer.parentNode(this.elRef.nativeElement);
    const elm = this.elRef.nativeElement;
    if (elm.classList.contains('open')) {
      this.renderer.removeClass(elm, 'open');
      this.isOpen = !this.isOpen;
    } else {
      for (const elem of elements) {
        elem.classList.remove('open');
      }
      if (elm.classList.contains('hasMenu')) {
        this.renderer.addClass(elm, 'open');
        this.isOpen = true;
      }
    }
  }

  constructor(private elRef: ElementRef, private renderer: Renderer2) {

  }

}

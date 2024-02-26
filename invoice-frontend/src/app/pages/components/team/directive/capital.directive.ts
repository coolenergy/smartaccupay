import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[capitalOnly]'
})
export class CapitalTeamDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value;
    var rg = /(^\w{1}|\.\s*\w{1})/gi;
    this._el.nativeElement.value = initalValue.replace(rg, function (toReplace: any) {
      return toReplace.toUpperCase();
    });
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}



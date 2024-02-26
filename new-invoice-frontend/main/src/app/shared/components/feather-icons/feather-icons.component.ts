import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-feather-icons',
  templateUrl: './feather-icons.component.html',
  styleUrls: ['./feather-icons.component.scss'],
})
export class FeatherIconsComponent {
  @Input() public icon?: string;
  @Input() public class?: string;
  constructor() {
    // constructor
  }
}

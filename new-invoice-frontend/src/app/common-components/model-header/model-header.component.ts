import { Component, EventEmitter, Input, Output } from '@angular/core';
import { icon } from 'src/consts/icon';

@Component({
  selector: 'app-model-header',
  templateUrl: './model-header.component.html',
  styleUrls: ['./model-header.component.scss']
})
export class ModelHeaderComponent {
  @Input() title!: string;
  @Output() dialogClose = new EventEmitter();
  invoice_logo = icon.INVOICE_LOGO;

}

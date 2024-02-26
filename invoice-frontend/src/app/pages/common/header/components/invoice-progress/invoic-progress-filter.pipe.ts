import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressFilter'
})
export class InvoicProgressFilterPipe implements PipeTransform {
  transform(value: Number, ...args: unknown[]): unknown {
    return value.toFixed(2);
  }

}

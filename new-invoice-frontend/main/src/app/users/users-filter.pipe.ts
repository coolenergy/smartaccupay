import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'empListFilter' })
export class EmpListFilterPipe implements PipeTransform {

     transform(items: any[], searchTerm: string): any {
          if (!items || !searchTerm) {
               return items;
          }

          return items.filter(item => item.userfullname.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 || item.useremail.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
     }
}

@Pipe({
     name: 'empListFilterStatus'
})
export class EmpListFilterStatusPipe implements PipeTransform {

     transform(items: any[], searchTerm: string): any {
          if (!items || !searchTerm) {
               return items;
          }
          if (searchTerm === 'All') {
               return items;
          }
          return items.filter(item => item.userstatus.toString().toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 || item.userstatus.toString().toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
     }
}

@Pipe({
     name: 'dateMMDDYY',
})
export class FormateDateDDMMYYPipe implements PipeTransform {
     transform(value: number) {
          if (value == 0 || value == undefined || value == null) return '';
          const dateObj = value * 1000;
          const datePipe = new DatePipe('en-US');
          return datePipe.transform(new Date(dateObj), 'short');
     }
}
@Pipe({
     name: 'dateString',
})
export class FormateDateStringPipe implements PipeTransform {
     transform(epoch: number) {
          if (epoch) {
               const date = new Date(epoch * 1000);
               const year = date.getFullYear();
               const month = date.getMonth();
               const day = date.getDay();
               const age = moment([year, month, day]).fromNow();
               return age;
          } else {
               return '';
          }
     }
}

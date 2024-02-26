import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'vendorListFilter' })
export class VendorListFilterPipe implements PipeTransform {

     transform(items: any[], searchTerm: string): any {
          if (!items || !searchTerm) {
               return items;
          }
          return items.filter(item => item.vendor_name.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 || item.vendor_email.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
     }
}

@Pipe({ name: 'vendorListFilterStatus' })
export class VendorListFilterStatusPipe implements PipeTransform {

     transform(items: any[], searchTerm: string): any {
          if (!items || !searchTerm) {
               return items;
          }
          if (searchTerm === 'All') {
               return items;
          }
          return items.filter(item => item.vendor_status.toString().toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 || item.vendor_status.toString().toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
     }
}
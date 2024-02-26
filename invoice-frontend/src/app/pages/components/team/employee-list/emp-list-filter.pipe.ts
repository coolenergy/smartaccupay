import { Pipe, PipeTransform } from '@angular/core';

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
  name: 'importManagementFilter'
})
export class ImportManagementUserFilterPipe implements PipeTransform {

  transform(items: any[], searchTerm: string): any {
    if (!items || !searchTerm) {
      return items;
    }
    return items.filter(item => item.userfullname.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
  }
}
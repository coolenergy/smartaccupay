import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { epochToDateTime, timeDateToepoch } from 'src/app/service/utils';

@Pipe({
    name: 'invoiceListFilter'
})
export class InvoiceListFilterPipe implements PipeTransform {

    transform(items: any[], searchTerm: string): any {
        if (!items || !searchTerm) {
            return items;
        }
        return items.filter(item =>
            item.invoice.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.p_o.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.vendor.vendor_name.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.packing_slip.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.receiving_slip.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 ||
            item.status.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1);
    }
}

@Pipe({
    name: 'invoiceListFilterStatus'
})
export class InvoiceListFilterStatus implements PipeTransform {
    transform(items: any[], searchTerm: string[]): any {
        if (searchTerm) {
            var found = searchTerm.includes('All');
            if (found) {
                return items;
            } else {
                var allArray = ['All'];
                if (!items || !searchTerm) {
                    return items;
                }
                if (JSON.stringify(searchTerm) === JSON.stringify(allArray)) {
                    return items;
                }
                return items.filter(item => searchTerm.includes(item.status));
            }
        } else {
            return items;
        }
    }
}

@Pipe({
    name: 'checkDateRange'
})
export class CheckDateRangePipe implements PipeTransform {
    transform(items: any[], dateRange: any): any {
        if (dateRange.length == 2) {
            return items.filter(item => {
                var start = new Date(dateRange[0]);
                var end = new Date(dateRange[1]);
                var date = epochToDateTime(item.due_date_epoch - (moment().utcOffset() * 60));
                return start.getTime() <= date.getTime() && date.getTime() <= end.getTime();
            });
        }
        return items;
    }
}
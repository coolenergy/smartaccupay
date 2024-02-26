import { UserModel } from "../users/user.model";
import { VendorModel } from "../vendors/vendor.model";

export class Report {
     _id: string;
     invoice_date_epoch: number;
     due_date_epoch: number;
     vendor_data: VendorModel;
     vendor_name: string;
     invoice_no: string;
     invoice_total_amount: string;
     sub_total: string;
     assign_to_data: UserModel;
     userfullname: string;
     status: string;
     constructor (invoice: Report) {
          {
               this._id = invoice._id;
               this.invoice_date_epoch = invoice.invoice_date_epoch || 0;
               this.due_date_epoch = invoice.due_date_epoch || 0;
               this.vendor_data = invoice.vendor_data || '';
               this.vendor_name = invoice.vendor_name || '';
               this.invoice_no = invoice.invoice_no || '';
               this.invoice_total_amount = invoice.invoice_total_amount || '';
               this.sub_total = invoice.sub_total || '';
               this.assign_to_data = invoice.assign_to_data || '';
               this.userfullname = invoice.userfullname || '';
               this.status = invoice.status || '';
          }
     }
}

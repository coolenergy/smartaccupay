import { UserModel } from "../users/user.model";
import { VendorModel } from "../vendors/vendor.model";

export class DocumentTable {
     _id: string;
     pdf_url: string;
     document_type: string;
     po_no: string;
     invoice_no: string;
     vendor_data: VendorModel;
     updated_by: UserModel;
     updated_at: string;

     constructor (response: DocumentTable) {
          {
               this._id = response._id;
               this.pdf_url = response.pdf_url;
               this.document_type = response.document_type;
               this.po_no = response.po_no;
               this.invoice_no = response.invoice_no;
               this.vendor_data = response.vendor_data;
               this.updated_by = response.updated_by;
               this.updated_at = response.updated_at;

          }
     }
}

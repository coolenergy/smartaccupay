import { UserModel } from "../users/user.model";
import { VendorModel } from "../vendors/vendor.model";

export class Invoice {
  _id: string;
  invoice_date_epoch: number;
  due_date_epoch: number;
  vendor_data: VendorModel;
  vendor: VendorModel;
  invoice_no: string;
  invoice_total_amount: string;
  sub_total: string;
  assign_to_data: UserModel;
  status: string;
  constructor (invoice: Invoice) {
    {
      this._id = invoice._id;
      this.invoice_date_epoch = invoice.invoice_date_epoch || 0;
      this.due_date_epoch = invoice.due_date_epoch || 0;
      this.vendor_data = invoice.vendor_data || '';
      this.vendor = invoice.vendor || '';
      this.invoice_no = invoice.invoice_no || '';
      this.invoice_total_amount = invoice.invoice_total_amount || '';
      this.sub_total = invoice.sub_total || '';
      this.assign_to_data = invoice.assign_to_data || '';
      this.status = invoice.status || '';
    }
  }
}

export class InvoiceUser {
  _id: string;
  userfullname: string;
  userpicture: string;
  constructor (response: InvoiceUser) {
    {
      this._id = response._id;
      this.userfullname = response.userfullname;
      this.userpicture = response.userpicture;
    }
  }
}

export class Message {
  _id: string;
  invoice_message_id: string;
  invoice_id: string;
  is_attachment: boolean;
  is_seen: boolean;
  mention_user: string;
  message: string;
  sender: InvoiceUser;
  constructor (response: Message) {
    {
      this._id = response._id;
      this.invoice_message_id = response.invoice_message_id;
      this.invoice_id = response.invoice_id;
      this.is_attachment = response.is_attachment;
      this.is_seen = response.is_seen;
      this.mention_user = response.mention_user;
      this.message = response.message;
      this.sender = response.sender;
    }
  }
}
export class InvoiceMessage {
  _id: string;
  created_at: number;
  sender: InvoiceUser;
  receiver: InvoiceUser;
  invoice: Invoice;
  last_message: Message;
  last_message_sender: InvoiceUser;
  invoice_id: string;
  constructor (response: InvoiceMessage) {
    {
      this._id = response._id;
      this.created_at = response.created_at;
      this.sender = response.sender;
      this.receiver = response.receiver;
      this.invoice = response.invoice;
      this.last_message = response.last_message;
      this.last_message_sender = response.last_message_sender;
      this.invoice_id = response.invoice_id;
    }
  }
}

import { CostCodeModel } from '../settings/settings.model';
import { UserModel } from './../users/user.model';

export class ClientJobModel {
  _id: string;
  client_name: string;
  client_number: string;
  client_email: string;
  client_status: number;
  client_notes: string;
  approver_id: string;
  gl_account: number;
  client_cost_cost_id: string;
  client_phone: string;
  approver: UserModel;
  client_cost_cost: CostCodeModel;
  constructor (response: ClientJobModel) {
    {
      this._id = response._id;
      this.client_name = response.client_name;
      this.client_number = response.client_number;
      this.client_email = response.client_email;
      this.client_status = response.client_status;
      this.client_notes = response.client_notes;
      this.approver_id = response.approver_id;
      this.gl_account = response.gl_account;
      this.client_cost_cost_id = response.client_cost_cost_id;
      this.client_phone = response.client_phone;
      this.approver = response.approver;
      this.client_cost_cost = response.client_cost_cost;
    }
  }
}

import { UserModel } from "src/app/users/user.model";
import { VendorModel } from "src/app/vendors/vendor.model";

export interface Pager {
    first: number;
    last: number;
    total: number;
}

export interface DataTableRequest {
    is_delete: number;
    start: number;
    length: number;
    search: string;
    sort: {
        field: string,
        order: string;
    };
}

export interface Permission {
    Add: boolean;
    Delete: boolean;
    Edit: boolean;
    View: boolean;
}

export interface UserPermission {
    Add: boolean;
    Delete: boolean;
    Edit: boolean;
    View: boolean;
    personalInformation: Permission;
    contactInformation: Permission;
    employeeInformation: Permission;
    emergencyContact: Permission;
    employeeDocument: Permission;
}

export interface RolePermission {
    dashboard: Permission;
    vendor: Permission;
    clientJob: Permission;
    invoice: Permission;
    documents: Permission;
    reports: Permission;
    users: UserPermission;
    settings: Permission;
}

export class ProcessDocument {
    _id: string;
    document_type: string;
    vendor_data: VendorModel;
    invoice_no: string;
    status: string;
    po_no: string;
    created_by: UserModel;
    constructor (responce: ProcessDocument) {
        {
            this._id = responce._id;
            this.document_type = responce.document_type;
            this.vendor_data = responce.vendor_data;
            this.invoice_no = responce.invoice_no;
            this.status = responce.status;
            this.po_no = responce.po_no;
            this.created_by = responce.created_by;
        }
    }
}


export class CompanyModel {
    _id: string;
    companyname: string;
    companyemail: string;
    companystatus: string;
    companylogo: string;
    companylanguage: string;
    companycode: string;
    companytype: string;
    companydivision: string;
    companysize: string;
    companyphone: string;
    companyphone2: string;
    companywebsite: string;
    companyaddress: string;
    companyaddresscity: string;
    companyaddressstate: string;
    companyaddresszip: string;
    companyactivesince: string;
    constructor (responce: CompanyModel) {
        {
            this._id = responce._id;
            this.companyname = responce.companyname;
            this.companyemail = responce.companyemail;
            this.companystatus = responce.companystatus;
            this.companylogo = responce.companylogo;
            this.companylanguage = responce.companylanguage;
            this.companycode = responce.companycode;
            this.companytype = responce.companytype;
            this.companydivision = responce.companydivision;
            this.companysize = responce.companysize;
            this.companyphone = responce.companyphone;
            this.companyphone2 = responce.companyphone2;
            this.companywebsite = responce.companywebsite;
            this.companyaddress = responce.companyaddress;
            this.companyaddresscity = responce.companyaddresscity;
            this.companyaddressstate = responce.companyaddressstate;
            this.companyaddresszip = responce.companyaddresszip;
            this.companyactivesince = responce.companyactivesince;
        }
    }
}

export class UserDataModel {
    _id: string;
    UserData: UserModel;
    companydata: CompanyModel;
    role_permission: RolePermission;
    token: string;
    constructor (responce: UserDataModel) {
        {
            this._id = responce._id;
            this.UserData = responce.UserData;
            this.companydata = responce.companydata;
            this.role_permission = responce.role_permission;
            this.token = responce.token;
        }
    }
} 
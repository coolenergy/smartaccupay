import { formatDate } from "@angular/common";

export class UserModel {
    _id: string;
    userfullname: string;
    useremail: string;
    userpicture: string;
    role_name: string;
    userphone: string;
    userjob_title_name: string;
    department_name: string;
    userstatus: number;
    static _id: string;
    constructor (response: UserModel) {
        {
            this._id = response._id;
            this.userfullname = response.userfullname;
            this.useremail = response.useremail;
            this.userpicture = response.userpicture;
            this.role_name = response.role_name;
            this.userphone = response.userphone;
            this.userjob_title_name = response.userjob_title_name;
            this.department_name = response.department_name;
            this.userstatus = response.userstatus;
        }
    }
}
export class AdvanceTable {
    id: number;
    img: string;
    fName: string;
    lName: string;
    email: string;
    gender: string;
    bDate: string;
    mobile: string;
    address: string;
    country: string;
    constructor (advanceTable: AdvanceTable) {
        {
            this.id = advanceTable.id || this.getRandomID();
            this.img = advanceTable.img || 'assets/images/user/user1.jpg';
            this.fName = advanceTable.fName || '';
            this.lName = advanceTable.lName || '';
            this.email = advanceTable.email || '';
            this.gender = advanceTable.gender || 'male';
            this.bDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
            this.mobile = advanceTable.mobile || '';
            this.address = advanceTable.address || '';
            this.country = advanceTable.country || '';
        }
    }
    public getRandomID(): number {
        const S4 = () => {
            return ((1 + Math.random()) * 0x10000) | 0;
        };
        return S4() + S4();
    }
}
export class RoleModel {
    _id: string;
    role_name: string;
    is_delete: boolean;
    role_id: string;

    constructor (response: RoleModel) {
        {
            this._id = response._id;
            this.role_name = response.role_name;
            this.is_delete = response.is_delete;
            this.role_id = response.role_id;

        }
    }
}

export class EmergencyContact {
    _id: string;
    emergency_contact_name: string;
    relationship_name: string;
    emergency_contact_email: string;
    emergency_contact_phone: string;
    emergency_contact_street1: string;
    emergency_contact_street2: string;
    emergency_contact_city: string;
    emergency_contact_state: string;
    is_validated: boolean;
    validated_at: string;
    constructor (response: EmergencyContact) {
        {
            this._id = response._id;
            this.emergency_contact_name = response.emergency_contact_name;
            this.relationship_name = response.relationship_name;
            this.emergency_contact_email = response.emergency_contact_email;
            this.emergency_contact_phone = response.emergency_contact_phone;
            this.emergency_contact_street1 = response.emergency_contact_street1;
            this.emergency_contact_street2 = response.emergency_contact_street2;
            this.emergency_contact_city = response.emergency_contact_city;
            this.emergency_contact_state = response.emergency_contact_state;
            this.is_validated = response.is_validated;
            this.validated_at = response.validated_at;
        }
    }
}

export class UserDocument {
    _id: string;
    document_name: string;
    userdocument_expire_date: number;
    userdocument_type_id: string;
    userdocument_url: string;

    constructor (response: UserDocument) {
        {
            this._id = response._id;
            this.document_name = response.document_name;
            this.userdocument_expire_date = response.userdocument_expire_date;
            this.userdocument_type_id = response.userdocument_type_id;
            this.userdocument_url = response.userdocument_url;
        }
    }
}
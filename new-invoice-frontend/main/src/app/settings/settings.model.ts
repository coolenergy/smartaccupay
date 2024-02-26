export class SettingsModel {
  _id: string;
  userfullname: string;
  useremail: string;
  role_name: string;
  userphone: string;
  userjob_title_name: string;
  department_name: string;
  userstatus: number;
  constructor (response: SettingsModel) {
    {
      this._id = response._id;
      this.userfullname = response.userfullname;
      this.useremail = response.useremail;
      this.role_name = response.role_name;
      this.userphone = response.userphone;
      this.userjob_title_name = response.userjob_title_name;
      this.department_name = response.department_name;
      this.userstatus = response.userstatus;
    }
  }
}
export class CostCodeModel {
  _id: string;
  description: string;
  value: string;
  division: string;
  cost_code: string;

  constructor (costcodeTable: CostCodeModel) {
    {
      this._id = costcodeTable._id;
      this.description = costcodeTable.description;
      this.value = costcodeTable.value;
      this.division = costcodeTable.division;
      this.cost_code = costcodeTable.cost_code;
    }
  }
}

export class MailboxModel {
  _id: string;
  email: string;
  imap: string;
  port: number;
  time: string;

  constructor (mailboxTable: MailboxModel) {
    {
      this._id = mailboxTable._id;
      this.email = mailboxTable.email;
      this.imap = mailboxTable.imap;
      this.port = mailboxTable.port;
      this.time = mailboxTable.time;
    }
  }
}

export class UsageModel {
  _id: string;
  year: number;
  month: number;
  month_name: string;
  INVOICE: number;
  PURCHASE_ORDER: number;
  PACKING_SLIP: number;
  RECEIVING_SLIP: number;
  QUOTE: number;
  OTHER: number;

  constructor (usageTable: UsageModel) {
    {
      this._id = usageTable._id;
      this.year = usageTable.year;
      this.month = usageTable.month;
      this.month_name = usageTable.month_name;
      this.INVOICE = usageTable.INVOICE;
      this.PURCHASE_ORDER = usageTable.PURCHASE_ORDER;
      this.PACKING_SLIP = usageTable.PACKING_SLIP;
      this.RECEIVING_SLIP = usageTable.RECEIVING_SLIP;
      this.QUOTE = usageTable.QUOTE;
      this.OTHER = usageTable.OTHER;
    }
  }
}

/* export class usageTable {
  _id: string;
  email: string;
  imap: string;
  port: number;
  time: string;

  constructor (usageTable: usageTable) {
    {
      this._id = usageTable._id;
      this.email = usageTable.email;
      this.imap = usageTable.imap;
      this.port = usageTable.port;
      this.time = usageTable.time;
    }
  }
} */

export class Element {
  name!: string;
  position!: number;
  weight!: number;
  symbol!: string;
  constructor (Element: Element) {
    {
      this.name = Element.name;
      this.position = Element.position;
      this.weight = Element.weight;
      this.symbol = Element.symbol;
    }
  }
}

export class DocumentTypeModel {
  _id: string;
  is_expiration!: string;
  document_type_name!: string;

  constructor (response: DocumentTypeModel) {
    {
      this._id = response._id;
      this.is_expiration = response.is_expiration;
      this.document_type_name = response.document_type_name;
    }
  }
}

export class DeartmentModel {
  _id: string;
  department_name!: string;

  constructor (response: DeartmentModel) {
    {
      this._id = response._id;
      this.department_name = response.department_name;
    }
  }
}

export class JobTitleModel {
  _id: string;
  job_title_name!: string;

  constructor (response: JobTitleModel) {
    {
      this._id = response._id;
      this.job_title_name = response.job_title_name;
    }
  }
}

export class JobTypeModel {
  _id: string;
  job_type_name!: string;

  constructor (response: JobTypeModel) {
    {
      this._id = response._id;
      this.job_type_name = response.job_type_name;
    }
  }
}

export class RelationshipModel {
  _id: string;
  relationship_name!: string;

  constructor (response: RelationshipModel) {
    {
      this._id = response._id;
      this.relationship_name = response.relationship_name;
    }
  }
}

export class LanguageModel {
  _id: string;
  name!: string;

  constructor (response: LanguageModel) {
    {
      this._id = response._id;
      this.name = response.name;
    }
  }
}

export class TermModel {
  _id: string;
  name: string;
  is_dicount: boolean;
  discount: number;
  due_days: string;
  is_quickbooks: string;

  constructor (response: TermModel) {
    {
      this._id = response._id;
      this.name = response.name;
      this.is_dicount = response.is_dicount;
      this.discount = response.discount;
      this.due_days = response.due_days;
      this.is_quickbooks = response.is_quickbooks;
    }
  }
}

export class TaxRateModel {
  _id: string;
  name!: string;

  constructor (response: TaxRateModel) {
    {
      this._id = response._id;
      this.name = response.name;
    }
  }
}

export class DocumentsModel {
  _id: string;
  is_expiration!: boolean;
  name!: string;

  constructor (response: DocumentsModel) {
    {
      this._id = response._id;
      this.name = response.name;
      this.is_expiration = response.is_expiration;
    }
  }
}

export class VendorTypeModel {
  _id: string;
  name!: string;

  constructor (response: VendorTypeModel) {
    {
      this._id = response._id;
      this.name = response.name;
    }
  }
}

export class JobNameModel {
  _id: string;
  name!: string;
  email_contact!: string;

  constructor (response: JobNameModel) {
    {
      this._id = response._id;
      this.name = response.name;
      this.email_contact = response.email_contact;
    }
  }
}

export class ClassNameModel {
  _id: string;
  name!: string;
  number!: string;
  description!: string;
  is_quickbooks!: string;
  status!: number;

  constructor (response: ClassNameModel) {
    {
      this._id = response._id;
      this.name = response.name;
      this.number = response.number;
      this.description = response.description;
      this.is_quickbooks = response.is_quickbooks;
      this.status = response.status;
    }
  }
}

export class CountryModel {
  _id: string;
  name: string;
  constructor (response: CountryModel) {
    {
      this._id = response._id;
      this.name = response.name;
    }
  }
}
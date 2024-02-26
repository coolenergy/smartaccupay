import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import {
  ClassNameModel,
  CostCodeModel,
  DeartmentModel,
  DocumentTypeModel,
  DocumentsModel,
  JobNameModel,
  JobTitleModel,
  JobTypeModel,
  LanguageModel,
  MailboxModel,
  RelationshipModel,
  SettingsModel,
  TaxRateModel,
  TermModel,
  UsageModel,
  VendorTypeModel,
} from './settings.model';

@Injectable()
export class SettingsService extends UnsubscribeOnDestroyAdapter {
  // Language Datatable Service
  isLangTblLoading = true;
  langDataChange: BehaviorSubject<LanguageModel[]> = new BehaviorSubject<LanguageModel[]>([]);

  get langData(): LanguageModel[] {
    return this.langDataChange.value;
  }

  async getLangTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.langDataChange.next(data);
    this.isLangTblLoading = false;
  }

  // Department Datatable Service
  isDepartmentTblLoading = true;
  departmentDataChange: BehaviorSubject<DeartmentModel[]> = new BehaviorSubject<DeartmentModel[]>([]);

  get departmentData(): DeartmentModel[] {
    return this.departmentDataChange.value;
  }

  async getDepartmentTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.departmentDataChange.next(data);
    this.isDepartmentTblLoading = false;
  }

  // Document Type Datatable Service
  isDocumentTypeTblLoading = true;
  documentTypeDataChange: BehaviorSubject<DocumentTypeModel[]> = new BehaviorSubject<DocumentTypeModel[]>([]);

  get documentTypeData(): DocumentTypeModel[] {
    return this.documentTypeDataChange.value;
  }

  async getDocumentTypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.documentTypeDataChange.next(data);
    this.isDocumentTypeTblLoading = false;
  }

  // Job title Datatable Service
  isJobTitleTblLoading = true;
  jobTitleDataChange: BehaviorSubject<JobTitleModel[]> = new BehaviorSubject<JobTitleModel[]>([]);

  get jobTitleData(): JobTitleModel[] {
    return this.jobTitleDataChange.value;
  }

  async getJobTitleTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.jobTitleDataChange.next(data);
    this.isJobTitleTblLoading = false;
  }

  // Job type Datatable Service
  isJobTypeTblLoading = true;
  jobTypeDataChange: BehaviorSubject<JobTypeModel[]> = new BehaviorSubject<JobTypeModel[]>([]);

  get jobTypeData(): JobTypeModel[] {
    return this.jobTypeDataChange.value;
  }

  async getJobTypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.jobTypeDataChange.next(data);
    this.isJobTypeTblLoading = false;
  }

  // Relationship Datatable Service
  isRelationshipTblLoading = true;
  relationshipDataChange: BehaviorSubject<RelationshipModel[]> = new BehaviorSubject<RelationshipModel[]>([]);

  get relationshipData(): RelationshipModel[] {
    return this.relationshipDataChange.value;
  }

  async getRelationshipTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.relationshipDataChange.next(data);
    this.isRelationshipTblLoading = false;
  }

  // Terms Datatable Service
  isTermTblLoading = true;
  termDataChange: BehaviorSubject<TermModel[]> = new BehaviorSubject<TermModel[]>([]);

  get termData(): TermModel[] {
    return this.termDataChange.value;
  }

  async getTermTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.TERMS_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.termDataChange.next(data);
    this.isTermTblLoading = false;
  }

  // Tax Rate Datatable Service
  isTaxRateTblLoading = true;
  taxRateDataChange: BehaviorSubject<TaxRateModel[]> = new BehaviorSubject<TaxRateModel[]>([]);

  get taxRateData(): TaxRateModel[] {
    return this.taxRateDataChange.value;
  }

  async getTaxRateTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.TEXT_RATE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.taxRateDataChange.next(data);
    this.isTaxRateTblLoading = false;
  }

  // Document Datatable Service
  isDocumentTblLoading = true;
  documentDataChange: BehaviorSubject<DocumentsModel[]> = new BehaviorSubject<DocumentsModel[]>([]);

  get documentData(): DocumentsModel[] {
    return this.documentDataChange.value;
  }

  async getDocumentTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.DOCUMENTS_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.documentDataChange.next(data);
    this.isDocumentTblLoading = false;
  }

  // Vendor Type Datatable Service
  isVendorTypeTblLoading = true;
  vendorTypeDataChange: BehaviorSubject<VendorTypeModel[]> = new BehaviorSubject<VendorTypeModel[]>([]);

  get vendorTypeData(): VendorTypeModel[] {
    return this.vendorTypeDataChange.value;
  }

  async getVendorTypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.VENDOR_TYPE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.vendorTypeDataChange.next(data);
    this.isVendorTypeTblLoading = false;
  }

  // Class Name Datatable Service
  isClassNameTblLoading = true;
  classNameDataChange: BehaviorSubject<ClassNameModel[]> = new BehaviorSubject<ClassNameModel[]>([]);

  get classNameData(): ClassNameModel[] {
    return this.classNameDataChange.value;
  }

  async getClassNameTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.CLASS_NAME_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.classNameDataChange.next(data);
    this.isClassNameTblLoading = false;
  }

  // Cost Code Datatable Service
  isCostCodeTblLoading = true;
  costCodeDataChange: BehaviorSubject<CostCodeModel[]> = new BehaviorSubject<CostCodeModel[]>([]);

  get costCodeData(): CostCodeModel[] {
    return this.costCodeDataChange.value;
  }

  async getCostCodeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.COSTCODE_DATA_TABLE, { is_delete: is_delete, module: 'Invoice' }).toPromise();
    this.isCostCodeTblLoading = false;
    this.costCodeDataChange.next(data);
  }

  // Mail Box Datatable Service
  isMailBoxTblLoading = true;
  mailBoxDataChange: BehaviorSubject<MailboxModel[]> = new BehaviorSubject<MailboxModel[]>([]);

  get mailBoxData(): MailboxModel[] {
    return this.mailBoxDataChange.value;
  }

  async getMailBoxTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.MAILBOX_DATA_TABLE, { is_delete: is_delete }).toPromise();
    this.mailBoxDataChange.next(data);
    this.isMailBoxTblLoading = false;
  }

  // Usage Datatable Service
  isAPCountTblLoading = true;
  aPCountDataChange: BehaviorSubject<UsageModel[]> = new BehaviorSubject<UsageModel[]>([]);

  get aPCountData(): UsageModel[] {
    return this.aPCountDataChange.value;
  }

  async getAPCount(): Promise<void> {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_AP_API_COUNT).toPromise();
    this.aPCountDataChange.next(data);
    this.isAPCountTblLoading = false;
  }













  // private readonly API_URL = 'assets/data/advanceTable.json';
  // dataChange: BehaviorSubject<SettingsModel[]> = new BehaviorSubject<SettingsModel[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: any;
  isTblLoading = true;
  isDoctyeTblLoading = true;
  dataChange: BehaviorSubject<MailboxModel[]> = new BehaviorSubject<
    MailboxModel[]
  >([]);

  dataCostCodeChange: BehaviorSubject<CostCodeModel[]> = new BehaviorSubject<
    CostCodeModel[]
  >([]);

  dataUsageChange: BehaviorSubject<UsageModel[]> = new BehaviorSubject<
    UsageModel[]
  >([]);

  dataDocumentTypeChange: BehaviorSubject<DocumentTypeModel[]> = new BehaviorSubject<DocumentTypeModel[]>([]);

  dataDepartmentChange: BehaviorSubject<DeartmentModel[]> =
    new BehaviorSubject<DeartmentModel[]>([]);

  dataJobTitleChange: BehaviorSubject<JobTitleModel[]> = new BehaviorSubject<
    JobTitleModel[]
  >([]);

  dataJobTypeChange: BehaviorSubject<JobTypeModel[]> = new BehaviorSubject<
    JobTypeModel[]
  >([]);

  dataRelationShipChange: BehaviorSubject<RelationshipModel[]> =
    new BehaviorSubject<RelationshipModel[]>([]);

  dataLanguageChange: BehaviorSubject<LanguageModel[]> = new BehaviorSubject<
    LanguageModel[]
  >([]);

  dataTermsChange: BehaviorSubject<TermModel[]> = new BehaviorSubject<
    TermModel[]
  >([]);

  dataTaxrateChange: BehaviorSubject<TaxRateModel[]> = new BehaviorSubject<
    TaxRateModel[]
  >([]);

  dataDocumentsChange: BehaviorSubject<DocumentsModel[]> = new BehaviorSubject<
    DocumentsModel[]
  >([]);

  dataVendortypeChange: BehaviorSubject<VendorTypeModel[]> =
    new BehaviorSubject<VendorTypeModel[]>([]);

  dataJobnameChange: BehaviorSubject<JobNameModel[]> = new BehaviorSubject<
    JobNameModel[]
  >([]);

  dataclassnameChange: BehaviorSubject<ClassNameModel[]> = new BehaviorSubject<
    ClassNameModel[]
  >([]);

  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): MailboxModel[] {
    return this.dataChange.value;
  }

  get datacostcode(): CostCodeModel[] {
    return this.dataCostCodeChange.value;
  }

  get datausage(): UsageModel[] {
    return this.dataUsageChange.value;
  }

  get datadocumenttype(): DocumentTypeModel[] {
    return this.dataDocumentTypeChange.value;
  }

  get datadepartment(): DeartmentModel[] {
    return this.dataDepartmentChange.value;
  }

  get datajobtitle(): JobTitleModel[] {
    return this.dataJobTitleChange.value;
  }

  get datajobtype(): JobTypeModel[] {
    return this.dataJobTypeChange.value;
  }

  get dataRelationship(): RelationshipModel[] {
    return this.dataRelationShipChange.value;
  }

  get dataLanguage(): LanguageModel[] {
    return this.dataLanguageChange.value;
  }

  get dataTerms(): TermModel[] {
    return this.dataTermsChange.value;
  }

  get dataTaxrate(): TaxRateModel[] {
    return this.dataTaxrateChange.value;
  }

  get dataDocuments(): DocumentsModel[] {
    return this.dataDocumentsChange.value;
  }

  get dataVendortype(): VendorTypeModel[] {
    return this.dataVendortypeChange.value;
  }

  get dataJobname(): JobNameModel[] {
    return this.dataJobnameChange.value;
  }

  get dataClassname(): ClassNameModel[] {
    return this.dataclassnameChange.value;
  }

  async getCompanyType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_TYPE)
      .toPromise();
    return data;
  }

  // Datatable API
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */

  async getAllMailboxTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.MAILBOX_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  async getAllDocumentTypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_DATA_TABLE, { is_delete: is_delete }).toPromise();
    // Only write this for datatable api otherwise return data
    this.dataDocumentTypeChange.next(data);
    this.isDoctyeTblLoading = false;
  }

  async getAllDepartmentTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataDepartmentChange.next(data);
  }

  async getAlljobtitleTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataJobTitleChange.next(data);
  }

  async getAlljobtypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataJobTypeChange.next(data);
  }

  async getAllRelationshipTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataRelationShipChange.next(data);
  }

  async getAllLanguageTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_DATA_TABLE,
        {
          is_delete: is_delete,
        }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataLanguageChange.next(data);
  }

  async getAllTermsTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.TERMS_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataTermsChange.next(data);
  }

  async getAllTaxrateTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.TEXT_RATE_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataTaxrateChange.next(data);
  }

  async getAllDocumentsTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.DOCUMENTS_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataDocumentsChange.next(data);
  }

  async getAllVendorTypeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.VENDOR_TYPE_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataVendortypeChange.next(data);
  }

  async getAllJobNameTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.JOB_NAME_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataJobnameChange.next(data);
  }

  async getAllClassNameTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.CLASS_NAME_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataclassnameChange.next(data);
  }

  async getAllCostCodeTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.COSTCODE_DATA_TABLE, {
        is_delete: is_delete,
        module: 'Invoice',
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataCostCodeChange.next(data);
  }

  async getAllUsageTable(): Promise<void> {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.USAGE_DATA_TABLE)
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataUsageChange.next(data);
  }

  async getCompanyNigp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_NIGP)
      .toPromise();
    return data;
  }

  async getCompanySize() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_SIZE)
      .toPromise();
    return data;
  }

  async getCompanyInfo() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_INFO)
      .toPromise();
    return data;
  }

  async getCompanysmtp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP)
      .toPromise();
    return data;
  }

  async VerifySmtp(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(httpversion.V1 + httproutes.VERIFY_SMTP, requestObject)
      .toPromise();
    return data;
  }

  async SaveSmtp(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(httpversion.V1 + httproutes.SAVE_SMTP, requestObject)
      .toPromise();
    return data;
  }

  async saveCompanyInfo(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.V1 + httproutes.SAVE_COMPNAY_INFO,
        requestObject
      )
      .toPromise();
    return data;
  }

  async AddMailbox(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SAVE_MAILBOX,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getOneMailBox(id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.GET_ONE_MAILBOX, {
        _id: id,
      })
      .toPromise();
    return data;
  }

  async deleteMailbox(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.DELETE_MAILBOX,
        requestObject
      )
      .toPromise();
    return data;
  }

  async deleteCostCode(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.DELETE_COST_CODE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getDocumentType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_GET)
      .toPromise();
    return data;
  }

  async getDepartment() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_GET)
      .toPromise();
    return data;
  }

  async getJobTitle() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_ALL)
      .toPromise();
    return data;
  }

  async getJobType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_ALL)
      .toPromise();
    return data;
  }

  async getRelationship() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_ALL)
      .toPromise();
    return data;
  }

  async getLanguage() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_GET)
      .toPromise();
    return data;
  }

  async getTerms() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_TERMS)
      .toPromise();
    return data;
  }

  async getTaxRate() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_TEXT_RATE
      )
      .toPromise();
    return data;
  }

  async getDocuments() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_DOCUMENT
      )
      .toPromise();
    return data;
  }

  async getVendorType() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_VENDOR_TYPE
      )
      .toPromise();
    return data;
  }

  async getJobName() {
    const data = await this.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_GET_JOB_NAME
      )
      .toPromise();
    return data;
  }

  async updateSetting(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.INVOICE_OTHER_SETTING_UPDATE_ALERTS,
        requestObject
      )
      .toPromise();
    return data;
  }

  async DeleteDocumentType(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteDepartments(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteJobType(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteJobTitle(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteRelationship(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_DELETE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteLanguage(_id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_DELETE, {
        _id: _id,
      })
      .toPromise();
    return data;
  }

  async DeleteTerms(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_TERMS,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteTaxrate(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_TEXT_RATE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteDocuments(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_DOCUMENT,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteVendorType(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_DELETE_VENDOR_TYPE,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteJobName(_id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_DELETE_JOB_NAME,
        {
          _id: _id,
        }
      )
      .toPromise();
    return data;
  }

  async DeleteClassName(_id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.DELETE_CLASS_NAME, {
        _id: _id,
      })
      .toPromise();
    return data;
  }

  addAdvanceTable(Document: SettingsModel): void {
    this.dialogData = Document;
  }

  async saveDocumentType(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveDepartment(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_DEPARTMENTS_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveJobTitle(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TITLE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveJobType(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_JOB_TYPE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveRelatioship(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveLanguage(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_LANGUAGE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveTerms(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_TERMS,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveTaxrate(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_TEXT_RATE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveJobName(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_JOB_NAME,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveClassName(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SAVE_CLASS_NAME,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveDocument(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTING_SAVE_DOCUMENT,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveVendorType(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_SAVE_VENDOR_TYPE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveCostCode(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.COST_CODE_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getusage() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.USAGE_DATA_TABLE)
      .toPromise();
    return data;
  }
}

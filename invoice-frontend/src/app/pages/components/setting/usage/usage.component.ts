import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, localstorageconstants } from 'src/app/consts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss']
})
export class UsageComponent implements OnInit {
  usageinfo: FormGroup;
  dtOptions: any = {};
  showTable: boolean = true;

  constructor (private formBuilder: FormBuilder, public httpCall: HttpCall, private http: HttpClient,) {
    this.usageinfo = this.formBuilder.group({
      amount_of_supervisor: [{ value: '', disabled: true }],
      wasabi_storage_size: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_USEAGE).subscribe(function (params) {
      if (params.status) {
        that.usageinfo = that.formBuilder.group({
          amount_of_supervisor: [{ value: params.data.totalSuervisor, disabled: true }],
          wasabi_storage_size: [{ value: params.data.bucket_size, disabled: true }]
        });
      }
    });
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let companycode = localStorage.getItem(localstorageconstants.COMPANYCODE);
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers = new HttpHeaders({ Authorization: token, language: portal_language, });
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      language:
        portal_language == "en"
          ? LanguageApp.english_datatables
          : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback) => {
        $(".dataTables_processing").html(
          "<img  src=" + this.httpCall.getLoader() + ">"
        );
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PORTAL_SETTING_CUSTOMER_STATES,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
          });
      },
      columns: that.getColumName(),

      drawCallback: () => { },
    };
  }
  getColumName() {
    let that = this;
    return [
      {
        title: 'Date',
        render: function (data: any, type: any, full: any) {
          return `${configdata.MONTHS_ARRAY[full.month - 1]}, ${full.year}`;
        },
        // data: "month_name",
        defaultContent: "",
      },
      {
        title: "",
        class: "none",
        defaultContent: "",
        render: function (data: any, type: any, full: any) {
          let html = `<table class="cust-table" >
          <tr class="cust-backgroud-color">
            <th class="datatable_center_text">Document Type</th>
            <th class="datatable_center_text">Expense</th>
            <th class="datatable_center_text">Forms</th> 
          </tr>
          <tr>
            <td class="datatable_center_text">Invoice</td>
            <td class="datatable_center_text">${full.invoice_expense}</td>
            <td class="datatable_center_text">${full.invoice_forms}</td>
          </tr>
          <tr>
            <td class="datatable_center_text">Purchase Order</td>
            <td class="datatable_center_text">${full.po_expense}</td>
            <td class="datatable_center_text">${full.po_forms}</td>
          </tr>
          <tr>
            <td class="datatable_center_text">Quote</td>
            <td class="datatable_center_text">${full.quote_expense}</td>
            <td class="datatable_center_text">${full.quote_forms}</td>
          </tr>
          <tr>
            <td class="datatable_center_text">Packing Slip</td>
            <td class="datatable_center_text">${full.packing_slip_expense}</td>
            <td class="datatable_center_text">${full.packing_slip_forms}</td>
          </tr>
          <tr>
            <td class="datatable_center_text">Receiving Slip</td>
            <td class="datatable_center_text">${full.receiving_slip_expense}</td>
            <td class="datatable_center_text">${full.receiving_slip_forms}</td>
          </tr>
          <tr>
            <td class="datatable_center_text">Unkown</td>
            <td class="datatable_center_text">${full.unknown_expense}</td>
            <td class="datatable_center_text">${full.unknown_forms}</td>
          </tr>
          </table>`;
          return html;
        }
      }
    ];
  }
}


import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import * as moment from 'moment';
import { NgxGalleryAnimation, NgxGalleryImageSize } from 'ngx-gallery-9';
import { configdata } from 'src/environments/configData';
export class LanguageApp {
  public static english_datatables = {
    "emptyTable": "No data available in table",
    "info": "Showing _START_ to _END_ of _TOTAL_ entries",
    "infoEmpty": "Showing 0 to 0 of 0 entries",
    "infoFiltered": "(filtered from _MAX_ total entries)",
    "infoThousands": ",",
    "lengthMenu": "Show _MENU_ entries",
    "loadingRecords": "Loading...",
    "processing": "Processing...",
    "search": "Search:",
    "zeroRecords": "No matching records found",
    "thousands": ",",
    "paginate": {
      "first": "First",
      "last": "Last",
      "next": "Next",
      "previous": "Previous"
    },
    "aria": {
      "sortAscending": ": activate to sort column ascending",
      "sortDescending": ": activate to sort column descending"
    },
    "autoFill": {
      "cancel": "Cancel",
      "fill": "Fill all cells with <i>%d<\/i>",
      "fillHorizontal": "Fill cells horizontally",
      "fillVertical": "Fill cells vertically"
    },
    "buttons": {
      "collection": "Collection <span class='ui-button-icon-primary ui-icon ui-icon-triangle-1-s'\/>",
      "colvis": "Column Visibility",
      "colvisRestore": "Restore visibility",
      "copy": "Copy",
      "copyKeys": "Press ctrl or u2318 + C to copy the table data to your system clipboard.<br><br>To cancel, click this message or press escape.",
      "copySuccess": {
        "1": "Copied 1 row to clipboard",
        "_": "Copied %d rows to clipboard"
      },
      "copyTitle": "Copy to Clipboard",
      "csv": "CSV",
      "excel": "Excel",
      "pageLength": {
        "-1": "Show all rows",
        "_": "Show %d rows"
      },
      "pdf": "PDF",
      "print": "Print"
    },
    "searchBuilder": {
      "add": "Add Condition",
      "button": {
        "0": "Search Builder",
        "_": "Search Builder (%d)"
      },
      "clearAll": "Clear All",
      "condition": "Condition",
      "conditions": {
        "date": {
          "after": "After",
          "before": "Before",
          "between": "Between",
          "empty": "Empty",
          "equals": "Equals",
          "not": "Not",
          "notBetween": "Not Between",
          "notEmpty": "Not Empty"
        },
        "number": {
          "between": "Between",
          "empty": "Empty",
          "equals": "Equals",
          "gt": "Greater Than",
          "gte": "Greater Than Equal To",
          "lt": "Less Than",
          "lte": "Less Than Equal To",
          "not": "Not",
          "notBetween": "Not Between",
          "notEmpty": "Not Empty"
        },
        "string": {
          "contains": "Contains",
          "empty": "Empty",
          "endsWith": "Ends With",
          "equals": "Equals",
          "not": "Not",
          "notEmpty": "Not Empty",
          "startsWith": "Starts With"
        },
        "array": {
          "without": "Without",
          "notEmpty": "Not Empty",
          "not": "Not",
          "contains": "Contains",
          "empty": "Empty",
          "equals": "Equals"
        }
      },
      "data": "Data",
      "deleteTitle": "Delete filtering rule",
      "leftTitle": "Outdent Criteria",
      "logicAnd": "And",
      "logicOr": "Or",
      "rightTitle": "Indent Criteria",
      "title": {
        "0": "Search Builder",
        "_": "Search Builder (%d)"
      },
      "value": "Value"
    },
    "searchPanes": {
      "clearMessage": "Clear All",
      "collapse": {
        "0": "SearchPanes",
        "_": "SearchPanes (%d)"
      },
      "count": "{total}",
      "countFiltered": "{shown} ({total})",
      "emptyPanes": "No SearchPanes",
      "loadMessage": "Loading SearchPanes",
      "title": "Filters Active - %d"
    },
    "select": {
      "cells": {
        "1": "1 cell selected",
        "_": "%d cells selected"
      },
      "columns": {
        "1": "1 column selected",
        "_": "%d columns selected"
      }
    },
    "datetime": {
      "previous": "Previous",
      "next": "Next",
      "hours": "Hour",
      "minutes": "Minute",
      "seconds": "Second",
      "unknown": "-",
      "amPm": [
        "am",
        "pm"
      ],
      "weekdays": [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      ],
      "months": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ]
    },
    "editor": {
      "close": "Close",
      "create": {
        "button": "New",
        "title": "Create new entry",
        "submit": "Create"
      },
      "edit": {
        "button": "Edit",
        "title": "Edit Entry",
        "submit": "Update"
      },
      "remove": {
        "button": "Delete",
        "title": "Delete",
        "submit": "Delete",
        "confirm": {
          "_": "Are you sure you wish to delete %d rows?",
          "1": "Are you sure you wish to delete 1 row?"
        }
      },
      "error": {
        "system": "A system error has occurred (<a target=\"\\\" rel=\"nofollow\" href=\"\\\">More information<\/a>)."
      },
      "multi": {
        "title": "Multiple Values",
        "info": "The selected items contain different values for this input. To edit and set all items for this input to the same value, click or tap here, otherwise they will retain their individual values.",
        "restore": "Undo Changes",
        "noMulti": "This input can be edited individually, but not part of a group. "
      }
    }
  };
  public static spanish_datatables = {
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ elementos",
    info: "Mostrando desde _START_ al _END_ de _TOTAL_ elementos",
    infoEmpty: "Mostrando ningún elemento.",
    infoFiltered: "(filtrado _MAX_ elementos total)",
    infoPostFix: "",
    loadingRecords: "Cargando registros...",
    zeroRecords: "No se encontraron registros",
    emptyTable: "No hay datos disponibles en la tabla",
    paginate: {
      first: "Primero",
      previous: "Anterior",
      next: "Siguiente",
      last: "Último"
    },
    aria: {
      sortAscending: ": Activar para ordenar la tabla en orden ascendente",
      sortDescending: ": Activar para ordenar la tabla en orden descendente"
    }
  };
}

export function timeDateToepoch(new_datetime: any) {
  var dateObj = new Date(new_datetime).getTime();
  return Math.round(dateObj / 1000);
}

export function gallery_options() {
  return {
    width: '0px',
    height: '0px',
    imageArrowsAutoHide: true,
    imageAutoPlay: false,
    thumbnails: false,
    preview: true,
    image: false,
    thumbnailsColumns: 4,
    imagePercent: 50,
    previewFullscreen: true,
    imageSize: NgxGalleryImageSize.Contain,
    previewZoom: true,
    previewRotate: true,
    previewCloseOnClick: true,
    previewCloseOnEsc: true,
    previewAutoPlay: false,
    imageAnimation: NgxGalleryAnimation.Fade,
    actions: []
  };
}

export function updatecurrantTimeInDate(new_datetime: any) {
  let stringDate = moment(new_datetime).format("YYYY-MM-DD");
  let hh = Number(moment().format("hh")) * 60 * 60;
  let mm = Number(moment().format("mm")) * 60;
  let date_epoch = moment(stringDate).valueOf() / 1000;
  return date_epoch + hh + mm;
}

export function epochToDateTime(epochTime: any) {
  var dateObj = epochTime * 1000;
  return new Date(dateObj);
}

export function formatPhoneNumber(str: any) {
  //Filter only numbers from the input
  let cleaned = ('' + str).replace(/\D/g, '');

  //Check if the input is of correct length
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  };

  return '';
};

export function formatEINNumber(ein_number: any) {
  return ein_number.substr(0, 2) + "-" + ein_number.substr(2);
}

export function MMDDYYYY(epochTime: any) {
  if (epochTime == 0) return '';
  var dateObj = epochTime * 1000;
  let date = new Date(dateObj);
  let date_tmp = ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + "/" + date.getFullYear();
  return date_tmp;
}

export function longDate(date_tmp_: any) {

  let date = new Date(date_tmp_);
  let day = configdata.WEEK_ARRAY[date.getDay()];
  let month = configdata.MONTHS_ARRAY[date.getMonth()];
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var minutes_ = minutes < 10 ? '0' + minutes : minutes;
  let fullname = day + "," + month + " " + date.getDate() + ", " + date.getFullYear() + " " + ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;

  return fullname;
}

export function YYYY_MM_DD(epochTime: any) {
  var dateObj = epochTime * 1000;
  let date = new Date(dateObj);
  let date_tmp = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
  return date_tmp;
}


export function MMDDYYYY_formet(epochTime: any) {
  var dateObj = epochTime * 1000;
  let date = new Date(dateObj);
  let date_tmp = ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + "/" + date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var minutes_ = minutes < 10 ? '0' + minutes : minutes;
  var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
  return date_tmp + " " + strTime;
}

export function notificationDateTime(epochTime) {
  if (epochTime == 0 || epochTime == undefined || epochTime == null) return " ";
  var dateObj = epochTime * 1000;
  let date = new Date(dateObj);
  let date_tmp =
    ("0" + date.getDate()).slice(-2) +
    " " +
    configdata.SHORT_MONTHS_ARRAY[date.getMonth()] +
    ", " +
    date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var minutes_ = minutes < 10 ? "0" + minutes : minutes;
  var strTime =
    ("0" + hours).slice(-2) + ":" + ("0" + minutes_).slice(-2) + " " + ampm;
  return date_tmp + " at " + strTime;
}

export function TimeFormat(epochTime: any) {
  var dateObj = epochTime * 1000;
  let date = new Date(dateObj);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var minutes_ = minutes < 10 ? '0' + minutes : minutes;
  return ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
}
export function YYYYMMDD_formet(epochTime: any) {
  let date = new Date(epochTime);
  let date_tmp = (date.getFullYear()) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
  return date_tmp;
}

export function amount_field(amount: any) {
  return (amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export function numberWithCommas(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function amountChange(params: any) {
  params = params.target.value;
  if (params == "") {
    return "00.00";
  } else {
    var tempText = "";
    if (params.match(numbers)) {
      var numbers = /^[0-9]+$/;
      var a = params;
      a = a.replace(/\,/g, '');
      let dotIndex = a.indexOf(".");
      let count = a.substring(dotIndex + 1).length;
      let multiply;
      if (count == 1) {
        multiply = 10;
      } else {
        multiply = 1000;
      }
      var temp = (Number(a) * multiply) / 100;
      tempText = temp.toFixed(2);
    }
    var dotSplit = tempText.split(".");
    if (dotSplit[0].length > 3) {
      var code = dotSplit[0];
      var modules = code.length % 3 == 0
        ? 0
        : code.length + (3 - (code.length % 3));
      var newCode: any = code.padStart(modules, 'X');
      var finalCode = newCode.match(/.{1,3}/g).join(",");
      finalCode = finalCode.toString().replace(/X/g, "");
      tempText = `${finalCode}.${dotSplit[1]}`;
    }
    return tempText;
    /*  params = params.target.value;
     if (params == "") {
       return "00.00";
     } else {
       if (params.match(numbers)) {
         var numbers = /^[0-9]+$/;
         let dotIndex = params.indexOf(".");
         let count = params.substring(dotIndex + 1).length;
         let multiply;
         if (count == 1) {
           multiply = 10;
         } else {
           multiply = 1000;
         }
         var temp = (Number(params) * multiply) / 100;
         return temp.toFixed(2);
       } else {
         return "00.00";
       }
     } */
  }
}

export function percentage_field(percentage: any) {
  return parseFloat(percentage).toFixed(2) + "%";
}

export function validateExpiry(input: any) {
  // ensure basic format is correct

  if (input.match(/^(0\d|1[0-2])\/\d{2}$/)) {
    const { 0: month, 1: year } = input.split("/");

    // get midnight of first day of the next month
    const expiry = new Date(20 + year, month);
    const current = new Date();

    return expiry.getTime() > current.getTime();

  } else return false;
}

export function fullDate_format() {

  let d = new Date();
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return `${da}-${mo}-${ye}`;
}

export async function getBase64ImageFromUrl(imageUrl: any) {

  var res = await fetch(imageUrl);
  var blob = await res.blob();

  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      resolve(reader.result);
    }, false);

    reader.onerror = () => {
      return reject();
    };
    reader.readAsDataURL(blob);
  });
}

export async function toDataURL(url: any, callback: any) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

export function thumbNetworkImage(imageUrl: any) {
  var extension = imageUrl.substring(imageUrl.lastIndexOf('.') + 1);
  extension = extension.toLowerCase();
  if (extension == "doc" || extension == "docx") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/doc.png';
  } else if (extension == "pdf") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png';
  } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/xls.png';
  } else if (extension == "zip") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/zip.png';
  } else if (extension == "ppt") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png';
  } else if (extension == "rtf") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png';
  } else if (extension == "odt") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/odt.png';
  } else if (extension == "txt") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/txt.png';
  } else if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
    return imageUrl;
  } else if (extension == "svg") {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/svg.png';
  } else {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png';
  }
}

export async function convertBlobToBase64_new(blob: any) {
  return Observable.create((observer: any) => {
    const reader = new FileReader();
    const binaryString = reader.readAsDataURL(blob);
    reader.onload = (event: any) => {

      observer.next(event.target.result);
      observer.complete();
    };

    reader.onerror = (event: any) => {

      observer.next(event.target.error.code);
      observer.complete();
    };
  });
}

export async function urlToBase64(http: any) {

  http.get('https://avatars0.githubusercontent.com/u/5053266?s=460&v=4', { responseType: 'blob' })
    .pipe(
      switchMap(blob => convertBlobToBase64_new(blob))
    )
    .subscribe((base64ImageUrl: any) => { return base64ImageUrl; });
}

export function formatAMPM(date: any) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes)).slice(-2) + ' ' + ampm;

  return strTime;
}

export function timeForPiker(date: any) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return { hour: Number(hours), minute: Number(minutes), meriden: ampm, format: 12 };
}
export function minutestohours(params: any) {
  var num = params;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  if (rhours > 0) {
    return rhours + " hour " + rminutes + " minute.";
  } else {
    if (rminutes > 0) {
      return rminutes + " minute.";
    } else {
      return null;
    }
  }
}

export function checkRoutePermission(role_permission_front: any) {
  return "/dashboard";
  if (role_permission_front.dashboard.View) {
    return "/dashboard";
  } else if (role_permission_front.todayActivity.View) {
    return "/todayactivity";
  } else if (role_permission_front.dailyReports.View) {
    return "/report";
  } else if (role_permission_front.projects.View) {
    return "/project-list";
  } else if (role_permission_front.users.View) {
    return "/employee-list";
  } else if (role_permission_front.changeOrders.View) {
    return "/changeorder";
  } else if (role_permission_front.vendors.View) {
    return "/vendors";
  }
  // contract
  // '/contractlisting'
  else if (role_permission_front.emailTemplates.View) {
    return "/emailtemplates";
  } else if (role_permission_front.settings.All) {
    return "/setting";
  } else {
    return "/dashboard";
  }
}

export async function logobase64() {
  return "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";
}

export async function commonFileChangeEvent(fileInput: any, acceptFileType: string) {
  return new Promise((resolve, reject) => {
    let imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      const max_size = 20971520;
      const allowed_types = ['image/png', 'image/jpeg'];
      const max_height = 15200;
      const max_width = 25600;
      let filepath = fileInput.target.files[0];
      let file_name_tmp = filepath.name;
      let file_arrya = file_name_tmp.split(".");
      let file_extention = file_arrya[file_arrya.length - 1];
      if (filepath.type == "image/webp" || filepath.type == "image/WEBP" || file_extention.toLowerCase() == "webp") {
        resolve({ status: false, message: 'File not supported' });
      } else {
        let fileType = filepath.type.split("/");
        // Check file is supported or not
        if (acceptFileType == "pdf") {
          if (filepath.type == "application/pdf") {
            resolve({ status: true, filepath: filepath });
          } else {
            resolve({ status: false, message: 'We accept only PDF Documents.' });
          }
        } else if (acceptFileType == "image") {
          // If picked file is image
          if (fileType[0] == 'image') {
            const reader = new FileReader();
            reader.readAsDataURL(fileInput.target.files[0]);
            reader.onload = (e: any) => {
              const image = new Image();
              image.src = e.target.result;
              image.onload = (rs: any) => {
                const img_height = rs.currentTarget['height'];
                const img_width = rs.currentTarget['width'];
                if (img_height > max_height && img_width > max_width) {
                  imageError =
                    'Maximum dimentions allowed ' +
                    max_height +
                    '*' +
                    max_width +
                    'px';
                  resolve({ status: false, message: imageError });
                }
                else {
                  const imgBase64Path = e.target.result;
                  resolve({ status: true, base64: imgBase64Path, filepath: filepath });
                }
              };
            };
          } else {
            resolve({ status: false, message: 'File not supported' });
          }
        } else if (fileType[0] == 'image') {
          const reader = new FileReader();
          reader.readAsDataURL(fileInput.target.files[0]);
          reader.onload = (e: any) => {
            const image = new Image();
            image.src = e.target.result;
            image.onload = (rs: any) => {
              const img_height = rs.currentTarget['height'];
              const img_width = rs.currentTarget['width'];
              if (img_height > max_height && img_width > max_width) {
                imageError =
                  'Maximum dimentions allowed ' +
                  max_height +
                  '*' +
                  max_width +
                  'px';
                resolve({ status: false, message: imageError });
              }
              else {
                const imgBase64Path = e.target.result;
                resolve({ status: true, base64: imgBase64Path, filepath: filepath });
              }
            };
          };
        } else {
          // if picked file is except image
          resolve({ status: true, filepath: filepath });
        }
      }
    }
  });
}

export function commonNewtworkAttachmentViewer(attachements) {
  var images = [];
  if (attachements != undefined) {
    for (let i = 0; i < attachements.length; i++) {
      var extension = attachements[i].substring(attachements[i].lastIndexOf(".") + 1);
      if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
        var srctmp: any = {
          small: attachements[i],
          medium: attachements[i],
          big: attachements[i],
        };
        images.push(srctmp);
      } else if (extension == "doc" || extension == "docx") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
        };
        images.push(srctmp);
      } else if (extension == "pdf") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
        };
        images.push(srctmp);
      } else if (extension == "odt") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
        };
        images.push(srctmp);
      } else if (extension == "rtf") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
        };
        images.push(srctmp);
      } else if (extension == "txt") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
        };
        images.push(srctmp);
      } else if (extension == "ppt") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
        };
        images.push(srctmp);
      } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
        };
        images.push(srctmp);
      } else {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
        };
        images.push(srctmp);
      }
    }
  }
  return images;
}

export function commonNetworkThumbImage(url: String) {
  var extension = url.substring(url.lastIndexOf(".") + 1);
  if (extension == "doc" || extension == "docx") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/doc.png";
  } else if (extension == "pdf") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png";
  } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/xls.png";
  } else if (extension == "zip") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/zip.png";
  } else if (extension == "ppt") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png";
  } else if (extension == "rtf") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png";
  } else if (extension == "odt") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/odt.png";
  } else if (extension == "txt") {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/txt.png";
  } else if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
    return url;
  } else {
    return "https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png";
  }
}

export function commonLocalThumbImage(sanitiser, file) {
  switch (file.type) {
    case "application/pdf":
      return "../../../../../../assets/images/pdf.png";
      break;
    case "image/png":
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case "image/jpeg":
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case "image/jpg":
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case "image/gif":
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "../../../../../../assets/images/doc.png";
      break;
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "../../../../../../assets/images/xls.png";
      break;
    case "application/vnd.oasis.opendocument.text":
      return "../../../../../../assets/images/odt.png";
      break;
    case "application/zip":
      return "../../../../../../assets/images/zip.png";
      break;
    case "image/svg+xml":
      return "../../../../../../assets/images/svg.png";
      break;
    case "application/vnd.ms-powerpoint":
      return "../../../../../../assets/images/ppt.png";
      break;
    default:
      return "../../../../../../assets/images/no-preview.png";
      break;
  }
}

export function notificationRoutes() {
  return [
    {
      name: 'Invoice',
      url: '/invoice-form',
    },
    {
      name: 'INVOICE',
      url: '/invoice-form',
    },
    {
      name: 'PO',
      url: '/po-detail-form',
    },
    {
      name: 'Packing Slip',
      url: '/packing-slip-form',
    },
    {
      name: 'Receiving Slip',
      url: '/receiving-slip-form',
    },
    {
      name: 'Quote',
      url: '/quote-detail-form',
    },
  ];
};
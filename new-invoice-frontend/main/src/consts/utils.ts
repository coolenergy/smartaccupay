import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxGalleryAnimation, NgxGalleryImageSize } from 'ngx-gallery-9';
import Swal from 'sweetalert2';
import { WEB_ROUTES } from './routes';
import { RolePermission } from './common.model';

export const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust font-style',
    denyButton: 'btn btn-danger s2-confirm font-style',
    cancelButton: 's2-confirm btn btn-gray ml-2 font-style',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/images/rovukinvoice.png',
  imageHeight: 50,
  imageAlt: 'Smartaccupay',
});

export const swalWithBootstrapTwoButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm font-style',
    denyButton: 'btn btn-danger s2-confirm ml-2 font-style',
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/images/rovukinvoice.png',
  imageHeight: 50,
  imageAlt: 'Smartaccupay',
});

export function showNotification(
  snackBar: MatSnackBar,
  text: string,
  colorName: string
) {
  snackBar.open(text, '', {
    duration: 5000,
    verticalPosition: 'top',
    horizontalPosition: 'right',
    panelClass: colorName == 'success' ? 'snackbar-success' : 'snackbar-danger',
  });
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
    actions: [],
  };
}

export function commonNewtworkAttachmentViewer(attachements: Array<string>) {
  const images = [];
  if (attachements != undefined) {
    for (let i = 0; i < attachements.length; i++) {
      const extension = attachements[i].substring(
        attachements[i].lastIndexOf('.') + 1
      );
      if (
        extension == 'jpg' ||
        extension == 'png' ||
        extension == 'jpeg' ||
        extension == 'gif' ||
        extension == 'webp'
      ) {
        const srctmp = {
          small: attachements[i],
          medium: attachements[i],
          big: attachements[i],
        };
        images.push(srctmp);
      } else if (extension == 'doc' || extension == 'docx') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
        };
        images.push(srctmp);
      } else if (extension == 'pdf') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
        };
        images.push(srctmp);
      } else if (extension == 'odt') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
        };
        images.push(srctmp);
      } else if (extension == 'rtf') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
        };
        images.push(srctmp);
      } else if (extension == 'txt') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
        };
        images.push(srctmp);
      } else if (extension == 'ppt') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
        };
        images.push(srctmp);
      } else if (
        extension == 'xls' ||
        extension == 'xlsx' ||
        extension == 'csv'
      ) {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
        };
        images.push(srctmp);
      } else if (extension == 'zip') {
        const srctmp = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png',
        };
        images.push(srctmp);
      } else {
        const srctmp = {
          small:
            'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
          medium:
            'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
        };
        images.push(srctmp);
      }
    }
  }
  return images;
}

export function commonNetworkThumbImage(url: string) {
  const extension = url.substring(url.lastIndexOf('.') + 1);
  if (extension == 'doc' || extension == 'docx') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/doc.png';
  } else if (extension == 'pdf') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png';
  } else if (extension == 'xls' || extension == 'xlsx' || extension == 'csv') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/xls.png';
  } else if (extension == 'zip') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/zip.png';
  } else if (extension == 'ppt') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png';
  } else if (extension == 'rtf') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png';
  } else if (extension == 'odt') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/odt.png';
  } else if (extension == 'txt') {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/txt.png';
  } else if (
    extension == 'jpg' ||
    extension == 'png' ||
    extension == 'jpeg' ||
    extension == 'gif' ||
    extension == 'webp'
  ) {
    return url;
  } else {
    return 'https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png';
  }
}

export function commonLocalThumbImage(sanitiser: DomSanitizer, file: File) {
  switch (file.type) {
    case 'application/pdf':
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png';
      break;
    case 'image/png':
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case 'image/jpeg':
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case 'image/jpg':
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case 'image/gif':
      return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
      break;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/doc.png';
      break;
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/xls.png';
      break;
    case 'application/vnd.oasis.opendocument.text':
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/odt.png';
      break;
    case 'application/zip':
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/zip.png';
      break;
    case 'image/svg+xml':
      return '../../../../../../assets/images/svg.png';
      break;
    case 'application/vnd.ms-powerpoint':
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png';
      break;
    default:
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png';
      break;
  }
}

export function amountChange(params: any) {
  params = params.target.value;
  if (params == '') {
    return '00.00';
  } else {
    let tempText = '';
    if (params.match(numbers!)) {
      var numbers = /^[0-9]+$/;
      let a = params;
      a = a.replace(/,/g, '');
      const dotIndex = a.indexOf('.');
      const count = a.substring(dotIndex + 1).length;
      let multiply;
      if (count == 1) {
        multiply = 10;
      } else {
        multiply = 1000;
      }
      const temp = (Number(a) * multiply) / 100;
      tempText = temp.toFixed(2);
    }
    const dotSplit = tempText.split('.');
    if (dotSplit[0].length > 3) {
      const code = dotSplit[0];
      const modules = code.length % 3 == 0 ? 0 : code.length + (3 - (code.length % 3));
      const newCode: any = code.padStart(modules, 'X');
      let finalCode = newCode.match(/.{1,3}/g).join(',');
      finalCode = finalCode.toString().replace(/X/g, '');
      tempText = `${finalCode}.${dotSplit[1]}`;
    }
    return tempText;
  }
}

export function numberWithCommas(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function MMDDYYYY(epochTime: any) {
  if (epochTime == 0) return '';
  const dateObj = epochTime * 1000;
  const date = new Date(dateObj);
  const date_tmp =
    ('0' + (date.getMonth() + 1)).slice(-2) +
    '/' +
    ('0' + date.getDate()).slice(-2) +
    '/' +
    date.getFullYear();
  return date_tmp;
}

export function MMDDYYYY_HH_MM_A(epochTime: number) {
  if (epochTime == 0) return '';
  const dateObj = epochTime * 1000;
  const date = new Date(dateObj);
  const date_tmp = ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + "/" + date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutes_ = minutes < 10 ? '0' + minutes : minutes;
  const strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
  return date_tmp + " " + strTime;
}

export function isValidMailFormat(email: string): any {
  const EMAIL_REGEXP =
    /^[a-z0-9!#$%&'*+\\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  if (email != '' && EMAIL_REGEXP.test(email)) {
    return { 'Please provide a valid email': true };
  }
  return null;
}

export function timeDateToepoch(new_datetime: any) {
  const dateObj = new Date(new_datetime).getTime();
  return Math.round(dateObj / 1000);
}

export function epochToDateTime(epochTime: any) {
  const dateObj = epochTime * 1000;
  return new Date(dateObj);
}

export function formatPhoneNumber(str: any) {
  //Filter only numbers from the input
  const cleaned = ('' + str).replace(/\D/g, '');
  //Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return '';
}

export function formateAmount(price: any) {
  return Number(price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function notificationRoutes() {
  return [
    {
      name: 'Invoice',
      url: WEB_ROUTES.INVOICE_DETAILS,
    },
    {
      name: 'Invoice Note',
      url: WEB_ROUTES.INVOICE_DETAILS,
    },
    {
      name: 'Quote',
      url: WEB_ROUTES.INVOICE_VIEW_DOCUMENT,
    },
    {
      name: 'PO',
      url: WEB_ROUTES.INVOICE_VIEW_DOCUMENT,
    },
    {
      name: 'Packing Slip',
      url: WEB_ROUTES.INVOICE_VIEW_DOCUMENT,
    },
    {
      name: 'Receiving Slip',
      url: WEB_ROUTES.INVOICE_VIEW_DOCUMENT,
    },
  ];
}

export function checkPermissionAfterLogin(permissions: RolePermission) {
  if (permissions.dashboard.View) {
    return WEB_ROUTES.DASHBOARD;
  } else if (permissions.vendor.View) {
    return WEB_ROUTES.VENDOR;
  } else if (permissions.clientJob.View) {
    return WEB_ROUTES.CLIENT;
  } else if (permissions.invoice.View) {
    return WEB_ROUTES.INVOICE;
  } else if (permissions.documents.View) {
    return WEB_ROUTES.DOCUMENTS;
  } else if (permissions.reports.View) {
    return WEB_ROUTES.REPORTS;
  } else if (permissions.users.View) {
    return WEB_ROUTES.USER;
  } else if (permissions.settings.View) {
    return WEB_ROUTES.SIDEMENU_SETTINGS;
  } else {
    return WEB_ROUTES.DASHBOARD;
  }
}
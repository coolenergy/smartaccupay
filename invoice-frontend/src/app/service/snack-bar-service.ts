import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class Snackbarservice {
    constructor() { }

    openSnackBar(message: string, action: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            // imageUrl: './assets/logo/invoice_logo.png',
            // imageHeight: 50,
            // imageAlt: 'A branding image',
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        message = `<div class="d-flex justify-content-between"><span>${message}</span> <span class="m-auto"><img src='./assets/logo/invoice_logo.png' height='40px'/></span></div>`;
        if (action == 'success') {
            Toast.fire({
                width: 400,
                icon: action,
                title: message,
            });
        } else if (action == 'warning') {
            Toast.fire({
                width: 400,
                icon: action,
                title: message
            });
        } else if (action == 'info') {
            Toast.fire({
                width: 400,
                icon: action,
                title: message
            });
        } else {
            Toast.fire({
                width: 400,
                icon: "error",
                title: message
            });
        }
    }

    handleError(error: any) {
        if (error.error instanceof Error) {

            let errMessage = error.error.message;
            return throwError(errMessage);
        }
        return throwError(error);
    }
}



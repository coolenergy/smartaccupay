import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModeDetectService {
    private subject = new Subject<any>();

    sendModeDetect(mode: string) {
        this.subject.next({ mode: mode });
    }

    clearModeDetects() {
        this.subject.next();
    }

    onModeDetect(): Observable<any> {
        return this.subject.asObservable();
    }
}
/*
 *
 * Rovuk A/P
 *
 * This component is used for help FAQ and Contact Support.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { localstorageconstants } from 'src/app/consts';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ModeDetectService } from '../components/map/mode-detect.service';
import { AuthService } from '../superadmin/auth/services/auth.service';

@Component({
  selector: 'app-helppage',
  templateUrl: './helppage.component.html',
  styleUrls: ['./helppage.component.scss']
})

export class HelppageComponent implements OnInit {
  public contact_support_form: any;
  Help_Page_Team_Sent_Successfully: string = "";
  subscription: Subscription;
  mode: any;


  constructor (public authservice: AuthService, private modeService: ModeDetectService, public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Help_Page_Team_Sent_Successfully = this.translate.instant('Help_Page_Team_Sent_Successfully');
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {

    } else {

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
      } else {
        this.mode = 'on';
      }
    });

  }

  ngOnInit(): void {
    this.contact_support_form = new FormGroup({
      help_email: new FormControl("", [Validators.required, Validators.email]),
      help_phone: new FormControl("", [Validators.required]),
      help_subject: new FormControl("", [Validators.required]),
      help_message: new FormControl("", [Validators.required])
    });
  }

  /*
  contact us form send button action
  */
  public sendButtonAction(): void {
    if (this.contact_support_form.valid) {
      const that = this;
      this.uiSpinner.spin$.next(true);
      this.authservice.helpSupport(this.contact_support_form.value).subscribe(function (data) {
        if (data.status) {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(that.Help_Page_Team_Sent_Successfully, 'success');
          that.contact_support_form.reset();
          Object.keys(that.contact_support_form.controls).forEach(key => {
            that.contact_support_form.get(key)!.setErrors(null);
          });
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(data.message, 'error');
        }
      });
    }
  }

  items = [
    // {
    //   "question": "How can I see my employee’s private information?",
    //   "answer": "To be able to check private information from your employee’s such as SSN or salary you can follow the steps from  <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=YQMBCpcaJjc' target='_blank'>this video</a>"
    // },
    {
      "question": "How can I create and edit a shift for my employees?",
      "answer": "Businesses use different types of work shifts depending on their type of work. Some companies have employees work consistent shifts while others use rotating shifts. Here is how you can <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=AfGPbe7dS6E' target='_blank' >create one</a>"
    },
    {
      "question": "I need to edit my employee’s payroll rules",
      "answer": "If you need to change payroll rules on your employees such as overtime, auto breaks, job titles, job types, and documents for your employee profile you need to <a  class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=kBt8f1MxIuc' target='_blank'> follow this instruction.</a>"
    },
    {
      "question": "How can I add a new Timecard if my employees forgot to clockin?",
      "answer": "Timecards are an excellent tool that allows your company to have better productivity and profitability. You can analyze all the resources of the workforce to improve your administrative processes. If you ever need to add a manual timecard, please check out this <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=00QM9cAsee0' target='_blank'> video</a>"
    },
    // {
    //   "question": "What kind of reports are available with Clockinapp?",
    //   "answer": "Our software offers a broad variety of useful tools and data collection. Report is one of them, here you can export files with plenty amount of information. Take a lookat our YouTube channel to learn all the <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=NEhA-kXAX7Q' target='_blank'>types of reports </a> you can create and export."
    // },
    // {
    //   "question": "Do I need to create a shift before creating a schedule?",
    //   "answer": "Yes, you need to create a shift first to be able to set up a schedule for your employees. Once you create a shift this will show as an option for your scheduling process. Here is how you <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=2kLY3p2z2GU' target='_blank'>can set up a schedule</a> step by step."
    // },
    {
      "question": "How can I change or edit the clock in our questions?",
      "answer": "Our software has the option to make questions when the employees are clock in out every time they are finishing their shift. We have questions premade that you can edit, delete or add new ones. You can also deactivate them anytime. Please check the <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=BoLdiu2bjb0' target='_blank'>video</a> to learn more."
    },
    // {
    //   "question": "How can I add a device for my employees?",
    //   "answer": "Adding a device such asa tablet or iPad is important if you want to make timecards effortless. If you want your employees to clockin from a tablet in the office or main area just <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=f3UUHVVMZy4' target='_blank'> add a new device </a>to be able to log in from it anytime."
    // },
    // {
    //   "question": "How easy is it to clock in from a tablet?",
    //   "answer": "Being able to <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=HnVBztEC7Us' target='_blank'> clock In from an external device </a> only takes 10 seconds and you only need a PIN provided by the employee’s profile information."
    // },
    // {
    //   "question": "How can my employees clock In from their phones?",
    //   "answer": "Once they download the app, they only need to fill out the basic information and follow <a class='faq-accordion-item-body-a' href='https://www.youtube.com/watch?v=E4VG96uDFrk' target='_blank'>these steps.</a>"
    // }
  ];
  expandedIndex = 0;

}


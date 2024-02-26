import { Component } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent {
  apEmployeeCount: number = 0;
  apEmployeeSalary: number = 0;
  amountInvoices: number = 0;
  amountDocuments: number = 0;
  savings: String = '';

  calculateSavings() {
    if (this.apEmployeeCount && this.apEmployeeSalary && this.amountInvoices) {
      const saving = (this.apEmployeeCount * this.apEmployeeSalary) / this.amountInvoices;
      this.savings = saving.toFixed(2);
    }
  }
}
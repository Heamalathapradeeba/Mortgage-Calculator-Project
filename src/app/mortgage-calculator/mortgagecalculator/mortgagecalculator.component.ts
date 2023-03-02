import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/data.service';
import { CalculationSummary } from 'src/app/models/calculation-summary.interface';
import { greaterThanValueValidator } from 'src/app/shared/greaterThanValueValidator/greater-than-value.directive';
import { interestValueValidator } from 'src/app/shared/interestValueValidator/interest-value.directive';
import { paymentValueValidator } from 'src/app/shared/paymentValueValidator/payment-value.directive';
import { yearsArray } from 'src/app/years';

@Component({
  selector: 'app-mortgagecalculator',
  templateUrl: './mortgagecalculator.component.html',
  styleUrls: ['./mortgagecalculator.component.scss']
})
export class MortgagecalculatorComponent implements OnInit {
 yearsArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20.21,22,23,24,25];
 termYearsArray: yearsArray[] = [];
 showPaymentCalculation: boolean = false;
 paymentForm: FormGroup = this.formBuilder.group({
  mortgageAmount:      ['', [Validators.required, paymentValueValidator()]],
  interestRate:        ['', [Validators.required, interestValueValidator()]],
  amortizationPeriod:  ['', Validators.required],
  paymentFrequency:    ['', Validators.required],
  term:                ['',[Validators.required, greaterThanValueValidator('amortizationPeriod')]],
  prepaymentAmount:    ['',[greaterThanValueValidator('mortgageAmount')]],
  prepaymentFrequency: [''],
  startWithPayment:    ['',[greaterThanValueValidator('mortgageAmount')]],
});
  numberOfAmortizationPayments: number | string = 12;
  numberOfTermPayments: number = 12;
  mortgagePayment: number = 0;
  showMandateAlert: boolean = false;
  paymentCalculationArray: CalculationSummary[] = [];

  // these variables are for term column calculation
  termPrincipalAmount: number = 0;
  totalTermPrincipalPaid: number = 0;
  totalTermInterestPayments: number = 0;
  totalTermCost: number = 0;
  
  // these variables are for amortization column calculation
  totalInterestSum: number = 0;
  amortizationPeriod: number = 0;
  totalAmortizationCost: number = 0;
  principalMortgageAmount: any;

  // these variables are for prepayment calculation
  numberOfPrepaymentMonths: number = 0;
  prePaymentAmount: number = 0;
  outstandingPrincipalBalance: number = 0;
  totalPrincipalPaid: number = 0;
  remainingValueForPrepayment: number = 0;
  totalPrepaymentAmount: number = 0;
 
  selectedPaymentFrequency: string = '';
  numberOfTermYears: string = '';
  termInterestSavingswithPrepayment: number= 0;
  amortizationInterestSavingswithPrepayment: number = 0;
  message: string = '';
  type!: string;
  prepaymentFrequency: string = '';

  constructor(private formBuilder: FormBuilder, private dataservice: DataService) {
   }

  ngOnInit(): void {
    this.getYears();
  }

  getYears(){
      this.dataservice.getYearsArray().subscribe(res => {
        this.termYearsArray = res;
        console.log(this.termYearsArray, 'Termyears');
      })
  }

  // calculation for mortgage payment
  calculatePayment(){
  // if payment form is invalid
    if(!this.paymentForm.valid){
      this.showMandateAlert = true;
      return
    }
    // if payment form is valid
    else{
      // if payment array has previous data then reset it
      if(this.paymentCalculationArray.length !== 0){
        this.paymentCalculationArray.length = 0;

         //resetting all values to zero
         this.totalPrepaymentAmount, this.totalInterestSum, this.totalPrincipalPaid, this.totalPrepaymentAmount
         this.outstandingPrincipalBalance, this.termInterestSavingswithPrepayment, this.amortizationInterestSavingswithPrepayment  =  0;  
      }
      // reset mandate alert boolean
      this.showMandateAlert = false;

      // number of payments differs for payment frequency
  switch(this.paymentForm.value.paymentFrequency){
      case 'Accelerated Weekly':{
         this.numberOfAmortizationPayments = 56*this.paymentForm.value.amortizationPeriod;
         this.numberOfTermPayments         = 56*this.paymentForm.value.term.value;
         break;
      }
       case 'Weekly': {
       this.numberOfAmortizationPayments = 54*this.paymentForm.value.amortizationPeriod;
       this.numberOfTermPayments         = 54*this.paymentForm.value.term.value;
       break;
       }
       case 'Accelerated Bi-weekly': {
       this.numberOfAmortizationPayments = 24*this.paymentForm.value.amortizationPeriod;
       this.numberOfTermPayments         = 24*this.paymentForm.value.term.value;
       break;
       }
      case 'Bi-weekly(every 2 weeks)': {
      this.numberOfAmortizationPayments = 26*this.paymentForm.value.amortizationPeriod;
      this.numberOfTermPayments         = 26*this.paymentForm.value.term;
      break;
      }
    case 'Semi-monthly(24x per year)': {
     this.numberOfAmortizationPayments = 24*this.paymentForm.value.amortizationPeriod;
     this.numberOfTermPayments         = 24*this.paymentForm.value.term;
     break;
      }
     default: {
     this.numberOfAmortizationPayments = 12*this.paymentForm.value.amortizationPeriod;
     this.numberOfTermPayments         = 12*this.paymentForm.value.term;
     break;
  }
}

this.amortizationPeriod               = this.paymentForm.value.amortizationPeriod;
this.principalMortgageAmount          = this.paymentForm.value.mortgageAmount;
this.selectedPaymentFrequency         = this.paymentForm.value.paymentFrequency;
this.numberOfTermYears                = this.paymentForm.value.term;
this.prepaymentFrequency              = this.paymentForm.value.prepaymentFrequency;


// formulae used for calculation
// A = P[((1+i)n*i/(1+i)n - 1] here (1+i)n is exponential of interest 
// i is interest rate which is i/100, converting p.annum interest for monthly so 1/100/12 

const interestRatePerMonth              = (this.paymentForm.value.interestRate/100)/12;
const exponentialOfInterest             = Math.pow(1+interestRatePerMonth, this.numberOfAmortizationPayments);
// mortgage payment per payment frequency
this.mortgagePayment                    = (this.paymentForm.value.mortgageAmount)*((exponentialOfInterest*interestRatePerMonth)/(exponentialOfInterest-1));

// if prepayment amount is entered by user
this.calculatePaymentValues(this.paymentForm.value.mortgageAmount, 1);
this.totalTermCost                       = this.termPrincipalAmount+this.totalTermInterestPayments;

if(this.paymentForm.value.prepaymentAmount > 0){
  this.totalAmortizationCost                      = Number(this.paymentForm.value.mortgageAmount)+this.remainingValueForPrepayment+this.totalPrepaymentAmount;
  this.termInterestSavingswithPrepayment          = (this.mortgagePayment*this.numberOfTermPayments)+this.totalPrepaymentAmount - this.totalTermInterestPayments;
  this.amortizationInterestSavingswithPrepayment  = (this.mortgagePayment*this.numberOfAmortizationPayments)+this.totalPrepaymentAmount - this.totalAmortizationCost
  this.numberOfAmortizationPayments               = this.numberOfPrepaymentMonths+' + '+' 1 final payment of '+'$'+parseFloat(this.remainingValueForPrepayment.toFixed(2));
 
  // rounding off the values
  this.termInterestSavingswithPrepayment           = parseFloat(this.termInterestSavingswithPrepayment.toFixed(2));
  this.amortizationInterestSavingswithPrepayment   = parseFloat(this.amortizationInterestSavingswithPrepayment.toFixed(2));
}else{
    this.totalAmortizationCost             = Number(this.principalMortgageAmount)+this.totalInterestSum;
}


// rounding off the value
this.mortgagePayment                     = parseFloat(this.mortgagePayment.toFixed(2));
this.termPrincipalAmount                 = parseFloat(this.termPrincipalAmount.toFixed(2));
this.totalTermInterestPayments           = parseFloat(this.totalTermInterestPayments.toFixed(2));
this.totalInterestSum                    = parseFloat(this.totalInterestSum.toFixed(2));
this.totalPrepaymentAmount               = parseFloat(this.totalPrepaymentAmount.toFixed(2));
this.totalAmortizationCost               = parseFloat(this.totalAmortizationCost.toFixed(2));
this.totalTermCost                       = parseFloat(this.totalTermCost.toFixed(2));

this.paymentCalculationArray.push(
  {title: "The number of payments made during the Term and Amoritization period respectively.",
   category:'Number Of Payments', termValue:this.numberOfTermPayments, amortizationValue: this.numberOfAmortizationPayments}, 
  {title: "The amount you will pay per period during the Term and Amoritization respectively, which include a portion for the principal payment and a portion for the interest payment.",
   category:'Mortgage Payment',  termValue:'$'+this.mortgagePayment, amortizationValue: '$'+this.mortgagePayment}, 
  {title: "The amount of prepayment made during the Term and Amoritization period respectively.",
    category:'Prepayment',        termValue:'$'+this.totalPrepaymentAmount, amortizationValue: '$'+this.totalPrepaymentAmount},
  {title: "The total amount of principal payment made during the Term and Amoritization period respectively.",
    category:'Principal Payments',termValue:'$'+this.termPrincipalAmount, amortizationValue: '$'+this.paymentForm.value.mortgageAmount},
  {title: "Total of all interest paid during the Term and Amoritization period respectively.",
    category:'Interest Payments', termValue:'$'+this.totalTermInterestPayments, amortizationValue: '$'+this.totalInterestSum}, 
  {title: "Total of all payments made during the Term and Amoritization period respectively.",category: 'Total Cost',  termValue:'$'+this.totalTermCost, amortizationValue: '$'+this.totalAmortizationCost}
  );

  if(this.paymentForm.value.prepaymentAmount > 0){
    this.paymentCalculationArray.push({
      'title': "Total amount of interest you would save by making prepayments on your mortgage during the Term (if any) and Amoritization period respectively.", 'category': 'Interest Savings with Prepayment Plan', 'termValue': '$'+this.termInterestSavingswithPrepayment, 'amortizationValue': '$'+this.amortizationInterestSavingswithPrepayment
    })
  }
  this.showPaymentCalculation = true;
    }  
  }

  trackByPayment(index: number, pay: any): any{
    return pay.category
  }

// below function calculate payment values
calculatePaymentValues(outstandingPrincipal: number, n: number): any{
   // calculate remaining and number of payments if prepayment exists
    if(this.paymentForm.value.prepaymentAmount > 0 && outstandingPrincipal < this.mortgagePayment){
      // this conditions works if overall payment frequency falls below number of term payments
      if(n < this.numberOfTermPayments){
        this.totalTermInterestPayments  = this.totalInterestSum;
        this.termPrincipalAmount = this.totalPrincipalPaid;
      }
    this.numberOfPrepaymentMonths = n-1;
    this.remainingValueForPrepayment = outstandingPrincipal;
    return
    }
  // this condition checks if current frequency is greater than number of term payment frequency if yes it return
    if(n === this.numberOfTermPayments){
      this.totalTermInterestPayments  = this.totalInterestSum;
      this.termPrincipalAmount = this.totalPrincipalPaid;
    }

     if(n === this.numberOfAmortizationPayments){
      return
     }
         
       // interest differs for every payment as principal is getting subtracted from original loan amount after every payment
       var currentInterestPaid   = outstandingPrincipal*((this.paymentForm.value.interestRate/100)/12);    
       //  adding cumulative interest(overall interest paid until current payment)
       this.totalInterestSum     = this.totalInterestSum+currentInterestPaid;
      //  principal paid on current payment frequency
       var currentPrincipalPaid   = this.mortgagePayment - currentInterestPaid;
      //  adding cumulative term principal payment
      this.totalPrincipalPaid = this.totalPrincipalPaid+currentPrincipalPaid;
      // outstandingPrincipalBalance is after we paid the mortgage payment for that frequency inorder to calculate the remaining prinicpal balance on that frequency
      this.outstandingPrincipalBalance = this.paymentForm.value.mortgageAmount - this.totalPrincipalPaid;
  
      // if prepayment frequency is selected as one time
      if(this.paymentForm.value.prepaymentFrequency === 'One time' && n === Number(this.paymentForm.value.startWithPayment)){
        this.totalPrincipalPaid           = this.totalPrincipalPaid + Number(this.paymentForm.value.prepaymentAmount);
        this.outstandingPrincipalBalance = this.outstandingPrincipalBalance - Number(this.paymentForm.value.prepaymentAmount);
        this.totalPrepaymentAmount        = Number(this.paymentForm.value.prepaymentAmount);
      }
      // if prepayment frequency is selected as each year 
      else if(this.paymentForm.value.prepaymentFrequency === 'Each year'){
        // if paymentFrequency is semi-monthly / bi-weekly/accelerated then each year falls divided by 2 of the whole payment
        if(this.paymentForm.value.paymentFrequency === 'Semi-monthly(24x per year)' || this.paymentForm.value.paymentFrequency === 'Accelerated Bi-weekly' || this.paymentForm.value.paymentFrequency ==='Bi-weekly(every 2 weeks)' && (n/2)%12 === 0){
          this.calculatePrepaymentValues();
        }
        // if paymentFrequency is weekly then each year falls divided by 2 of the whole payment
        else if(this.paymentForm.value.paymentFrequency === 'Weekly' && (n/4.5)%12 === 0){
         this.calculatePrepaymentValues();
        }
        // if paymentFrequency is accelerated weekly then each year falls divided by 2 of the whole payment
        else if(this.paymentForm.value.paymentFrequency === 'Accelerated Weekly' && (n/4.666)%12 === 0){
          this.calculatePrepaymentValues();
         }
        else{
          this.calculatePrepaymentValues();
         }
        
      }
      // if prepayment frequency is selected as regular payment
      else if(this.paymentForm.value.prepaymentFrequency === 'Same as regular payment'){
        this.calculatePrepaymentValues();
      }
      return this.calculatePaymentValues(this.outstandingPrincipalBalance, n+1);
  }

calculatePrepaymentValues(){
  this.totalPrincipalPaid          = this.totalPrincipalPaid + Number(this.paymentForm.value.prepaymentAmount);
  this.totalPrepaymentAmount       = this.totalPrepaymentAmount+Number(this.paymentForm.value.prepaymentAmount);;
  this.outstandingPrincipalBalance = this.outstandingPrincipalBalance - Number(this.paymentForm.value.prepaymentAmount);
}  
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { greaterThanValueValidator } from 'src/app/shared/greaterThanValueValidator/greater-than-value.directive';
import { interestValueValidator } from 'src/app/shared/interestValueValidator/interest-value.directive';
import { paymentValueValidator } from 'src/app/shared/paymentValueValidator/payment-value.directive';

@Component({
  selector: 'app-mortgagecalculator',
  templateUrl: './mortgagecalculator.component.html',
  styleUrls: ['./mortgagecalculator.component.scss']
})
export class MortgagecalculatorComponent implements OnInit {
public yearsArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20.21,22,23,24,25];
public termYearsArray = [1,2,3,4,5,6,7,8,9,10];
public showPaymentCalculation: boolean = false;
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
  showMandateAlert: boolean = false;
  paymentPlanArray: any = [];
  termPrincipalAmount: number = 0;
  totalLoanPaid: number = 0;
  termInterestSum: number = 0;
  amortizationInterestSum: number = 0
  amortizationPeriod: any;
  mortgagePayment: number = 0;
  totalAmortizationCost: number = 0;
  totalAmortizationInterestPayments: number = 0;
  totalTermCost: number = 0;
  totalTermInterestPayments: number = 0;
  principalMortgageAmount: any;
  prePaymentAmount: number = 0;
  outstandingPrincipalBalance: number = 0;
  totalPrincipalPaid: number = 0;
  totalTermPrincipalPaid: number = 0;
  outstandingTermPrincipalBalance: number = 0;
  numberOfPrepaymentMonths: number = 0;
  remainingValueForPrepayment: number = 0;
  totalPrepaymentAmount: number = 0;
  temp: any;
  selectedPaymentFrequency: string = '';
  numberOfTermYears: string = '';

  constructor(private formBuilder: FormBuilder) {
   }

  ngOnInit(): void {
    
  }

  // calculation for mortgage payment
  calculatePayment(){
    console.log(this.paymentForm.value, 'paymentvalues')
    if(!this.paymentForm.valid){
      this.showMandateAlert = true;
      return
    }else{
      this.showMandateAlert = false;
// number of payments differs for payment frequency
switch(this.paymentForm.value.paymentFrequency){
  case 'Accelerated Weekly':{
    this.numberOfAmortizationPayments = 56*this.paymentForm.value.amortizationPeriod;
    this.numberOfTermPayments         = 56*this.paymentForm.value.term;
    break;
  }
  case 'Weekly': {
    this.numberOfAmortizationPayments = 54*this.paymentForm.value.amortizationPeriod;
    this.numberOfTermPayments         = 54*this.paymentForm.value.term;
    break;
  }
  case 'Accelerated Bi-weekly': {
    this.numberOfAmortizationPayments = 24*this.paymentForm.value.amortizationPeriod;
    this.numberOfTermPayments         = 24*this.paymentForm.value.term;
    break;
  }
  case 'Bi-weekly(every 2 weeks)': {
    this.numberOfAmortizationPayments = 26*this.paymentForm.value.amortizationPeriod;
    this.numberOfTermPayments         = 26*this.paymentForm.value.term;
    break;
  }
  case 'Semi-Monthly(24x per year)': {
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


// formulae used for calculation
// A = P[((1+i)n*i/(1+i)n - 1] here (1+i)n is exponential of interest 
// i is interest rate which is i/100, converting p.annum interest for monthly so 1/100/12 

const interestRatePerMonth              = (this.paymentForm.value.interestRate/100)/12;
const exponentialOfInterest             = Math.pow(1+interestRatePerMonth, this.numberOfAmortizationPayments);
// mortgage payment per payment frequency
this.mortgagePayment                    = (this.paymentForm.value.mortgageAmount)*((exponentialOfInterest*interestRatePerMonth)/(exponentialOfInterest-1));

// if prepayment amount is entered by user
if(this.paymentForm.value.prepaymentAmount > 0){
  this.calculateNumberOfPayments(this.paymentForm.value.mortgageAmount, 1);
  console.log(this.remainingValueForPrepayment, this.totalPrepaymentAmount, this.mortgagePayment*this.numberOfPrepaymentMonths, this.numberOfPrepaymentMonths);
  this.totalAmortizationCost              = Number((this.mortgagePayment*this.numberOfPrepaymentMonths)+this.remainingValueForPrepayment+this.totalPrepaymentAmount);
  this.numberOfAmortizationPayments       = this.numberOfPrepaymentMonths+' + '+' 1 final payment of '+'$'+this.remainingValueForPrepayment;
}else{
  this.totalAmortizationCost              = this.mortgagePayment*this.numberOfAmortizationPayments;
}

this.totalAmortizationInterestPayments  = this.totalAmortizationCost - this.paymentForm.value.mortgageAmount;

// term payment calculation
this.totalTermCost                      = this.mortgagePayment*this.numberOfTermPayments;
this.calculatetermPrincipalAmount(this.paymentForm.value.mortgageAmount, 1, this.mortgagePayment);
this.totalTermInterestPayments = this.totalTermCost - this.termPrincipalAmount;

// rounding off the value
this.mortgagePayment                     = parseFloat(this.mortgagePayment.toFixed(2));
this.totalAmortizationCost               = parseFloat(this.totalAmortizationCost.toFixed(2));
this.totalTermCost                       = parseFloat(this.totalTermCost.toFixed(2));
this.totalAmortizationInterestPayments   = parseFloat(this.totalAmortizationInterestPayments.toFixed(2));
this.termPrincipalAmount                 = parseFloat(this.termPrincipalAmount.toFixed(2));
this.totalTermInterestPayments           = parseFloat(this.totalTermInterestPayments.toFixed(2));
this.totalPrepaymentAmount               = parseFloat(this.totalPrepaymentAmount.toFixed(2));

this.paymentPlanArray.push(
  {'category':'Number Of Payments',  'termValue':this.numberOfTermPayments, 'amortizationValue': this.numberOfAmortizationPayments}, 
  {'category':'Mortgage Payment',  'termValue':'$'+this.mortgagePayment, 'amortizationValue': '$'+this.mortgagePayment}, 
  {'category':'Prepayment',        'termValue':'$'+this.totalPrepaymentAmount, 'amortizationValue': '$'+this.totalPrepaymentAmount},
  {'category':'Principal Payments','termValue':'$'+this.termPrincipalAmount, 'amortizationValue': '$'+this.paymentForm.value.mortgageAmount},
  {'category':'Interest Payments', 'termValue':'$'+this.totalTermInterestPayments, 'amortizationValue': '$'+this.totalAmortizationInterestPayments}, 
  {'category': 'Total Cost',       'termValue':'$'+this.totalTermCost, 'amortizationValue': '$'+this.totalAmortizationCost}
  );
  console.log(this.paymentPlanArray, 'paymentplan');
  this.showPaymentCalculation = true;
    }  
  
  }


  calculatetermPrincipalAmount(currentOutstandingBalance: number, n: number, amortizationAmount: number):any{
    // console.log(currentOutstandingBalance, n, 'term', this.totalTermPrincipalPaid);
   if(n > this.numberOfTermPayments){
   return this.termPrincipalAmount = this.totalTermPrincipalPaid;
  }
  // this.calculateCumulativeValues(principal, n, 'termPayment');
  var interestPayable = currentOutstandingBalance*((this.paymentForm.value.interestRate/100)/12);
  //  adding cumulative term interest
   this.termInterestSum     = this.termInterestSum+interestPayable;
  //  console.log(this.termInterestSum, 'interestsum');

  //  principal paid on current payment frequency
   var currentTermPrincipalPaid   = this.mortgagePayment - interestPayable;

  //  adding cumulative term principal payment
    this.totalTermPrincipalPaid = this.totalTermPrincipalPaid+currentTermPrincipalPaid;
    this.outstandingTermPrincipalBalance = this.paymentForm.value.mortgageAmount - this.totalPrincipalPaid;
    // calling term principal function recursively
    return  this.calculatetermPrincipalAmount(this.outstandingTermPrincipalBalance, n+1, amortizationAmount);
  }



  calculateNumberOfPayments(balancePrepaymentPrincipal: number, n: number): any{
    console.log(balancePrepaymentPrincipal, n, 'prepayment')
    if(balancePrepaymentPrincipal < this.mortgagePayment){
      // console.log(this.mortgagePayment - balancePrepaymentPrincipal, balancePrepaymentPrincipal, n, this.mortgagePayment, 'prepaymentfinal');
      return this.getprepaymentValues(balancePrepaymentPrincipal, n);
    }
       // this.calculateCumulativeValues(principal, n, 'termPayment');
       var interestPayable = balancePrepaymentPrincipal*((this.paymentForm.value.interestRate/100)/12);
     
       //  adding cumulative interest for prepayment
       this.amortizationInterestSum     = this.amortizationInterestSum+interestPayable;
       console.log(interestPayable, this.amortizationInterestSum, 'amortizationinterest');

      //  principal paid on current payment frequency
       var currentPrincipalPaid   = this.mortgagePayment - interestPayable;

      //  adding cumulative term principal payment
      this.totalPrincipalPaid = this.totalPrincipalPaid+currentPrincipalPaid;
      this.outstandingPrincipalBalance = this.paymentForm.value.mortgageAmount - this.totalPrincipalPaid;
  
      this.temp = this.paymentForm.value.startWithPayment;
      if(this.paymentForm.value.prepaymentFrequency === 'One time' && n === Number(this.paymentForm.value.startWithPayment)){
        this.totalPrincipalPaid = this.totalPrincipalPaid + Number(this.paymentForm.value.prepaymentAmount);
        // console.log(this.outstandingPrincipalBalance, 'out1');
        this.outstandingPrincipalBalance = this.outstandingPrincipalBalance - Number(this.paymentForm.value.prepaymentAmount)
        // console.log(this.outstandingPrincipalBalance, 'out2');
        this.totalPrepaymentAmount            = Number(this.paymentForm.value.prepaymentAmount);
      }else if(this.paymentForm.value.prepaymentFrequency === 'Each year' && n%12 === 0){
        this.totalPrepaymentAmount       = this.totalPrepaymentAmount+this.paymentForm.value.prepaymentAmount;
        this.outstandingPrincipalBalance = this.outstandingPrincipalBalance - this.paymentForm.value.prepaymentAmount;
      }else if(this.paymentForm.value.prepaymentFrequency === 'Same as regular payment'){
        this.totalPrepaymentAmount       = this.totalPrepaymentAmount+this.paymentForm.value.prepaymentAmount;
        this.outstandingPrincipalBalance = this.outstandingPrincipalBalance - this.paymentForm.value.prepaymentAmount;
      }
      return this.calculateNumberOfPayments(this.outstandingPrincipalBalance, n+1);
  }

   getprepaymentValues(balance: number, n: number): any{
    this.numberOfPrepaymentMonths = n;
    this.remainingValueForPrepayment = balance;
   }


  }


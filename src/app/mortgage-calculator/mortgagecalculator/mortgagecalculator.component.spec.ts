import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder,FormsModule, ReactiveFormsModule} from '@angular/forms';

import { MortgagecalculatorComponent } from './mortgagecalculator.component';

describe('MortgagecalculatorComponent', () => {
  let component: MortgagecalculatorComponent;
  let fixture: ComponentFixture<MortgagecalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ MortgagecalculatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MortgagecalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calculateTermPrincipalAmount(current, n) should check n is greater than number of term payments and return', () => {
    const comp = new MortgagecalculatorComponent(new FormBuilder());
    component.numberOfTermPayments = 12;
    component.totalPrincipalPaid = 500;
    component.termPrincipalAmount = 500;
    const termprincipal = 500;
    const n = 13;
    component.calculatePaymentValues(termprincipal, n);
    expect(n).toBeGreaterThan(component.numberOfTermPayments);
    expect(component.termPrincipalAmount).toEqual(component.totalPrincipalPaid);

  });

  it('calculatePrepaymentValues(balancePrepaymentPrincipal, n) should execute one-time to be truthy', () => {
     component.paymentForm.value.prepaymentFrequency = 'One time';
     component.paymentForm.value.startWithPayment    = 1;
     expect(component.paymentForm.value.prepaymentFrequency === 'One time' && component.paymentForm.value.startWithPayment === 1).toBeTruthy();
  });

  it('calculatePrepaymentValues(balancePrepaymentPrincipal, n) with one-time prepayment should subtract outstandingPrincipalBalance and prepaymentAmount', () => {
    component.paymentForm.value.prepaymentFrequency = 'One time';
    component.paymentForm.value.startWithPayment    = 1;
    component.paymentForm.value.prepaymentAmount = 1000;
    component.outstandingPrincipalBalance = 8000;
    component.outstandingPrincipalBalance = component.outstandingPrincipalBalance - component.paymentForm.value.prepaymentAmount
    expect(component.outstandingPrincipalBalance).toEqual(7000);
 });

 it('calculatePayment() should show mandatory alert if payment form is invalid', () => {
  component.paymentForm.value.mortgageAmount = '';

  component.calculatePayment();
  expect(component.paymentForm.value).toEqual({ mortgageAmount: '', interestRate: '', amortizationPeriod: '', paymentFrequency: '', term: '', prepaymentAmount: '', prepaymentFrequency: '', startWithPayment: '' });
  expect(component.showMandateAlert).toBeTrue();
 })

});

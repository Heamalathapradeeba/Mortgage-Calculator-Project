import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function paymentValueValidator(): ValidatorFn{
   return (control: AbstractControl): ValidationErrors | null => {
    // console.log(control.value, 'controlvaluespayment');
    if(!control.value){
        return null;
    }
   const isValid = control.value > 0
   return !isValid ? {paymentValue: true} : null;
   }
}
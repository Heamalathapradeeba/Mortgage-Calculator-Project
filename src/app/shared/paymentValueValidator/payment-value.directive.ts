import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function paymentValueValidator(): ValidatorFn{
   return (control: AbstractControl): ValidationErrors | null => {
    if(!control.value){
        return null;
    }
   const isValid = control.value > 0
   return !isValid ? {paymentValue: true} : null;
   }
}
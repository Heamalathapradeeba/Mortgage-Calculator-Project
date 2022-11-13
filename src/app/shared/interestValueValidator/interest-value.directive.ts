import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function interestValueValidator(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
        if(!control.value){
            return null
        }
        return control.value < 0 || control.value > 100 ? {invalidInterest: true} : null
    }
}
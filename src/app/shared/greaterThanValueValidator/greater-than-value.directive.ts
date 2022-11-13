import { identifierName } from "@angular/compiler";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function greaterThanValueValidator(fieldName: string): ValidatorFn{
    return (control: AbstractControl<any>): ValidationErrors | null => {
        if(!control.value){
            return null
        }
        const group = control.parent;
        const fieldToCompare =  group?.get(fieldName);
        // if(!fieldToCompare!.value){
        //     return null
        // }
        if(fieldName === 'amortizationPeriod'){
        return Number(control.value) > Number(fieldToCompare!.value) ? {'isTermValueGreater': true} : null
        }
        return Number(control.value) > Number(fieldToCompare!.value) ? {'isCurrentValueGreater': true} : null
    }
}
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MortgagecalculatorComponent } from './mortgage-calculator/mortgagecalculator/mortgagecalculator.component';
import { HeaderComponent } from './shared/header/header/header.component';
import { FooterComponent } from './shared/footer/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyFormatterDirective } from './shared/currencyFormatterDirective/currency-formatter.directive';


@NgModule({
  declarations: [
    AppComponent,
    MortgagecalculatorComponent,
    HeaderComponent,
    FooterComponent,
    CurrencyFormatterDirective,
   

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

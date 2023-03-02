import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MortgagecalculatorComponent } from './mortgage-calculator/mortgagecalculator/mortgagecalculator.component';
import { HeaderComponent } from './shared/header/header/header.component';
import { FooterComponent } from './shared/footer/footer/footer.component';
import { CurrencyFormatterDirective } from './shared/currencyFormatterDirective/currency-formatter.directive';
import { DataService } from './data.service';


@NgModule({
  declarations: [
    AppComponent,
    MortgagecalculatorComponent,
    HeaderComponent,
    FooterComponent,
    CurrencyFormatterDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }

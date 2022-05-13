import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';

import { TradeRoutingModule } from './trade-routing.module';
import { TradeComponent } from './trade.component';
import { LimitOrderFormComponent } from './limit-order-form/limit-order-form.component';
import { MarketOrderFormComponent } from './market-order-form/market-order-form.component';
import { StopLimitOrderFormComponent } from './stop-limit-order-form/stop-limit-order-form.component';
import { OrdersListComponent } from './orders-list/orders-list.component';

@NgModule({
  declarations: [
    TradeComponent,
    LimitOrderFormComponent,
    MarketOrderFormComponent,
    StopLimitOrderFormComponent,
    OrdersListComponent
  ],
  imports: [
    CommonModule,
    TradeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatDividerModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule
  ] 
})
export class TradeModule { }

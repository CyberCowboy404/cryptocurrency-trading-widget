import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TickerService } from 'src/app/core/services/ticker.service';
import { TradeService } from 'src/app/core/services/trade.service';
import { SymbolTicker } from 'src/app/core/types/ticker';

@Component({
  selector: 'app-market-order-form',
  templateUrl: './market-order-form.component.html',
  styleUrls: ['./market-order-form.component.scss']
})
export class MarketOrderFormComponent implements OnInit, OnDestroy {
  @Input() symbol: string = 'USDT_BTC';

  orderForm: FormGroup;
  ticker?: SymbolTicker;

  errors: {[key: string]: boolean};

  constructor(
    private formBuilder: FormBuilder,
    private tickerService: TickerService,
    private tradeService: TradeService
  ) {
    this.errors = {};
    this.orderForm = formBuilder.group({
      price: ['Market', []],
      amount: ['', [Validators.required, Validators.pattern(/^[0-9]{1,}(\.[0-9]{1,8})?$/), Validators.min(0.0001)]],
    });

    this.orderForm
      .controls
      .amount
      .valueChanges
      .subscribe(() => {
        this.errors = {};
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  order() {
    this.errors = {};
    this.tradeService.marketOrder$(
      this.symbol,
      this.orderForm.controls.amount.value
    ).subscribe(() => {
      this.orderForm.patchValue({
        amount: ''
      });
      this.orderForm.markAsPristine();
      this.orderForm.markAsUntouched();
      
    }, error => {
      this.errors[error] = true;
    });
  }

}

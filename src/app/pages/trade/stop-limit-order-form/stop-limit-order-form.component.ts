import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { TickerService } from 'src/app/core/services/ticker.service';
import { TradeService } from 'src/app/core/services/trade.service';
import { UserBalancesList } from 'src/app/core/types/profile';
import { SymbolTicker } from 'src/app/core/types/ticker';

@Component({
  selector: 'app-stop-limit-order-form',
  templateUrl: './stop-limit-order-form.component.html',
  styleUrls: ['./stop-limit-order-form.component.scss']
})
export class StopLimitOrderFormComponent implements OnInit, OnDestroy {
  @Input() symbol: string = 'USDT_BTC';

  orderForm: FormGroup;
  ticker?: SymbolTicker;
  tickerSubscription?: Subscription;

  balance?: UserBalancesList;
  balanceSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private tickerService: TickerService,
    private tradeService: TradeService
  ) {
    this.orderForm = formBuilder.group({
      stopPrice: ['', [Validators.required, Validators.pattern(/^[0-9]{1,}(\.[0-9]{1,2})?$/)]],
      price: ['', [Validators.required, Validators.pattern(/^[0-9]{1,}(\.[0-9]{1,2})?$/)]],
      amount: ['', [Validators.required, Validators.pattern(/^[0-9]{1,}(\.[0-9]{1,8})?$/), Validators.min(0.0001)]],
      total: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{1,}(\.[0-9]{1,2})?$/),
        (formControl: FormControl) => {
          if (this.balance && this.balance.USDT.free >= formControl.value) {
            return null
          }
          return { insufficientFunds: true };
        }
      ]]
    });

    this.orderForm
      .controls
      .amount
      .valueChanges
      .pipe(
        filter((value: string) => value && this.orderForm.controls.price.value),
        map((value: string) => +value)
      )
      .subscribe((amount: number) => {
        this.orderForm.patchValue({
          total: this.orderForm.controls.amount.valid && this.orderForm.controls.price.valid
            ? (amount * this.orderForm.controls.price.value).toFixed(2)
            : ''
        }, {
          emitEvent: false
        })
      });

    this.orderForm
      .controls
      .total
      .valueChanges
      .pipe(
        filter((value: string) => value && this.orderForm.controls.price.value),
        map((value: string) => +value)
      )
      .subscribe((total: number) => {
        this.orderForm.patchValue({
          amount: this.orderForm.controls.total.valid && this.orderForm.controls.price.valid
            ? (total / this.orderForm.controls.price.value).toFixed(8)
            : ''
        }, {
          emitEvent: false
        })
      });

    this.orderForm
      .controls
      .price
      .valueChanges
      .pipe(
        filter((value: string) => value && this.orderForm.controls.total.value && this.orderForm.controls.amount.value),
        map((value: string) => +value)
      )
      .subscribe((total: number) => {
        this.orderForm.patchValue({
          total: this.orderForm.controls.amount.valid && this.orderForm.controls.price.valid
            ? (this.orderForm.controls.amount.value * this.orderForm.controls.price.value).toFixed(2)
            : ''
        }, {
          emitEvent: false
        })
      });
  }

  ngOnInit(): void {
    const ticker$ = this.tickerService
      .getTicker$(this.symbol)
      .pipe(
        filter((ticker: SymbolTicker) => !!ticker.price),
        tap((ticker: SymbolTicker) => this.ticker = ticker)
      );

    ticker$
      .pipe(first())
      .subscribe((ticker: SymbolTicker) => {
        this.orderForm.patchValue({
          price: (+ticker.price).toFixed(2)
        });
      });

    this.tickerSubscription = ticker$.subscribe((ticker: SymbolTicker) => this.ticker = ticker);
    this.balanceSubscription = this.tradeService
      .getBalance$()
      .subscribe((balance: UserBalancesList) => {
        this.balance = balance;
      })
  }

  ngOnDestroy(): void {
    this.tickerSubscription && this.tickerSubscription.unsubscribe();
    this.balanceSubscription && this.balanceSubscription.unsubscribe();
  }

  order() {
    this.tradeService.limitOrder$(
      this.symbol,
      this.orderForm.controls.price.value,
      this.orderForm.controls.amount.value,
      this.orderForm.controls.stopPrice.value
    ).subscribe(() => {
      this.orderForm.patchValue({
        amount: '',
        total: ''
      });
      this.orderForm.markAsPristine();
      this.orderForm.markAsUntouched();
    });
  }

}

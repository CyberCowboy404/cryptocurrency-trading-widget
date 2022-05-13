import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SymbolTicker } from '../types/ticker';
import { BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators'

const INTERVAL = 1000;

@Injectable({
  providedIn: 'root'
})
export class TickerService {

  pricesSubjectsBySymbol: { [key: string]: BehaviorSubject<SymbolTicker> };

  constructor(
    private http: HttpClient
  ) { 
    this.pricesSubjectsBySymbol = {
      'BTC_USDT': new BehaviorSubject<SymbolTicker>({
        symbol: "BTC_USDT",
        price: 0
      })
    };

    interval(INTERVAL)
      .pipe(
        switchMap(() => {
          return this.http.get<SymbolTicker>('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
        }),
        tap((ticker: SymbolTicker) => {
          this.pricesSubjectsBySymbol['BTC_USDT'].next(ticker);
        })
      )
      .subscribe()
  }

  getTicker$(symbol: string): BehaviorSubject<SymbolTicker> {
    return this.pricesSubjectsBySymbol[symbol];
  }
}

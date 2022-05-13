import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { Order, OrderSide, OrderStatus, OrderType } from '../types/order';
import { UserBalancesList } from '../types/profile';
import { SymbolTicker } from '../types/ticker';
import { TickerService } from './ticker.service';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  balance$: BehaviorSubject<UserBalancesList>; 
  ordersBySymbol: {[key: string]: Order[]};

  constructor(
    private tickerService: TickerService
  ) { 
    this.ordersBySymbol = {
      'BTC_USDT': []
    };

    this.balance$ = new BehaviorSubject<UserBalancesList>({
      BTC: {
        free: 0,
        locked: 0
      },
      USDT: {
        free: 5000,
        locked: 0
      }
    })

    this.trade('BTC_USDT');
  }

  trade(symbol: string) {
    const [coinName, marketCoinName] = symbol.split('_') as (keyof UserBalancesList)[];
    return this.tickerService
      .getTicker$(symbol)
      .pipe(
        filter((ticker: SymbolTicker) => !!ticker.price),
        tap((ticker: SymbolTicker) => {
          const orders = this.ordersBySymbol[symbol].filter(order => order.status == OrderStatus.NEW);

          if(!orders.length) return;
            
          // Handle Limit and activated Stop-Limit orders
          const ordersToExecute = {
            buy: orders.filter(order => order.side == OrderSide.BUY
              && order.isActive
              && order.limitPrice >= ticker.price),
            sell: orders.filter(order => order.side == OrderSide.SELL 
              && order.isActive
              && order.limitPrice <= ticker.price),
          };
          for (const order of ordersToExecute.buy) {
            const lockedMarketAmount = order.limitPrice * order.amount;
            const neededMarketAmount = ticker.price * order.amount;
            const balance: UserBalancesList = this.balance$.getValue();

            balance[marketCoinName].locked -= +lockedMarketAmount;
            balance[marketCoinName].free += +lockedMarketAmount - neededMarketAmount;
            balance[coinName].free += +order.amount;

            order.price = ticker.price;
            order.status = OrderStatus.FILLED;

            this.balance$.next(balance);
          }
          for (const order of ordersToExecute.sell) {
            const lockedCoinAmount = order.amount / order.limitPrice;
            const marketCoinAmount = ticker.price * order.amount;
            const balance: UserBalancesList = this.balance$.getValue();

            balance[coinName].locked -= +lockedCoinAmount;
            balance[marketCoinName].free += +marketCoinAmount;

            order.price = ticker.price;
            order.status = OrderStatus.FILLED;

            this.balance$.next(balance);
          }

          // Handle StopLimit orders
          orders
            .filter(order => !order.isActive 
              && order.stopPrice 
              && (
                order.side == OrderSide.BUY && order.stopPrice <= ticker.price 
                || order.side == OrderSide.SELL && order.stopPrice >= ticker.price
              )
            )
            .map(order => {
              order.isActive = true;
              return order;
            })
        })
      )
      .subscribe()
  }

  getBalance$() {
    return this.balance$;
  }

  depositUsdt$(amount: number) {
    const balance: UserBalancesList = this.balance$.getValue();
    balance['USDT'].free += amount;
    this.balance$.next(balance);
    return of(null);
  }

  marketOrder$(symbol: string, amount: number) {
    if (amount < 0) {
      return throwError('incorrectAmount')
    }

    return this.tickerService
      .getTicker$(symbol)
      .pipe(
        filter((ticker: SymbolTicker) => !!ticker.price),
        first(),
        switchMap((ticker: SymbolTicker) => {
          const price = +ticker.price;
          const [coinName, marketCoinName] = symbol.split('_') as (keyof UserBalancesList)[];
          const lockedMarketAmount = price * amount;
          const balance: UserBalancesList = this.balance$.getValue();
          const availableMarketAmount = balance[marketCoinName].free;

          if (availableMarketAmount && availableMarketAmount >= lockedMarketAmount) {
            balance[marketCoinName].free -= +lockedMarketAmount;
            balance[coinName].free += +amount;
          } else {
            return throwError('insufficientFunds');
          }

          this.ordersBySymbol[symbol].push({
            id: this.ordersBySymbol[symbol].length,
            type: OrderType.MARKET,
            side: OrderSide.BUY,
            status: OrderStatus.FILLED,
            price: price,
            limitPrice: 0,
            stopPrice: 0,
            isActive: true,
            amount
          });

          this.balance$.next(balance);
          return of(null);
        })
      )
  }

  limitOrder$(symbol: string, limitPrice: number, amount: number, stopPrice: number = 0) {
    if (limitPrice < 0) {
      return throwError('incorrectPrice')
    }
    if(amount < 0) {
      return throwError('incorrectAmount')
    }
    const marketCoinName = symbol.split('_')[1] as keyof UserBalancesList;
    const lockedMarketAmount = limitPrice * amount;
    const balance: UserBalancesList = this.balance$.getValue();
    const availableMarketAmount = balance[marketCoinName].free;
    
    if (availableMarketAmount && availableMarketAmount >= lockedMarketAmount) {
      balance[marketCoinName].free -= lockedMarketAmount;
      balance[marketCoinName].locked += lockedMarketAmount;
    } else {
      return throwError('insufficientFunds');
    }
    
    this.ordersBySymbol[symbol].push({
      id: this.ordersBySymbol[symbol].length,
      type: stopPrice ? OrderType.STOPLIMIT : OrderType.LIMIT,
      side: OrderSide.BUY,
      status: OrderStatus.NEW,
      price: limitPrice,
      limitPrice,
      stopPrice,
      isActive: !stopPrice,
      amount
    });

    this.balance$.next(balance);

    return of(null);
  }
}

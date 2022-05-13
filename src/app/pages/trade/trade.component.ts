import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TickerService } from 'src/app/core/services/ticker.service';
import { OrderTypeStrings } from 'src/app/core/types/order';
import { SymbolTicker } from 'src/app/core/types/ticker';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit {

  orderType: OrderTypeStrings;
  isLoading: Boolean;

  symbol: string;

  ticker$?: BehaviorSubject<SymbolTicker>;

  constructor(
    private tickerService: TickerService
  ) { 
    this.symbol = 'BTC_USDT';
    this.orderType = 'LIMIT';
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.ticker$ = this.tickerService.getTicker$(this.symbol);
  }

}

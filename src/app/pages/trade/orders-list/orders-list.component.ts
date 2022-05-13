import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TradeService } from 'src/app/core/services/trade.service';
import { Order, OrderSide, OrderStatus, OrderType } from 'src/app/core/types/order';
import { UserBalancesList } from 'src/app/core/types/profile';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit, OnDestroy {
  @Input() symbol?: string;
  displayedColumns: string[];

  ordersSubscription?: Subscription;
  orders: Order[];

  enumKeys = {
    OrderSide,
    OrderStatus,
    OrderType
  }

  constructor(private tradeService: TradeService) {
    this.displayedColumns = ['id', 'side', 'type', 'status', 'price', 'amount', 'limitPrice', 'stopPrice'];
    this.orders = [];
  }

  ngOnInit(): void {
    if (!this.symbol) return;
    
    this.ordersSubscription = this.tradeService
      .getBalance$()
      .pipe(
        tap(() => {
          this.orders = this.symbol ? [...this.tradeService.ordersBySymbol[this.symbol]] : [];
        })
      )  
      .subscribe()
  }

  ngOnDestroy(): void {
    this.ordersSubscription && this.ordersSubscription.unsubscribe();
  }

}

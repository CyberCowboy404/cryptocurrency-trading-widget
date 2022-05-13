import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TradeService } from '../core/services/trade.service';
import { UserBalancesList } from '../core/types/profile';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  displayedColumns: string[];
  balance$: BehaviorSubject<UserBalancesList>;

  constructor(private tradeService: TradeService) {
    this.displayedColumns = ['coin', 'free', 'locked'];
    this.balance$ = tradeService.getBalance$();
  }

  ngOnInit(): void {}

}

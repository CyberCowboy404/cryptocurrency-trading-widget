import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../core/components/page-not-found/page-not-found.component';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'trade', loadChildren: () => import('./trade/trade.module').then(m => m.TradeModule) },
      { path: 'deposit', loadChildren: () => import('./deposit/deposit.module').then(m => m.DepositModule) },
      { path: '', redirectTo: 'trade/BTC_USDT' },
      { path: '**', component: PageNotFoundComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

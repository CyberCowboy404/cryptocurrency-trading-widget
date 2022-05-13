import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TradeService } from 'src/app/core/services/trade.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {
  depositForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private tradeService: TradeService
  ) {
    this.depositForm = formBuilder.group({
      amount: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{1,}(\.[0-9]{1,2})?$/), 
        Validators.min(0.01), 
        Validators.max(100000)]
      ],
    });
  }

  ngOnInit(): void {
  }

  order() {
    this.tradeService.depositUsdt$(
      +this.depositForm.controls.amount.value
    ).subscribe(() => {
      this.depositForm.patchValue({
        amount: ''
      });
      this.depositForm.markAsPristine();
      this.depositForm.markAsUntouched();
    });
  }

}

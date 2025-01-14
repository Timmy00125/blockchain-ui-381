import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import {
  Block,
  BlockchainService,
  Transaction,
} from '../../services/blockchain.service';
import { MatTableDataSource } from '@angular/material/table';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  interval,
  Subject,
  Subscription,
  Observable,
  finalize,
  takeUntil,
  timer,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-blockchain-viewer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blockchain-viewer.component.html',
  styleUrl: './blockchain-viewer.component.css',
})
export class BlockchainViewerComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private blockchainService = inject(BlockchainService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  blocks: Block[] = [];
  mining = false;
  transactionInProgress = false;
  selectedTab: string = 'blocks';

  transactionForm = this.fb.group({
    sender: ['', Validators.required],
    recipient: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.loadBlockchain();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlockchain() {
    this.blockchainService
      .getBlockchain()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.blocks = data.chain;
        },
        error: (error) => {
          console.error('Error loading blockchain:', error);
          this.snackBar.open('Error loading blockchain', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  createTransaction() {
    if (this.transactionForm.valid && !this.transactionInProgress) {
      this.transactionInProgress = true;
      const formValues = this.transactionForm.value;

      const transaction: Transaction = {
        amount: Number(formValues.amount) || 0,
        sender: formValues.sender || '',
        recipient: formValues.recipient || '',
      };

      this.blockchainService
        .createTransaction(transaction)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.transactionInProgress = false))
        )
        .subscribe({
          next: (response) => {
            console.log('Transaction response:', response); // For debugging
            this.snackBar.open('Transaction created successfully', 'Close', {
              duration: 3000,
            });
            this.transactionForm.reset();
            this.loadBlockchain();
          },
          error: (error) => {
            console.error('Transaction error:', error);
            this.snackBar.open('Error creating transaction', 'Close', {
              duration: 3000,
            });
          },
        });
    } else if (!this.transactionForm.valid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
      });
    }
  }

  mineBlock() {
    this.mining = true;
    this.blockchainService
      .mineBlock()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.mining = false))
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open('Block mined successfully', 'Close', {
            duration: 3000,
          });
          this.loadBlockchain();
        },
        error: (error) => {
          console.error('Mining error:', error);
          this.snackBar.open('Error mining block', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  getTransactionDataSource(transactions: Transaction[]) {
    return new MatTableDataSource(transactions);
  }
}

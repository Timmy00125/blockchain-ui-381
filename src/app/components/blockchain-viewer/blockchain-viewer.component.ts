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
export class BlockchainViewerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blockchainService = inject(BlockchainService);
  private snackBar = inject(MatSnackBar);
  private refreshSubscription?: Subscription;

  // Subject for handling component cleanup
  private destroy$ = new Subject<void>();
  blocks: Block[] = [];
  mining = false;
  transactionForm = this.fb.group({
    sender: ['', Validators.required],
    recipient: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.loadBlockchain();
  }

  ngOnDestroy() {}

  loadBlockchain() {
    this.blockchainService.getBlockchain().subscribe(
      (data) => {
        this.blocks = data.chain;
      },
      (error) => {
        this.snackBar.open('Error loading blockchain', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  getTransactionDataSource(transactions: Transaction[]) {
    return new MatTableDataSource(transactions);
  }

  createTransaction() {
    if (this.transactionForm.valid) {
      // We'll create a properly typed transaction object from the form values
      const formValues = this.transactionForm.value;

      // Create a transaction object with type checking
      const transaction: Transaction = {
        // Use the nullish coalescing operator to provide default values
        amount: formValues.amount ?? 0,
        sender: formValues.sender ?? '',
        recipient: formValues.recipient ?? '',
      };

      // Now we can safely pass the transaction to our service
      this.blockchainService.createTransaction(transaction).subscribe(
        (response) => {
          this.snackBar.open('Transaction created successfully', 'Close', {
            duration: 3000,
          });
          this.transactionForm.reset();
          this.loadBlockchain();
        },
        (error) => {
          this.snackBar.open('Error creating transaction', 'Close', {
            duration: 3000,
          });
        }
      );
    }
  }

  mineBlock() {
    this.mining = true;
    this.blockchainService
      .mineBlock()
      .pipe(
        finalize(() => (this.mining = false)) // Ensure mining flag is always reset
      )
      .subscribe(
        (response) => {
          this.snackBar.open('Block mined successfully', 'Close', {
            duration: 3000,
          });
          this.loadBlockchain(); // Crucial: Refresh the blockchain data
        },
        (error) => {
          console.error('Mining error:', error); // Log the actual error for debugging
          // this.snackBar.open('Error mining block', 'Close', { duration: 3000 });
        }
      );
  }
  selectedTab: string = 'blocks'; // Default to Blocks tab
}

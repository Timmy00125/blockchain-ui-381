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

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-blockchain-viewer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatExpansionModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './blockchain-viewer.component.html',
  styleUrl: './blockchain-viewer.component.css',
  // providers: [BlockchainService],
})
export class BlockchainViewerComponent implements OnInit {
  // constructor(
  //   private blockchainService: BlockchainService,
  //   private fb: FormBuilder,
  //   private snackBar: MatSnackBar
  // ) {}

  private fb = inject(FormBuilder);
  private blockchainService = inject(BlockchainService);
  private snackBar = inject(MatSnackBar);
  // private cdr = inject(ChangeDetectorRef);

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

  ngOnDestroy(): void {}

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
    this.blockchainService.mineBlock().subscribe(
      (response) => {
        this.snackBar.open('Block mined successfully', 'Close', {
          duration: 3000,
        });
        this.loadBlockchain();
        this.mining = false;
        // this.cdr.detectChanges(); // Trigger change detection to update the UI
      },
      (error) => {
        this.snackBar.open('Error mining block', 'Close', { duration: 3000 });
        this.mining = false;
        // this.cdr.detectChanges(); // Trigger change detection to update the UI
      }
    );
  }
}

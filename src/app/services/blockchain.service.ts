import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  amount: number;
  sender: string;
  recipient: string;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousBlockHash: string;
}

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  private apiUrl = 'http://localhost:3001'; // Update with your actual port

  constructor(private http: HttpClient) {}

  getBlockchain(): Observable<any> {
    return this.http.get(`${this.apiUrl}/blockchain`);
  }

  createTransaction(transaction: Transaction): Observable<any> {
    return this.http.post(`${this.apiUrl}/transaction`, transaction);
  }

  mineBlock(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mine`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  createTransaction(transaction: Transaction): Observable<string> {
    // Specify responseType as text since the endpoint returns a string
    return this.http.post(`${this.apiUrl}/transaction`, transaction, {
      responseType: 'text',
    });
  }

  mineBlock(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mine`);
  }
}

import { Injectable, signal } from '@angular/core';
import { Product } from '../types/Product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor() {}

  addToCart(product: Product) {}

  salute(name: string) {
    alert('Salute from CartService: ' + name);
    return 'Hello ' + name;
  }
}

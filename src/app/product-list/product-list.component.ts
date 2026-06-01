import { Component } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Product } from '../types/Product';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: false,
})
export class ProductListComponent {
  constructor(private cartService: CartService) {}

  products = this.cartService.products;

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}

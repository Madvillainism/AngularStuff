import { Component } from '@angular/core';
import { CartService } from '../services/cart.service';
import { cartItem } from '../types/Product';

@Component({
  selector: 'app-shop-cart',
  templateUrl: './shop-cart.component.html',
  styleUrls: ['./shop-cart.component.scss'],
  standalone: false,
})
export class ShopCartComponent {
  constructor(public cartService: CartService) {}

  cartItems = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;

  removeFromCart(cartItem: cartItem) {
    this.cartService.removeFromCart(cartItem);
  }

  checkout() {
    this.cartService.salute('Murasaki');
  }
}

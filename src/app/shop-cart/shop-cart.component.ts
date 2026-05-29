import { Component } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
    selector: 'app-shop-cart',
    templateUrl: './shop-cart.component.html',
    styleUrls: ['./shop-cart.component.scss'],
    standalone: false
})
export class ShopCartComponent {
  constructor(public cartService: CartService) {}

  checkout() {
    this.cartService.salute('Murasaki');
  }
}

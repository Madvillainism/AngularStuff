import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, cartItem } from '../types/Product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  products = signal<Product[]>([
    {
      id: 1,
      name: 'Product 1',
      price: 10,
      img: './assets/hat.png',
    },
    {
      id: 2,
      name: 'Product 2',
      price: 20,
      img: './assets/hat.png',
    },
    {
      id: 3,
      name: 'Product 3',
      price: 30,
      img: './assets/hat.png',
    },
  ]);

  cartItems = signal<cartItem[]>(this.loadCart());

  totalPrice = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),
  );

  totalItems = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );

  constructor() {
    effect(() => {
      const count = this.totalItems();
      document.title = count > 0 ? `Cart (${count})` : 'Empty Cart';
    });

    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    });
  }

  private loadCart(): cartItem[] {
    const cartData = localStorage.getItem('cart');
    try {
      return cartData ? JSON.parse(cartData) : [];
    } catch {
      return [];
    }
  }

  /*This function checks the ID of the product being added to the cart. If the product already exists in the cart, it updates the quantity. If it doesn't exist, it adds a new item to the cart with a quantity of 1. Finally, it shows an alert confirming that the product has been added to the cart.*/
  addToCart(product: Product) {
    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.id === product.id);
      if (existingItem) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...items, { ...product, quantity: 1 }];
      }
    });
    alert(`${product.name} added to cart!`);
  }

  /*same shi as above but for removing.*/
  removeFromCart(product: Product) {
    this.cartItems.update((items) =>
      items.filter((item) => item.id !== product.id),
    );
    alert(`${product.name} removed from cart!`);
  }

  /*dumb function to test and debug*/
  salute(name: string) {
    alert('Salute from CartService: ' + name);
    return 'Hello ' + name;
  }
}

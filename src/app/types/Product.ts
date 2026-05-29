export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
}

export interface cartItem extends Product {
  quantity: number;
}

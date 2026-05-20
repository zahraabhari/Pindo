/** Cart line item persisted in localStorage via cart-store */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export type CartToast = {
  message: string;
  id: number;
};

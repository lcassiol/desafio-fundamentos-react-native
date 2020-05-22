import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem('@CartProducts');

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productAlreadyExist = products.filter(
        item => item.id === product.id,
      );

      if (productAlreadyExist.length > 0) {
        setProducts(
          products.map(item => {
            if (product.id === item.id) {
              item.quantity += 1;
            }
            return item;
          }),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@CartProducts', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(
        products.map(product => {
          if (product.id === id) {
            product.quantity += 1;
          }

          return product;
        }),
      );
      await AsyncStorage.setItem('@CartProducts', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.map(item => item.id).indexOf(id);
      const productQuantity = products[productIndex].quantity - 1;

      if (productQuantity <= 0) {
        const newProducts = products.filter(product => {
          if (product.id !== id) {
            return product;
          }
        });

        setProducts(newProducts);
      } else {
        setProducts(
          products.map(item => {
            if (item.id === id) {
              item.quantity -= 1;
            }
            return item;
          }),
        );
      }
      await AsyncStorage.setItem('@CartProducts', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

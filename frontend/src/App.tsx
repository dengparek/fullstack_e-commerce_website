import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/carts/CartDrawer";

import React from "react";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

// src/types/api.ts

// Standard backend response envelope format
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  id: string;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]> | Array<{ field: string; message: string }>;
}

// User & Auth Types
export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AuthResponse {
  user?: User;
  accessToken: string;
}

export interface LocationState {
  from?: {
    pathname: string;
  };
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  categoryId: string; // Required by backend business logic
  category?: Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  sku: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: "price" | "createdAt" | "name";
  order?: "asc" | "desc";
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

// Order Types
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      imageUrl?: string;
    };
  }>;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  shippingPhone: string;
  shippingName: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

// Admin User Query Types
export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  products?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginatedResults<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Example: Aliasing properties if the internal naming shifted
// export type PaginatedResultS<T> = {
//   items: T[];
//   meta: {
//     total: number;
//     page: number;
//     limit: number;
//   };
//   // Backward compatibility getters / aliases if needed during refactor:
//   /** @deprecated Use `items` instead */
//   data?: T[];
// };

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

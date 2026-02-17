// User roles
export type UserRole = 'customer' | 'restaurant' | 'driver' | 'admin';

// Order status
export type OrderStatus = 'pending' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';

// Database types
export interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: UserRole;
    created_at: string;
}

export interface Restaurant {
    id: string;
    owner_id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    avg_prep_time: number; // in minutes
    on_time_accuracy: number; // percentage 0-100
    is_active: boolean;
    created_at: string;
}

export interface MenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_available: boolean;
}

export interface OrderItem {
    menu_item_id: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customer_id: string;
    restaurant_id: string;
    driver_id?: string;
    items: OrderItem[];
    total_price: number;
    delivery_fee: number;
    delivery_address: string;
    estimated_delivery_time: string;
    actual_delivery_time?: string;
    status: OrderStatus;
    created_at: string;
}

export interface OrderStatusHistory {
    id: string;
    order_id: string;
    status: string;
    timestamp: string;
    notes?: string;
}

// ETA Calculation
export interface ETACalculationParams {
    restaurantAvgPrepTime: number;
    distanceKm: number;
    currentOrders: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export interface ETAResult {
    totalMinutes: number;
    estimatedDeliveryTime: Date;
    breakdown: {
        prep: number;
        driving: number;
        traffic?: number;
    };
}

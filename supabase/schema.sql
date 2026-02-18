-- TimeBite Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'restaurant', 'driver', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'on_way', 'delivered', 'cancelled');

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  avg_prep_time INTEGER DEFAULT 20, -- in minutes
  on_time_accuracy DECIMAL(5,2) DEFAULT 100.00, -- percentage
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  items JSONB NOT NULL, -- array of {menu_item_id, quantity, price}
  total_price DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 1.00,
  delivery_address TEXT NOT NULL,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history table
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_history_order ON order_status_history(order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Restaurants: Public can view active restaurants
CREATE POLICY "Anyone can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Restaurant owners can update own restaurant" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

-- Menu items: Public can view available items
CREATE POLICY "Anyone can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Restaurant owners can manage menu" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Orders: Customers can view own orders, restaurants/drivers can view assigned orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Restaurants can view their orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = orders.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view assigned orders" ON orders
  FOR SELECT USING (driver_id = auth.uid());

-- Function to calculate restaurant on-time accuracy
CREATE OR REPLACE FUNCTION calculate_on_time_accuracy(restaurant_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_orders INTEGER;
  on_time_orders INTEGER;
BEGIN
  -- Count orders from last 30 days
  SELECT COUNT(*) INTO total_orders
  FROM orders
  WHERE restaurant_id = restaurant_uuid
    AND status = 'delivered'
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- If no orders, return 100
  IF total_orders = 0 THEN
    RETURN 100.00;
  END IF;
  
  -- Count on-time orders (within ±5 minutes)
  SELECT COUNT(*) INTO on_time_orders
  FROM orders
  WHERE restaurant_id = restaurant_uuid
    AND status = 'delivered'
    AND created_at > NOW() - INTERVAL '30 days'
    AND ABS(EXTRACT(EPOCH FROM (actual_delivery_time - estimated_delivery_time))) <= 300; -- 5 minutes
  
  RETURN ROUND((on_time_orders::DECIMAL / total_orders::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update restaurant on-time accuracy after order delivery
CREATE OR REPLACE FUNCTION update_restaurant_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE restaurants
    SET on_time_accuracy = calculate_on_time_accuracy(NEW.restaurant_id)
    WHERE id = NEW.restaurant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accuracy
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_restaurant_accuracy();

-- Function to handle new user signup
-- This syncs data from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing (optional)
-- Uncomment when ready to test

-- INSERT INTO users (id, email, full_name, phone, role) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'customer@test.com', 'Ahmed Khaled', '+962791234567', 'customer'),
-- ('00000000-0000-0000-0000-000000000002', 'restaurant@test.com', 'Restaurant Owner', '+962791234568', 'restaurant'),
-- ('00000000-0000-0000-0000-000000000003', 'driver@test.com', 'Driver One', '+962791234569', 'driver');

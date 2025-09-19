// User types
export interface UserBase {
  id: string;
  role: string;
}

export interface Customer extends UserBase {
  Name: string;
  ContactInfo: string;
}

export interface Employee extends UserBase {
  Name: string;
  ContactInfo: string;
  Position: string;
}

export interface Courier extends UserBase {
  Name: string;
  ContactInfo: string;
  MaxCapacity: number;
}

// Структура пиццы
export interface Pizza {
  Id: string;
  Name: string;
  Ingredients: string;
  CostPrice: number;
  Price: number;
  Image?: string;
}

export interface MenuItem {
  Id: string;
  PizzaId: string;
  Price: number;
  TotalPrice: number;
  pizza?: Pizza;
}

// Структура заказа
export interface Order {
  Id: string;
  OrderDate: string;
  Status: string;
  CustomerId: string;
  DeliveryAddress: string;
  EmployeeId: string;
  Customer?: Customer;
  Employee?: Employee;
  orderedPizzas?: OrderedPizza[];
}

export interface OrderedPizza {
  Id: string;
  OrderId: string;
  PizzaId: string;
  Quantity: number;
  pizza?: Pizza;
}

export interface DeliveryOperation {
  id: string;
  deliveryDate: string;
  courierId: string;
  orderId: string;
  status: string;
}

// Структура аутентификации
export interface AuthRequest {
  identifier: string;  // camelCase для фронтенда
  password: string;    // camelCase для фронтенда
}

export interface AuthResponse {
  Token: string;       // PascalCase для соответствия бэкенду
  Expiration: string;  // PascalCase для соответствия бэкенду
}

export interface CustomerRegistration {
  name: string;
  contactInfo: string;
  password: string;
}

export interface EmployeeRegistration {
  name: string;
  contactInfo: string;
  position: string;
  password: string;
}

export interface CourierRegistration {
  name: string;
  contactInfo: string;
  maxCapacity: number;
  password: string;
}

export interface AdminRegistration {
  name: string;
  contactInfo: string;
  position: string;
  password: string;
}

export interface Review {
  Id: string;
  ReviewText: string;
  Rating: number;
  ReviewDate: string;
  CustomerId: string;
  OrderId: string;
}

export interface Promotion {
  id: string;
  promotionName: string;
  startDate: string;
  endDate: string;
  conditions: string;
  discountAmount: number;
  discountPercent?: number;
  pizzaId: string;
}

export interface SalesStatistic {
  id: string;
  saleDate: string;
  orderId: string;
  orderAmount: number;
  costPrice: number;
  profit: number;
}

export interface CreateOrderRequest {
  customerId: string;
  employeeId: string;
  deliveryAddress: string;
  status: string;
}

// Запрос для создания отзыва (используется camelCase для соответствия запросам)
export interface CreateReviewRequest {
  reviewText: string;
  rating: number;
  customerId: string;
  orderId: string;
}

// Типы для AI чата
export interface AIMessage {
  role: string;
  content: string;
}

export interface AIChoice {
  message: AIMessage;
}

export interface AIResponse {
  choices: AIChoice[];
}

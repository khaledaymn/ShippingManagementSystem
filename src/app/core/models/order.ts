export interface Order {
  id: number
  creationDate: string
  customerName: string
  customerPhone1: string
  customerPhone2?: string
  villageAndStreet: string
  notes?: string
  orderState: OrderState
  orderType: OrderType
  paymentType: PaymentType
  chargePrice: number
  orderPrice: number
  amountReceived: number
  totalWeight: number
  isDeleted: boolean
  isShippingToVillage: boolean
  cityName?: string
  chargeTypeName?: string
  branchName?: string
  merchantName?: string
  shippingRepresentativeName?: string
  products?: Product[]
}

export interface Product {
  id: number
  name: string
  weight: number
  quantity: number
  orderId: number
}

export interface CreateOrderDTO {
  customerName: string
  customerPhone1: string
  customerPhone2?: string
  villageAndStreet: string
  notes?: string
  orderPrice: number
  shippingToVillage: boolean
  cityId: number
  chargeTypeId: number
  branchId: number
  merchantId: string
  orderType: OrderType
  paymentType: PaymentType
  products: Product[]
}

export interface AssignOrderToDeliveryDTO {
  orderState: OrderState
  shippingRepresentativeId: string
}

export interface UpdateOrderStatusDTO {
  orderState: OrderState
  notes?: string
}

export interface OrderParams {
  pageIndex: number
  pageSize: number
  search?: string
  orderState?: OrderState
  cityId?: number
  branchId?: number
  merchantId?: string
  shippingRepresentativeId?: string
  
  fromDate?: string
  toDate?: string
  orderType?: OrderType
  paymentType?: PaymentType
  isDeleted?: boolean
  sort?: string
}

export interface PaginatedResponse<T> {
  pageSize: number
  pageIndex: number
  totalCount: number
  data: T[]
}

// String literals
export type OrderState =
  | "New"
  | "Pendding"
  | "DeliveredToTheRepresentative"
  | "Delivered"
  | "CannotBeReached"
  | "PostPoned"
  | "PartiallyDelivered"
  | "CanceledByCustomer"
  | "RejectedWithPayment"
  | "RejectedWithPartialPayment"
  | "RejectedWithoutPayment"

export type OrderType = "DeliveryAtBranch" | "PickupFromTheMerchant"
export type PaymentType = "CashOnDelivery" | "PaidInAdvance" | "ExchangeOrder"

// Static objects for reference
export const OrderStateValues = {
  New: "New" as OrderState,
  Pendding: "Pendding" as OrderState,
  DeliveredToTheRepresentative: "DeliveredToTheRepresentative" as OrderState,
  Delivered: "Delivered" as OrderState,
  CannotBeReached: "CannotBeReached" as OrderState,
  PostPoned: "PostPoned" as OrderState,
  PartiallyDelivered: "PartiallyDelivered" as OrderState,
  CanceledByCustomer: "CanceledByCustomer" as OrderState,
  RejectedWithPayment: "RejectedWithPayment" as OrderState,
  RejectedWithPartialPayment: "RejectedWithPartialPayment" as OrderState,
  RejectedWithoutPayment: "RejectedWithoutPayment" as OrderState,
}

export const OrderTypeValues = {
  DeliveryAtBranch: "DeliveryAtBranch" as OrderType,
  PickupFromTheMerchant: "PickupFromTheMerchant" as OrderType,
}

export const PaymentTypeValues = {
  CashOnDelivery: "CashOnDelivery" as PaymentType,
  PaidInAdvance: "PaidInAdvance" as PaymentType,
  ExchangeOrder: "ExchangeOrder" as PaymentType,
}

// For display in UI (e.g., dropdowns)
export const OrderStateOptions = Object.values(OrderStateValues).map((value) => ({
  value,
  label: value.replace(/([A-Z])/g, " $1").trim(),
}))

export const OrderTypeOptions = Object.values(OrderTypeValues).map((value) => ({
  value,
  label: value.replace(/([A-Z])/g, " $1").trim(),
}))

export const PaymentTypeOptions = Object.values(PaymentTypeValues).map((value) => ({
  value,
  label: value.replace(/([A-Z])/g, " $1").trim(),
}))

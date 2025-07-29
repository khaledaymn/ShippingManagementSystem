export interface CityParams {
  search?: string;
  governorateId?: number;
  minChargePrice?: number;
  maxChargePrice?: number;
  minPickUpPrice?: number;
  maxPickUpPrice?: number;
  isDeleted?: boolean;
  sort?: string;
  pageIndex: number;
  pageSize: number;
}

export interface City {
  id: number;
  name: string;
  chargePrice: number;
  pickUpPrice: number;
  governorateName?: string;
  isDeleted: boolean;
}

export interface CreateCity {
  name: string;
  chargePrice: number;
  pickUpPrice: number;
  governorateId: number;
}

export interface EditCity {
  id: number;
  name?: string;
  chargePrice?: number;
  pickUpPrice?: number;
  governorateId?: number;
}

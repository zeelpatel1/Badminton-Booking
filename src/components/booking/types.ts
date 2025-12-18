export type Slot = {
    start: string;
    end: string;
  };
  
  export type Court = {
    id: number;
    name: string;
    type: string;
    basePrice: number;
  };
  
  export type Equipment = {
    id: number;
    name: string;
    price: number;
  };
  
  export type Coach = {
    id: number;
    name: string;
    pricePerHour: number;
  };
  
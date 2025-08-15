import { combineReducers } from '@reduxjs/toolkit';
import { productInventoryApi } from './api/productInventoryApi';

export const rootReducer = combineReducers({
  [productInventoryApi.reducerPath]: productInventoryApi.reducer,
});

import { combineReducers } from '@reduxjs/toolkit';

import { reducer as apiReducer, reducerPath } from './api';
import { productInventoryApi } from './api/productInventoryApi';

export const rootReducer = combineReducers({
  [reducerPath]: apiReducer,
  [productInventoryApi.reducerPath]: productInventoryApi.reducer,
});

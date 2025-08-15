import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: '../ApiService/ProductInventory.Api.json',
  apiFile: './src/store/api/empty-api.ts',
  apiImport: 'emptySplitApi',
  outputFiles: {
    './src/store/api/generated/products.ts': {
      filterEndpoints: [/Product/]
    },
    './src/store/api/generated/categories.ts': {
      filterEndpoints: [/ProductCategor/]
    },
  },
  exportName: 'productInventoryApi',
  hooks: true,
  tag: true,
}

export default config
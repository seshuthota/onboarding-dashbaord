export type FormatType = 'json' | 'xml';
export type AuthType = 'none' | 'basic' | 'bearer' | 'oauth2' | 'apiKey';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface MappingRule {
  sourceField: string;
  targetField: string;
}

export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  rules: MappingRule[];
}

export const MAPPING_TEMPLATES: MappingTemplate[] = [
  {
    id: 'order-status-standard',
    name: 'Order Status - Standard',
    description: 'Maps order ID, status, and timestamp fields',
    rules: [
      { sourceField: 'orderId', targetField: 'order.id' },
      { sourceField: 'status', targetField: 'order.status' },
      { sourceField: 'timestamp', targetField: 'order.updatedAt' }
    ]
  },
  {
    id: 'order-status-extended',
    name: 'Order Status - Extended',
    description: 'Includes carrier and tracking information',
    rules: [
      { sourceField: 'orderId', targetField: 'order.id' },
      { sourceField: 'status', targetField: 'order.status' },
      { sourceField: 'carrierCode', targetField: 'shipment.carrier' },
      { sourceField: 'trackingNumber', targetField: 'shipment.trackingId' },
      { sourceField: 'estimatedDelivery', targetField: 'shipment.eta' }
    ]
  },
  {
    id: 'shipment-update',
    name: 'Shipment Update',
    description: 'For shipment milestone updates',
    rules: [
      { sourceField: 'shipmentId', targetField: 'shipment.id' },
      { sourceField: 'milestone', targetField: 'event.type' },
      { sourceField: 'location', targetField: 'event.location' },
      { sourceField: 'eventTime', targetField: 'event.timestamp' }
    ]
  },
  {
    id: 'inventory-sync',
    name: 'Inventory Sync',
    description: 'For inventory level updates',
    rules: [
      { sourceField: 'sku', targetField: 'product.sku' },
      { sourceField: 'quantity', targetField: 'inventory.available' },
      { sourceField: 'warehouseId', targetField: 'inventory.locationId' }
    ]
  },
  {
    id: 'custom-minimal',
    name: 'Minimal - ID Only',
    description: 'Maps only the primary identifier',
    rules: [
      { sourceField: 'id', targetField: 'entity.id' }
    ]
  }
];

export interface CustomerConfig {
  name: string;
  environment: 'dev' | 'uat' | 'prod';
}

export interface ApiConfig {
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timeoutMs: number;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
}

export interface FormatConfig {
  type: FormatType;
  schemaOrSample: string;
}

export interface NoneAuthConfig {
  type: 'none';
}

export interface BasicAuthConfig {
  type: 'basic';
  username: string;
  password: string;
}

export interface BearerAuthConfig {
  type: 'bearer';
  token: string;
}

export interface OAuth2AuthConfig {
  type: 'oauth2';
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
}

export interface ApiKeyAuthConfig {
  type: 'apiKey';
  keyName: string;
  keyValue: string;
  placement: 'header' | 'query';
}

export type AuthConfig =
  | NoneAuthConfig
  | BasicAuthConfig
  | BearerAuthConfig
  | OAuth2AuthConfig
  | ApiKeyAuthConfig;

export interface MetaConfig {
  draftId: string;
  version: number;
  updatedAt: string;
}

export interface OnboardingConfig {
  customer: CustomerConfig;
  api: ApiConfig;
  format: FormatConfig;
  auth: AuthConfig;
  mappingTemplateId: string;
  meta: MetaConfig;
}

export const defaultOnboardingConfig: OnboardingConfig = {
  customer: {
    name: '',
    environment: 'dev'
  },
  api: {
    baseUrl: '',
    endpoint: '/orders/status',
    method: 'POST',
    timeoutMs: 10000,
    headers: [],
    queryParams: []
  },
  format: {
    type: 'json',
    schemaOrSample: '{\n  "orderId": "12345",\n  "status": "SHIPPED"\n}'
  },
  auth: {
    type: 'none'
  },
  mappingTemplateId: 'order-status-standard',
  meta: {
    draftId: '',
    version: 1,
    updatedAt: ''
  }
};

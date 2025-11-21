export type MetadataTarget = Function | Object
export type MetadataKey = string | symbol
export type MetadataValue = any

export type PropertyKey = string | symbol

export interface ClassMetadata {
  [key: MetadataKey]: MetadataValue
}

export interface PropertyMetadata {
  [property: PropertyKey]: Record<MetadataKey, MetadataValue>
}

export interface MethodMetadata {
  [method: string]: Record<MetadataKey, MetadataValue>
}

export interface ParameterMetadata {
  [method: string]: {
    [paramIndex: number]: Record<MetadataKey, MetadataValue>
  }
}

export interface MetadataRecord {
  class: ClassMetadata
  properties: PropertyMetadata
  methods: MethodMetadata
  parameters: ParameterMetadata
}

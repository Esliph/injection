import { MetadataKey, MetadataRecord, MetadataTarget, MetadataValue, PropertyKey } from '@metadata/types'

export class MetadataRepository {

  private storage = new WeakMap<MetadataTarget, MetadataRecord>()

  setClassMetadata(target: MetadataTarget, key: MetadataKey, value: MetadataValue) {
    this.ensure(this.getTarget(target)).class[key] = value
  }

  getClassMetadata(target: MetadataTarget, key: MetadataKey) {
    return this.storage.get(this.getTarget(target))?.class[key]
  }

  setPropertyMetadata(target: MetadataTarget, propertyKey: PropertyKey, key: MetadataKey, value: MetadataValue) {
    const properties = this.ensure(this.getTarget(target)).properties

    if (!properties[propertyKey]) {
      properties[propertyKey] = {}
    }

    properties[propertyKey][key] = value
  }

  getPropertyMetadata(target: MetadataTarget, propertyKey: PropertyKey, key: MetadataKey) {
    return this.storage.get(this.getTarget(target))?.properties[propertyKey]?.[key]
  }

  setMethodMetadata(target: MetadataTarget, methodKey: string, key: MetadataKey, value: MetadataValue) {
    const methods = this.ensure(this.getTarget(target)).methods

    if (!methods[methodKey]) {
      methods[methodKey] = {}
    }

    methods[methodKey][key] = value
  }

  getMethodMetadata(target: MetadataTarget, methodKey: string, key: MetadataKey) {
    return this.storage.get(this.getTarget(target))?.methods[methodKey]?.[key]
  }

  setParameterMetadata(target: MetadataTarget, methodKey: string, paramIndex: number, key: MetadataKey, value: MetadataValue) {
    const parameters = this.ensure(this.getTarget(target)).parameters

    if (!parameters[methodKey]) {
      parameters[methodKey] = {}
    }

    if (!parameters[methodKey][paramIndex]) {
      parameters[methodKey][paramIndex] = {}
    }

    parameters[methodKey][paramIndex][key as string] = value
  }

  getParameterMetadata(target: MetadataTarget, methodKey: string, index: number, key: MetadataKey) {
    return this.storage.get(this.getTarget(target))?.parameters[methodKey]?.[index]?.[key]
  }

  private ensure(target: MetadataTarget): MetadataRecord {
    const targetKey = this.getTarget(target)

    if (!this.storage.has(targetKey)) {
      this.storage.set(targetKey, { class: {}, properties: {}, methods: {}, parameters: {} })
    }

    return this.storage.get(targetKey)!
  }

  private getTarget(target: MetadataTarget) {
    return typeof target === 'object' && target.constructor
      ? target.constructor
      : target
  }
}

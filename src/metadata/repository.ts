import { MetadataKey, MetadataRecord, MetadataTarget, MetadataValue, PropertyKey } from '@metadata/types'

export class MetadataRepository {
  private storage = new WeakMap<MetadataTarget, MetadataRecord>()

  setClassMetadata(target: MetadataTarget, key: MetadataKey, value: MetadataValue) {
    this.ensure(target).class[key] = value
  }

  setPropertyMetadata(target: MetadataTarget, propertyKey: PropertyKey, key: MetadataKey, value: MetadataValue) {
    const properties = this.ensure(target).properties

    if (!properties[propertyKey]) {
      properties[propertyKey] = {}
    }

    properties[propertyKey][key] = value
  }

  setMethodMetadata(target: MetadataTarget, methodKey: string, key: MetadataKey, value: MetadataValue) {
    const methods = this.ensure(target).methods

    if (!methods[methodKey]) {
      methods[methodKey] = {}
    }

    methods[methodKey][key] = value
  }

  setParameterMetadata(target: MetadataTarget, methodKey: string, paramIndex: number, key: MetadataKey, value: MetadataValue) {
    const parameters = this.ensure(target).parameters

    if (!parameters[methodKey]) {
      parameters[methodKey] = {}
    }

    if (!parameters[methodKey][paramIndex]) {
      parameters[methodKey][paramIndex] = {}
    }

    parameters[methodKey][paramIndex][key] = value
  }

  getClassMetadata(target: MetadataTarget, key: MetadataKey) {
    return this.lookupPrototype(target, record => record.class[key])
  }

  getPropertyMetadata(target: MetadataTarget, propertyKey: PropertyKey, key: MetadataKey) {
    return this.lookupPrototype(target, record => record.properties[propertyKey]?.[key])
  }

  getMethodMetadata(target: MetadataTarget, methodKey: string, key: MetadataKey) {
    return this.lookupPrototype(target, record => record.methods[methodKey]?.[key])
  }

  getParameterMetadata(target: MetadataTarget, methodKey: string, index: number, key: MetadataKey) {
    return this.lookupPrototype(target, record => record.parameters[methodKey]?.[index]?.[key])
  }

  private lookupPrototype(target: MetadataTarget, fn: (record: MetadataRecord) => any) {
    let current: any = this.getTarget(target)

    while (current) {
      const record = this.storage.get(current)

      if (record) {
        const value = fn(record)

        if (value !== undefined) {
          return value
        }
      }

      current = Object.getPrototypeOf(current)
    }

    return undefined
  }

  private ensure(target: MetadataTarget): MetadataRecord {
    const realTarget = this.getTarget(target)

    if (!this.storage.has(realTarget)) {
      this.storage.set(realTarget, {
        class: {},
        properties: {},
        methods: {},
        parameters: {}
      })
    }

    return this.storage.get(realTarget)!
  }

  private getTarget(target: MetadataTarget) {
    return typeof target === 'object' ? target.constructor : target
  }
}

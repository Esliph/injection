import 'reflect-metadata'

import { DependencyToken } from '@common/types/dependency'
import { Decorator } from '@esliph/decorator'
import { MetadataKey } from '@metadata/types'
import { ClassConstructor } from '@utils/types'

const INJECT_PARAM_KEY = 'inject:params'
const INJECT_PROPERTIES_KEY = 'inject:properties'

export const Inject = (token: DependencyToken) => Decorator.Generic({
  parameter: (target, _, parameterIndex) => {
    const existing = Reflect.getMetadata(INJECT_PARAM_KEY, target) as DependencyToken[] ?? []

    existing[parameterIndex] = token

    Reflect.defineMetadata(INJECT_PARAM_KEY, existing, target)
  },
  property: (target, propertyKey) => {
    const existing = Reflect.getMetadata(INJECT_PROPERTIES_KEY, target) as Record<MetadataKey, DependencyToken> ?? {}

    existing[propertyKey] = token

    Reflect.defineMetadata(INJECT_PROPERTIES_KEY, existing, target)
  },
})

export function getInjectTokens(target: ClassConstructor) {
  return {
    constructorParams: (Reflect.getMetadata(INJECT_PARAM_KEY, target.prototype) ?? []) as DependencyToken[],
    properties: (Reflect.getMetadata(INJECT_PROPERTIES_KEY, target.prototype) ?? {}) as Record<MetadataKey, DependencyToken>,
  }
}

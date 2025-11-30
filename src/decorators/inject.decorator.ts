import 'reflect-metadata'

import { DependencyToken } from '@common/types/dependency'
import { Decorator } from '@esliph/decorator'
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
    const constructor = target.constructor

    const existing = Reflect.getMetadata(INJECT_PROPERTIES_KEY, constructor) as Record<string | symbol, DependencyToken> ?? {}

    existing[propertyKey] = token

    Reflect.defineMetadata(INJECT_PROPERTIES_KEY, existing, constructor)
  },
})

export function getInjectTokens(target: ClassConstructor) {
  return {
    constructorParams: (Reflect.getMetadata(INJECT_PARAM_KEY, target) ?? []) as DependencyToken[],
    properties: (Reflect.getMetadata(INJECT_PROPERTIES_KEY, target) ?? {}) as Record<string | symbol, DependencyToken>,
  }
}

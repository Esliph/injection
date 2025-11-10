import { DependencyToken } from '@common/types/dependency'
import { Decorator } from '@esliph/decorator'
import 'reflect-metadata'

const INJECT_PARAM_KEY = 'inject:params'
const INJECT_CONSTRUCTOR_PROPERTIES_KEY = 'inject:constructor:properties'

export const Inject = (token: DependencyToken) => Decorator.Generic({
  parameter: (target, _, parameterIndex) => {
    const existing = Reflect.getMetadata(INJECT_PARAM_KEY, target) || []

    existing[parameterIndex] = token

    Reflect.defineMetadata(INJECT_PARAM_KEY, existing, target)
  },
  property: (target, propertyKey) => {
    const existing = Reflect.getMetadata(INJECT_CONSTRUCTOR_PROPERTIES_KEY, target) || {}

    existing[propertyKey] = token

    Reflect.defineMetadata(INJECT_CONSTRUCTOR_PROPERTIES_KEY, existing, target)
  },
})

export function getInjectTokens(target: Object) {
  return {
    constructorParams: Reflect.getMetadata(INJECT_PARAM_KEY, target) || [],
    properties: Reflect.getMetadata(INJECT_CONSTRUCTOR_PROPERTIES_KEY, (target as any).prototype) || {},
  }
}

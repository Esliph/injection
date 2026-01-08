import { MetadataTarget, Reflect } from '@esliph/metadata'

import { DependencyToken } from '@common/types/dependency'
import { ClassConstructor } from '@utils/types'

const INJECT_PARAM_CONSTRUCTOR_KEY = 'inject:params-constructor'
const INJECT_PARAM_METHOD_KEY = 'inject:params-method'
const INJECT_PROPERTIES_KEY = 'inject:properties'

export function injectField(token: DependencyToken, target: MetadataTarget, propertyKey: string | symbol) {
  const existing = Reflect.getMetadata(INJECT_PROPERTIES_KEY, target) as Record<string | symbol, DependencyToken> ?? {}

  existing[propertyKey] = token

  Reflect.defineMetadata(INJECT_PROPERTIES_KEY, existing, target)
}

export function injectParamMethod(param: number, token: DependencyToken, target: MetadataTarget, methodName: string | symbol) {
  const existing = Reflect.getMetadata(INJECT_PARAM_METHOD_KEY, target, methodName) as DependencyToken[] ?? []

  existing[param] = token

  Reflect.defineMetadata(INJECT_PARAM_METHOD_KEY, existing, target, methodName)
}

export function injectParamConstructor(param: number, token: DependencyToken, value: any) {
  const tokens = Reflect.getMetadata(INJECT_PARAM_CONSTRUCTOR_KEY, value) as DependencyToken[] ?? []

  tokens[param] = token

  Reflect.defineMetadata(INJECT_PARAM_CONSTRUCTOR_KEY, tokens, value)
}

export function getInjectTokensParams(target: ClassConstructor): DependencyToken[]
export function getInjectTokensParams(target: ClassConstructor, methodName: string | symbol): DependencyToken[]

export function getInjectTokensParams(target: ClassConstructor, methodName?: string | symbol) {
  if (methodName === undefined) {
    return Reflect.getMetadata(INJECT_PARAM_CONSTRUCTOR_KEY, target) as DependencyToken[] ?? []
  }

  return Reflect.getMetadata(INJECT_PARAM_METHOD_KEY, target, methodName) as DependencyToken[] ?? []
}

export function getInjectTokensProperties(target: ClassConstructor) {
  return Reflect.getMetadata(INJECT_PROPERTIES_KEY, target) as Record<string | symbol, DependencyToken> ?? {}
}

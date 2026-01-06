import { Reflect } from '@esliph/metadata'

import { DependencyToken } from '@common/types/dependency'
import { ClassConstructor } from '@utils/types'

const INJECT_PARAM_KEY = 'inject:params'
const INJECT_PROPERTIES_KEY = 'inject:properties'

export function Inject(token: DependencyToken): (value: any, context: ClassFieldDecoratorContext) => void
export function Inject(param: number, token: DependencyToken): (value: any, context: ClassDecoratorContext | ClassMethodDecoratorContext) => void

export function Inject(argParamToken: number | DependencyToken, argToken?: DependencyToken) {
  const param = typeof argParamToken === 'number' ? argParamToken : undefined
  const token = typeof argParamToken === 'number' ? argToken! : argParamToken

  if (typeof param === 'number') {
    return (value: any, context: ClassDecoratorContext | ClassMethodDecoratorContext) => {
      switch (context.kind) {
        case 'class':
          injectParamConstructor(param, token, value)
          break
        case 'method':
          injectParamMethod(param, token, context)
          break
      }
    }
  }

  return (_: any, context: ClassFieldDecoratorContext) => {
    switch (context.kind) {
      case 'field':
        injectField(token, context)
        break
    }
  }
}

function injectField(token: DependencyToken, context: ClassFieldDecoratorContext) {
  context.addInitializer(function () {
    const existing = Reflect.getMetadata(INJECT_PROPERTIES_KEY, (this as any).constructor) as Record<string | symbol, DependencyToken> ?? {}

    existing[context.name] = token

    Reflect.defineMetadata(INJECT_PROPERTIES_KEY, existing, (this as any).constructor)
  })
}

function injectParamMethod(param: number, token: DependencyToken, context: ClassMethodDecoratorContext) {
  context.addInitializer(function () {
    const existing = Reflect.getMetadata(INJECT_PROPERTIES_KEY, (this as any).constructor, context.name) as Record<string | symbol, DependencyToken> ?? {}

    existing[param] = token

    Reflect.defineMetadata(INJECT_PROPERTIES_KEY, existing, (this as any).constructor, context.name)
  })
}

function injectParamConstructor(param: number, token: DependencyToken, value: any) {
  const tokens = Reflect.getMetadata(INJECT_PARAM_KEY, value) as DependencyToken[] ?? []

  tokens[param] = token

  Reflect.defineMetadata(INJECT_PARAM_KEY, tokens, value)
}

export function getInjectTokensParams(target: ClassConstructor) {
  return (Reflect.getMetadata(INJECT_PARAM_KEY, target) ?? []) as DependencyToken[]
}

export function getInjectTokensProperties(target: ClassConstructor) {
  return (Reflect.getMetadata(INJECT_PROPERTIES_KEY, target) ?? {}) as Record<string | symbol, DependencyToken>
}

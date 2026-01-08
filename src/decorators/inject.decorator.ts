
import { DependencyToken } from '@common/types/dependency'
import { injectField, injectParamConstructor, injectParamMethod } from '@metadata/inject.metadata'

const INJECT_PARAM_CONSTRUCTOR_KEY = 'inject:params-constructor'
const INJECT_PARAM_METHOD_KEY = 'inject:params-method'
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
          context.addInitializer(function () {
            injectParamMethod(param, token, (this as any).constructor, context.name)
          })
          break
      }
    }
  }

  return (_: any, context: ClassFieldDecoratorContext) => {
    switch (context.kind) {
      case 'field':
        context.addInitializer(function () {
          injectField(token, (this as any).constructor, context.name)
        })
        break
    }
  }
}

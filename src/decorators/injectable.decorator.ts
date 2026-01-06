import { Reflect } from '@esliph/metadata'

import { DependencyToken } from '@common/types/dependency'
import { Scope } from '@enums/scope'
import { ClassConstructor } from '@utils/types'

const INJECTABLE_DEPENDENCY_KEY = 'injectable:dependency'

export type InjectableMetadata = {
  token: DependencyToken
  scope?: Scope
  useClass: ClassConstructor
}

export type InjectableProps = {
  token?: DependencyToken
  scope?: Scope
}

export function Injectable({ token, scope }: InjectableProps = {}) {
  return (value: any, _: ClassDecoratorContext) => {
    Reflect.defineMetadata(INJECTABLE_DEPENDENCY_KEY, { token: token ?? value, scope, useClass: value }, value)
  }
}

export function getInjectableDependency(target: ClassConstructor) {
  return Reflect.getMetadata(INJECTABLE_DEPENDENCY_KEY, target) as InjectableMetadata || null
}

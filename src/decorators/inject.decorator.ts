import { DependencyToken } from '@common/types/dependency'
import { Decorator } from '@esliph/decorator'
import { Metadata } from '@metadata/global'
import { MetadataKey } from '@metadata/types'

const INJECT_PARAM_KEY = 'inject:params'
const INJECT_PROPERTIES_KEY = 'inject:properties'

export const Inject = (token: DependencyToken) => Decorator.Generic({
  parameter: (target, _, parameterIndex) => {
    const existing = Metadata.getClassMetadata(target, INJECT_PARAM_KEY) as DependencyToken[] ?? []

    existing[parameterIndex] = token

    Metadata.setClassMetadata(target, INJECT_PARAM_KEY, existing)
  },
  property: (target, propertyKey) => {
    const existing = Metadata.getClassMetadata(target, INJECT_PROPERTIES_KEY) as Record<MetadataKey, DependencyToken> ?? {}

    existing[propertyKey] = token

    Metadata.setClassMetadata(target, INJECT_PROPERTIES_KEY, existing)
  },
})

export function getInjectTokens(target: Object): { constructorParams: DependencyToken[], properties: DependencyToken[] } {
  return {
    constructorParams: Metadata.getClassMetadata(target, INJECT_PARAM_KEY) ?? [],
    properties: Metadata.getClassMetadata(target, INJECT_PROPERTIES_KEY) ?? {},
  }
}

import { DependencyToken } from '@common/types/dependency'
import { InvalidTokenInjectionException } from '@exceptions/invalid-token.exception'
import { isClass } from '@utils/types'

export function getTokenName(token: DependencyToken) {
  return typeof token == 'string' ? token : token.name
}

export function assertValidToken(token: any) {
  if (!isValidToken(token)) {
    throw new InvalidTokenInjectionException(`Token invalid. The token is expected to be a "class" or "string", but an "${typeof token}" was received`)
  }
}

export function isValidToken(token: any): token is DependencyToken {
  return typeof token == 'string' || isClass(token)
}

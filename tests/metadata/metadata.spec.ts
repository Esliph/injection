import { MetadataRepository } from '@metadata/repository'
import { beforeEach, describe, expect, it } from 'vitest'

describe('MetadataRepository', () => {
  let metadata: MetadataRepository

  beforeEach(() => {
    metadata = new MetadataRepository()
  })

  class TestClass { }
  class OtherClass { }

  describe('Class Metadata', () => {
    it('deve registrar e recuperar metadados de classe', () => {
      metadata.setClassMetadata(TestClass, 'role', 'service')

      expect(metadata.getClassMetadata(TestClass, 'role')).toEqual('service')
    })

    it('deve sobrescrever um valor existente', () => {
      metadata.setClassMetadata(TestClass, 'role', 'service')

      expect(metadata.getClassMetadata(TestClass, 'role')).toEqual('service')

      metadata.setClassMetadata(TestClass, 'role', 'controller')

      expect(metadata.getClassMetadata(TestClass, 'role')).toBe('controller')
    })

    it('deve manter metadados isolados por classe', () => {
      metadata.setClassMetadata(TestClass, 'role', 'controller')
      metadata.setClassMetadata(OtherClass, 'role', 'repository')

      expect(metadata.getClassMetadata(TestClass, 'role')).toEqual('controller')
      expect(metadata.getClassMetadata(OtherClass, 'role')).toEqual('repository')
    })
  })

  describe('Property Metadata', () => {
    it('deve registrar e recuperar metadados de propriedade', () => {
      metadata.setPropertyMetadata(TestClass, 'name', 'required', true)

      expect(metadata.getPropertyMetadata(TestClass, 'name', 'required')).toEqual(true)
    })

    it('deve registrar múltiplos metadados na mesma propriedade', () => {
      metadata.setPropertyMetadata(TestClass, 'name', 'format', 'string')
      metadata.setPropertyMetadata(TestClass, 'name', 'required', true)

      expect(metadata.getPropertyMetadata(TestClass, 'name', 'format')).toEqual('string')
      expect(metadata.getPropertyMetadata(TestClass, 'name', 'required')).toEqual(true)
    })

    it('deve retornar objeto vazio para propriedade sem metadados', () => {
      expect(metadata.getPropertyMetadata(OtherClass, 'miss', 'invalid')).toBeUndefined()
    })
  })

  describe('Method Metadata', () => {
    it('deve registrar e recuperar metadados de método', () => {
      metadata.setMethodMetadata(TestClass, 'save', 'httpMethod', 'POST')

      expect(metadata.getMethodMetadata(TestClass, 'save', 'httpMethod')).toEqual('POST')
    })

    it('deve armazenar múltiplos metadados para o mesmo método', () => {
      metadata.setMethodMetadata(TestClass, 'save', 'httpMethod', 'POST')
      metadata.setMethodMetadata(TestClass, 'save', 'path', '/items')

      expect(metadata.getMethodMetadata(TestClass, 'save', 'httpMethod')).toEqual('POST')
      expect(metadata.getMethodMetadata(TestClass, 'save', 'path')).toEqual('/items')
    })

    it('deve retornar objeto vazio para método sem metadados', () => {
      expect(metadata.getMethodMetadata(TestClass, 'miss', 'unknown')).toBeUndefined()
    })
  })

  describe('Parameter Metadata', () => {
    it('deve registrar e recuperar metadados de parâmetro', () => {
      metadata.setParameterMetadata(TestClass, 'update', 0, 'type', 'string')

      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'type')).toEqual('string')
    })

    it('deve registrar múltiplos metadados no mesmo parâmetro', () => {
      metadata.setParameterMetadata(TestClass, 'update', 0, 'type', 'string')
      metadata.setParameterMetadata(TestClass, 'update', 0, 'required', true)

      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'type')).toEqual('string')
      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'required')).toEqual(true)
    })

    it('deve permitir registrar metadados em parâmetros diferentes', () => {
      metadata.setParameterMetadata(TestClass, 'update', 0, 'type', 'string')
      metadata.setParameterMetadata(TestClass, 'update', 0, 'required', true)
      metadata.setParameterMetadata(TestClass, 'update', 1, 'description', 'second param')

      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'type')).toEqual('string')
      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'required')).toEqual(true)
      expect(metadata.getParameterMetadata(TestClass, 'update', 1, 'description')).toEqual('second param')
    })

    it('deve retornar objeto vazio para método sem metadados de parâmetros', () => {
      expect(metadata.getParameterMetadata(OtherClass, 'method', 0, 'miss')).toBeUndefined()
    })
  })

  describe('WeakMap isolation', () => {
    it('garante que cada classe recebe seu próprio registro no WeakMap', () => {
      metadata.setClassMetadata(TestClass, 'a', 1)
      metadata.setClassMetadata(OtherClass, 'a', 999)

      expect(metadata.getClassMetadata(TestClass, 'a')).toEqual(1)
      expect(metadata.getClassMetadata(OtherClass, 'a')).toEqual(999)
    })

    it('não vaza dados entre classe, propriedades, métodos e parâmetros', () => {
      metadata.setClassMetadata(TestClass, 'key', 'class_value')
      metadata.setPropertyMetadata(TestClass, 'prop', 'key', 'prop_value')
      metadata.setMethodMetadata(TestClass, 'method', 'key', 'method_value')
      metadata.setParameterMetadata(TestClass, 'method', 0, 'key', 'param_value')

      expect(metadata.getClassMetadata(TestClass, 'key')).toEqual('class_value')
      expect(metadata.getPropertyMetadata(TestClass, 'prop', 'key')).toEqual('prop_value')
      expect(metadata.getMethodMetadata(TestClass, 'method', 'key')).toEqual('method_value')
      expect(metadata.getParameterMetadata(TestClass, 'method', 0, 'key')).toEqual('param_value')
    })
  })
})

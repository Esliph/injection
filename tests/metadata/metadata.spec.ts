import { MetadataRepository } from '@metadata/repository'
import { beforeEach, describe, expect, it } from 'vitest'

describe('MetadataRepository', () => {
  let metadata: MetadataRepository

  beforeEach(() => {
    metadata = new MetadataRepository()
  })

  class TestClass { }
  class OtherClass { }

  describe('Tests Metadata', () => {
    it('Expected to register and retrieve class metadata', () => {
      metadata.setClassMetadata(TestClass, 'role', 'service')

      expect(metadata.getClassMetadata(TestClass, 'role')).toEqual('service')
    })

    it('Expected to overwrite an existing value', () => {
      metadata.setClassMetadata(TestClass, 'role', 'service')

      expect(metadata.getClassMetadata(TestClass, 'role')).toEqual('service')

      metadata.setClassMetadata(TestClass, 'role', 'controller')

      expect(metadata.getClassMetadata(TestClass, 'role')).toBe('controller')
    })

    it('It is expected that metadata will be kept isolated by class', () => {
      metadata.setClassMetadata(TestClass, 'role', 'controller')
      metadata.setClassMetadata(OtherClass, 'role', 'repository')

      expect(metadata.getClassMetadata(TestClass, 'role')).toEqual('controller')
      expect(metadata.getClassMetadata(OtherClass, 'role')).toEqual('repository')
    })
  })

  describe('Property Metadata', () => {
    it('Expected to register and retrieve proprietary metadata', () => {
      metadata.setPropertyMetadata(TestClass, 'name', 'required', true)

      expect(metadata.getPropertyMetadata(TestClass, 'name', 'required')).toEqual(true)
    })

    it('Expected to register multiple metadata items on the same property', () => {
      metadata.setPropertyMetadata(TestClass, 'name', 'format', 'string')
      metadata.setPropertyMetadata(TestClass, 'name', 'required', true)

      expect(metadata.getPropertyMetadata(TestClass, 'name', 'format')).toEqual('string')
      expect(metadata.getPropertyMetadata(TestClass, 'name', 'required')).toEqual(true)
    })

    it('Expected to return an empty object for a property without metadata', () => {
      expect(metadata.getPropertyMetadata(OtherClass, 'miss', 'invalid')).toBeUndefined()
    })
  })

  describe('Method Metadata', () => {
    it('Expected to register and retrieve method metadata', () => {
      metadata.setMethodMetadata(TestClass, 'save', 'httpMethod', 'POST')

      expect(metadata.getMethodMetadata(TestClass, 'save', 'httpMethod')).toEqual('POST')
    })

    it('Expected to store multiple metadata for the same method', () => {
      metadata.setMethodMetadata(TestClass, 'save', 'httpMethod', 'POST')
      metadata.setMethodMetadata(TestClass, 'save', 'path', '/items')

      expect(metadata.getMethodMetadata(TestClass, 'save', 'httpMethod')).toEqual('POST')
      expect(metadata.getMethodMetadata(TestClass, 'save', 'path')).toEqual('/items')
    })

    it('Expected to return an empty object for a method without metadata', () => {
      expect(metadata.getMethodMetadata(TestClass, 'miss', 'unknown')).toBeUndefined()
    })
  })

  describe('Parameter Metadata', () => {
    it('Expected to register and retrieve parameter metadata', () => {
      metadata.setParameterMetadata(TestClass, 'update', 0, 'type', 'string')

      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'type')).toEqual('string')
    })

    it('Multiple metadata entries are expected for the same parameter', () => {
      metadata.setParameterMetadata(TestClass, 'update', 0, 'type', 'string')
      metadata.setParameterMetadata(TestClass, 'update', 0, 'required', true)

      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'type')).toEqual('string')
      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'required')).toEqual(true)
    })

    it('It is expected to allow recording metadata in different parameters', () => {
      metadata.setParameterMetadata(TestClass, 'update', 0, 'type', 'string')
      metadata.setParameterMetadata(TestClass, 'update', 0, 'required', true)
      metadata.setParameterMetadata(TestClass, 'update', 1, 'description', 'second param')

      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'type')).toEqual('string')
      expect(metadata.getParameterMetadata(TestClass, 'update', 0, 'required')).toEqual(true)
      expect(metadata.getParameterMetadata(TestClass, 'update', 1, 'description')).toEqual('second param')
    })

    it('Expected to return an empty object for a method without parameter metadata', () => {
      expect(metadata.getParameterMetadata(OtherClass, 'method', 0, 'miss')).toBeUndefined()
    })
  })

  describe('WeakMap isolation', () => {
    it('The goal is to ensure that each class receives its own record', () => {
      metadata.setClassMetadata(TestClass, 'a', 1)
      metadata.setClassMetadata(OtherClass, 'a', 999)

      expect(metadata.getClassMetadata(TestClass, 'a')).toEqual(1)
      expect(metadata.getClassMetadata(OtherClass, 'a')).toEqual(999)
    })

    it('It is expected that no data will leak between classes, properties, methods, and parameters', () => {
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

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline/promises'

const rootDir = process.cwd()
const fieldsDir = path.join(rootDir, 'src/cms/fields')
const blocksDir = path.join(rootDir, 'src/cms/blocks')
const blockComponentsDir = path.join(rootDir, 'src/components/blocks')

const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'checkbox',
  'select',
  'radio',
  'date',
  'email',
  'relationship',
  'upload',
  'richText',
  'code',
  'json',
  'point',
  'join',
  'ui',
  'array',
  'blocks',
  'group',
  'row',
  'tabs',
  'collapsible',
]

const FIELD_STRUCTURES = ['single field', 'field group', 'row', 'tabs']

const asPascalCase = (value) =>
  String(value)
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_\-.\s]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

const asCamelCase = (value) => {
  const pascal = asPascalCase(value)
  if (!pascal) return ''
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

const asKebabCase = (value) =>
  String(value)
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_\-.\s]+/g, ' ')
    .split(' ')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join('-')

const asStartCase = (value) =>
  String(value)
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_\-.\s]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')

const asFieldName = (value, fallback = '') => {
  const normalized = asCamelCase(value || fallback)
  return normalized || asCamelCase(fallback)
}

const asBlockSlug = (value, fallback = '') => {
  const normalized = asKebabCase(value || fallback)
  return normalized || asKebabCase(fallback)
}

const asRendererKey = (value, fallback = '') => {
  const normalized = asCamelCase(value || fallback)
  return normalized || asCamelCase(fallback)
}

const asBlockExportName = (pascalName) => (pascalName.endsWith('Block') ? pascalName : `${pascalName}Block`)
const asBlockPluralLabel = (label) => (label.endsWith('Block') ? `${label}s` : `${label} Blocks`)

const quote = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true })
}

const readFile = (filePath) => fs.readFileSync(filePath, 'utf8')

const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content)
}

const upsertLine = (filePath, line, options = {}) => {
  const source = fs.existsSync(filePath) ? readFile(filePath) : ''
  const normalizedLine = line.trim()
  const lines = source.length > 0 ? source.replace(/\r\n/g, '\n').split('\n') : []

  if (lines.some((entry) => entry.trim() === normalizedLine)) return

  const { afterMatch, beforeMatch, append = true } = options
  let insertAt = lines.length

  if (afterMatch) {
    const matchIndex = lines.reduce((lastIndex, entry, index) => (afterMatch.test(entry) ? index : lastIndex), -1)
    if (matchIndex >= 0) insertAt = matchIndex + 1
  }

  if (beforeMatch) {
    const matchIndex = lines.findIndex((entry) => beforeMatch.test(entry))
    if (matchIndex >= 0) insertAt = matchIndex
  }

  if (!append && insertAt === lines.length) {
    insertAt = 0
  }

  lines.splice(insertAt, 0, line)
  writeFile(filePath, `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`)
}

const parseBoolean = (value, fallback = false) => {
  if (!value) return fallback
  const normalized = value.trim().toLowerCase()
  if (!normalized) return fallback
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized)
}

const withIndent = (value, indentLevel = 0) => {
  const indent = '  '.repeat(indentLevel)
  return value
    .split('\n')
    .map((line) => (line.length > 0 ? `${indent}${line}` : line))
    .join('\n')
}

const createPrompt = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const ask = async (question, fallback = '') => {
    const suffix = fallback ? ` (${fallback})` : ''
    const answer = await rl.question(`${question}${suffix}: `)
    const trimmed = answer.trim()
    return trimmed || fallback
  }

  const confirm = async (question, defaultValue = true) => {
    const fallback = defaultValue ? 'Y/n' : 'y/N'
    const answer = await ask(question, fallback)
    if (answer === fallback) return defaultValue
    return parseBoolean(answer, defaultValue)
  }

  const select = async (question, options) => {
    process.stdout.write(`\n${question}\n`)
    options.forEach((option, index) => {
      process.stdout.write(`  ${index + 1}. ${option}\n`)
    })

    while (true) {
      const answer = await ask('Choose an option')
      const index = Number.parseInt(answer, 10) - 1
      if (Number.isInteger(index) && index >= 0 && index < options.length) {
        return options[index]
      }

      const direct = options.find((option) => option.toLowerCase() === answer.toLowerCase())
      if (direct) return direct
      process.stdout.write('Invalid selection. Please try again.\n')
    }
  }

  return {
    ask,
    close: async () => rl.close(),
    confirm,
    select,
  }
}

const scanReusableFieldHelpers = () => {
  if (!fs.existsSync(fieldsDir)) return []

  return fs
    .readdirSync(fieldsDir)
    .filter((entry) => entry.endsWith('.ts') && entry !== 'index.ts')
    .map((entry) => {
      const source = readFile(path.join(fieldsDir, entry))
      const match = source.match(/export const (\w+)/)
      if (!match) return null

      return {
        exportName: match[1],
        fileName: entry,
      }
    })
    .filter(Boolean)
    .sort((left, right) => left.exportName.localeCompare(right.exportName))
}

const assertFieldHelperDoesNotExist = ({ camelName, factoryName }) => {
  const helpers = scanReusableFieldHelpers()
  const conflictingHelper = helpers.find((helper) => {
    const helperBaseName = helper.fileName.replace(/\.ts$/, '')

    return (
      helperBaseName.toLowerCase() === camelName.toLowerCase() ||
      helper.exportName.toLowerCase() === factoryName.toLowerCase()
    )
  })

  if (!conflictingHelper) return

  const reasons = []
  const helperBaseName = conflictingHelper.fileName.replace(/\.ts$/, '')

  if (helperBaseName.toLowerCase() === camelName.toLowerCase()) reasons.push(`file "${camelName}.ts"`)
  if (conflictingHelper.exportName.toLowerCase() === factoryName.toLowerCase()) {
    reasons.push(`export "${factoryName}"`)
  }

  throw new Error(
    `Reusable field helper already exists with ${reasons.join(', ')}. Existing helper: ${conflictingHelper.exportName} in ${conflictingHelper.fileName}.`,
  )
}

const scanExistingBlocks = () => {
  if (!fs.existsSync(blocksDir)) return []

  return fs
    .readdirSync(blocksDir, { withFileTypes: true })
    .filter((entry) => {
      if (entry.name === 'index.ts' || entry.name === 'contracts.ts') return false
      return entry.isDirectory() || entry.name.endsWith('.ts')
    })
    .map((entry) => {
      const sourceName = entry.isDirectory() ? entry.name : entry.name.replace(/\.ts$/, '')
      const configPath = entry.isDirectory()
        ? path.join(blocksDir, entry.name, fs.existsSync(path.join(blocksDir, entry.name, 'config.ts')) ? 'config.ts' : 'index.ts')
        : path.join(blocksDir, entry.name)
      const source = readFile(configPath)
      const exportMatch = source.match(/export const (\w+Block)\s*[:=]/)
      const slugMatch = source.match(/slug:\s*['"]([^'"]+)['"]/)

      return {
        dirName: sourceName,
        exportName: exportMatch?.[1] ?? `${asPascalCase(sourceName)}Block`,
        pascalName: asPascalCase(sourceName),
        slug: slugMatch?.[1] ?? asKebabCase(sourceName),
      }
    })
    .sort((left, right) => left.slug.localeCompare(right.slug))
}

const getExistingRegistryEntries = () => {
  const registryPath = path.join(blockComponentsDir, 'registry.tsx')
  if (!fs.existsSync(registryPath)) return []

  const source = readFile(registryPath)
  return Array.from(source.matchAll(/^\s*(?:'([^']+)'|([A-Za-z][A-Za-z0-9]*)):\s*\(\{ block \}\)\s*=>/gm)).map(
    (match) => match[1] ?? match[2],
  )
}

const assertBlockDoesNotExist = ({ exportName, componentName, pascalName, slug }) => {
  const existingBlocks = scanExistingBlocks()
  const conflictingBlock = existingBlocks.find((block) => {
    return (
      block.pascalName.toLowerCase() === pascalName.toLowerCase() ||
      block.exportName.toLowerCase() === exportName.toLowerCase() ||
      block.slug.toLowerCase() === slug.toLowerCase()
    )
  })

  if (conflictingBlock) {
    const reasons = []
    if (conflictingBlock.pascalName.toLowerCase() === pascalName.toLowerCase()) reasons.push(`name "${pascalName}"`)
    if (conflictingBlock.exportName.toLowerCase() === exportName.toLowerCase()) reasons.push(`export "${exportName}"`)
    if (conflictingBlock.slug.toLowerCase() === slug.toLowerCase()) reasons.push(`slug "${slug}"`)

    throw new Error(
      `Block already exists with ${reasons.join(', ')}. Existing block: ${conflictingBlock.exportName} (${conflictingBlock.slug}).`,
    )
  }

  const componentFilePath = path.join(blockComponentsDir, `${componentName}.tsx`)
  if (fs.existsSync(componentFilePath)) {
    throw new Error(`Frontend block component already exists at src/components/blocks/${componentName}.tsx.`)
  }

  const rendererKey = asRendererKey(slug)
  const registryCollision = getExistingRegistryEntries().find((entry) => entry.toLowerCase() === rendererKey.toLowerCase())
  if (registryCollision) {
    throw new Error(`Block renderer already exists for key "${rendererKey}" in src/components/blocks/registry.tsx.`)
  }
}

const collectOptions = async (prompt, optionTypeLabel) => {
  const options = []

  while (true) {
    const label = await prompt.ask(`${optionTypeLabel} label`)
    const value = await prompt.ask(`${optionTypeLabel} value`, asKebabCase(label) || label)
    options.push({ label, value })

    if (!(await prompt.confirm(`Add another ${optionTypeLabel.toLowerCase()} option?`, false))) {
      return options
    }
  }
}

const createImportsState = () => ({
  blockExports: new Set(),
  helperExports: new Set(),
  needsLexicalEditor: false,
})

const mergeAdminEntries = (field) => {
  const entries = []

  if (field.description) entries.push(`description: ${quote(field.description)}`)
  if (field.type === 'number' && field.integerOnly) entries.push('step: 1')
  if (field.type === 'date' && field.adminDate) entries.push("date: { pickerAppearance: 'dayAndTime' }")
  if (field.type === 'code' && field.adminLanguage) entries.push(`language: ${quote(field.adminLanguage)}`)
  if (field.type === 'ui' && field.adminUIType) entries.push(`components: { Field: ${quote(field.adminUIType)} }`)
  if (field.type === 'collapsible' && field.initCollapsed) entries.push('initCollapsed: true')

  return entries
}

const buildFieldConfig = async (prompt, context, depth = 0) => {
  const sourceMode = context.allowReusable
    ? await prompt.select('How do you want to add this field?', ['Create inline field', 'Use existing reusable field'])
    : 'Create inline field'

  if (sourceMode === 'Use existing reusable field') {
    const helpers = scanReusableFieldHelpers()
    if (helpers.length === 0) {
      process.stdout.write('No reusable field helpers found. Falling back to inline field creation.\n')
      return buildFieldConfig(prompt, { ...context, allowReusable: false }, depth)
    }

    const helperChoices = [...helpers.map((helper) => helper.exportName), '[Back to field type selection]']
    const exportName = await prompt.select('Select reusable field helper', helperChoices)

    if (exportName === '[Back to field type selection]') {
      return buildFieldConfig(prompt, { ...context, allowReusable: false }, depth)
    }

    const overrideInput = await prompt.ask('Override field name locally? Leave blank to keep helper defaults', '')
    const overrideName = overrideInput ? asFieldName(overrideInput) : ''

    return {
      kind: 'reusable',
      exportName,
      overrideName: overrideName || null,
    }
  }

  const type = await prompt.select('Field type', FIELD_TYPES)
  const defaultName = type === 'row' ? `row${depth + 1}` : type === 'tabs' ? `tabs${depth + 1}` : `${type}${depth + 1}`
  const rawName = type === 'row' || type === 'tabs' ? null : await prompt.ask('Field name', asFieldName(defaultName))
  const name = rawName ? asFieldName(rawName, defaultName) : null
  const labelPrompt = type === 'row' ? 'Row label' : type === 'tabs' ? 'Tabs label' : 'Field label'
  const labelDefault = name ? asStartCase(name) : asStartCase(defaultName)
  const label = await prompt.ask(labelPrompt, labelDefault)
  const required = type === 'row' || type === 'tabs' ? false : await prompt.confirm('Required?', false)
  const localized = type === 'row' || type === 'tabs' ? false : await prompt.confirm('Localized?', false)
  const hasDescription = context.allowDescriptions ? await prompt.confirm('Add admin description?', false) : false
  const description = hasDescription ? await prompt.ask('Description') : ''

  const field = {
    kind: 'inline',
    type,
    name,
    label,
    required,
    localized,
    description: description || null,
  }

  if (type === 'text' || type === 'textarea') {
    field.minLength = (await prompt.ask('Min length? Leave blank to skip', '')) || null
    field.maxLength = (await prompt.ask('Max length? Leave blank to skip', '')) || null
  }

  if (type === 'number') {
    field.min = (await prompt.ask('Min? Leave blank to skip', '')) || null
    field.max = (await prompt.ask('Max? Leave blank to skip', '')) || null
    field.integerOnly = await prompt.confirm('Integer only?', false)
  }

  if (type === 'checkbox') {
    field.defaultValue = await prompt.confirm('Default value?', false)
  }

  if (type === 'select' || type === 'radio') {
    field.options = await collectOptions(prompt, type === 'select' ? 'Select' : 'Radio')
    if (type === 'select') {
      field.hasMany = await prompt.confirm('Allow multiple values?', false)
    }
  }

  if (type === 'date') field.adminDate = await prompt.confirm('Include time?', false)

  if (type === 'relationship') {
    field.relationTo = await prompt.ask('Relation to collection', 'pages')
    field.hasMany = await prompt.confirm('Allow multiple values?', false)
  }

  if (type === 'upload') {
    field.relationTo = await prompt.ask('Relation to upload collection', 'media')
    field.hasMany = await prompt.confirm('Allow multiple values?', false)
  }

  if (type === 'richText') field.useLexical = await prompt.confirm('Use default lexical editor?', true)
  if (type === 'code') field.adminLanguage = await prompt.ask('Default language?', 'ts')

  if (type === 'join') {
    field.collection = await prompt.ask('Collection slug', 'posts')
    field.on = await prompt.ask('Join on field', 'id')
  }

  if (type === 'ui') field.adminUIType = await prompt.ask('UI field component/type', 'text')

  if (type === 'point') {
    field.defaultX = (await prompt.ask('Default X? Leave blank to skip', '')) || null
    field.defaultY = (await prompt.ask('Default Y? Leave blank to skip', '')) || null
  }

  if (type === 'blocks') {
    const blocks = scanExistingBlocks()
    const selected = []

    if (blocks.length > 0) {
      while (true) {
        const choice = await prompt.select('Select allowed block', [...blocks.map((block) => `${block.exportName} (${block.slug})`), '[Done]'])
        if (choice === '[Done]') break

        const exportName = choice.split(' (')[0]
        if (!selected.includes(exportName)) selected.push(exportName)
      }
    }

    field.blockReferences = selected
  }

  if (['array', 'group', 'row', 'collapsible'].includes(type)) {
    field.fields = await buildFieldLoop(prompt, { allowDescriptions: context.allowDescriptions, allowReusable: context.allowReusable }, depth + 1)
  }

  if (type === 'tabs') {
    field.tabs = []
    while (true) {
      const tabLabel = await prompt.ask('Tab label')
      const fields = await buildFieldLoop(prompt, { allowDescriptions: context.allowDescriptions, allowReusable: context.allowReusable }, depth + 1)
      field.tabs.push({ fields, label: tabLabel })
      if (!(await prompt.confirm('Add another tab?', false))) break
    }
  }

  return field
}

const buildFieldLoop = async (prompt, context, depth = 0) => {
  const fields = []

  while (await prompt.confirm(depth === 0 && fields.length === 0 ? 'Add field?' : 'Add another field?', fields.length === 0)) {
    fields.push(await buildFieldConfig(prompt, context, depth))
  }

  return fields
}

const serializeReusableFieldUsage = (field, imports) => {
  imports.helperExports.add(field.exportName)
  if (!field.overrideName) return `${field.exportName}()`

  return `${field.exportName}({ name: ${quote(field.overrideName)} })`
}

const serializeInlineField = (field, imports, indentLevel = 0) => {
  const lines = []
  const push = (line) => lines.push(`${'  '.repeat(indentLevel + 1)}${line}`)
  const adminEntries = mergeAdminEntries(field)

  if (field.name) push(`name: ${quote(field.name)},`)
  if (field.label) push(`label: ${quote(field.label)},`)
  push(`type: ${quote(field.type)},`)
  if (field.required) push('required: true,')
  if (field.localized) push('localized: true,')

  if (field.type === 'text' || field.type === 'textarea') {
    if (field.minLength) push(`minLength: ${Number(field.minLength)},`)
    if (field.maxLength) push(`maxLength: ${Number(field.maxLength)},`)
  }

  if (field.type === 'number') {
    if (field.min) push(`min: ${Number(field.min)},`)
    if (field.max) push(`max: ${Number(field.max)},`)
  }

  if (field.type === 'checkbox' && field.defaultValue) push('defaultValue: true,')

  if (field.type === 'relationship' || field.type === 'upload') {
    push(`relationTo: ${quote(field.relationTo)},`)
    if (field.hasMany) push('hasMany: true,')
  }

  if (field.type === 'select' || field.type === 'radio') {
    push('options: [')
    for (const option of field.options || []) {
      push(`  { label: ${quote(option.label)}, value: ${quote(option.value)} },`)
    }
    push('],')
    if (field.type === 'select' && field.hasMany) push('hasMany: true,')
  }

  if (field.type === 'richText' && field.useLexical) {
    imports.needsLexicalEditor = true
    push('editor: lexicalEditor(),')
  }

  if (field.type === 'point') {
    push('fields: [')
    push(`  { name: 'x', type: 'number'${field.defaultX ? `, defaultValue: ${Number(field.defaultX)}` : ''} },`)
    push(`  { name: 'y', type: 'number'${field.defaultY ? `, defaultValue: ${Number(field.defaultY)}` : ''} },`)
    push('],')
  }

  if (field.type === 'join') {
    push(`collection: ${quote(field.collection)},`)
    push(`on: ${quote(field.on)},`)
  }

  if (field.type === 'blocks') {
    push('blocks: [')
    for (const exportName of field.blockReferences || []) {
      imports.blockExports.add(exportName)
      push(`  ${exportName},`)
    }
    push('],')
  }

  if (['array', 'group', 'row', 'collapsible'].includes(field.type)) {
    push('fields: [')
    for (const nestedField of field.fields || []) {
      push(withIndent(`${serializeFieldConfig(nestedField, imports, indentLevel + 2)},`, 1))
    }
    push('],')
  }

  if (field.type === 'tabs') {
    push('tabs: [')
    for (const tab of field.tabs || []) {
      push('  {')
      push(`    label: ${quote(tab.label)},`)
      push('    fields: [')
      for (const nestedField of tab.fields || []) {
        push(withIndent(`${serializeFieldConfig(nestedField, imports, indentLevel + 3)},`, 3))
      }
      push('    ],')
      push('  },')
    }
    push('],')
  }

  if (adminEntries.length > 0) {
    push('admin: {')
    for (const entry of adminEntries) {
      push(`  ${entry},`)
    }
    push('},')
  }

  return `{\n${lines.join('\n')}\n${'  '.repeat(indentLevel)}}`
}

const serializeFieldConfig = (field, imports, indentLevel = 0) => {
  if (field.kind === 'reusable') return serializeReusableFieldUsage(field, imports)
  return serializeInlineField(field, imports, indentLevel)
}

const buildFieldFactoryOptionsType = (config) => {
  const supportsNameOverride = config.structure === 'single field' || config.structure === 'field group'
  const supportsLabelOverride = config.structure === 'single field' || config.structure === 'field group'
  const supportsRequiredOverride = config.structure === 'single field' || config.structure === 'field group'
  const supportsLocalizedOverride = config.structure === 'single field' || config.structure === 'field group'
  const supportsDescriptionOverride = config.structure === 'single field' || config.structure === 'field group'

  const lines = []
  if (supportsNameOverride) lines.push('  name?: string')
  if (supportsLabelOverride) lines.push('  label?: string')
  if (supportsRequiredOverride) lines.push('  required?: boolean')
  if (supportsLocalizedOverride) lines.push('  localized?: boolean')
  if (supportsDescriptionOverride) lines.push('  description?: string')

  return lines.length > 0 ? lines : ['  // No runtime overrides for this helper yet']
}

const applyRootOverrides = (config, returnField) => {
  if (config.structure !== 'single field' && config.structure !== 'field group') return returnField

  const lines = ['const field: Field = ' + returnField, '', 'if (options.name) field.name = options.name']
  lines.push('if (options.label) field.label = options.label')
  lines.push("if (typeof options.required === 'boolean') field.required = options.required")
  lines.push("if (typeof options.localized === 'boolean') field.localized = options.localized")
  lines.push('if (options.description) {')
  lines.push('  field.admin = {')
  lines.push('    ...(field.admin ?? {}),')
  lines.push('    description: options.description,')
  lines.push('  }')
  lines.push('}')
  lines.push('')
  lines.push('return field')

  return `{\n${withIndent(lines.join('\n'), 1)}\n}`
}

const buildFieldHelperFile = (config) => {
  const imports = createImportsState()
  const optionsTypeName = `${asPascalCase(config.factoryName)}Options`

  let returnField = ''
  if (config.structure === 'single field') {
    returnField = serializeFieldConfig(config.field, imports, 1)
  } else if (config.structure === 'field group') {
    const fields = config.fields.map((field) => withIndent(`${serializeFieldConfig(field, imports, 3)},`, 3)).join('\n')
    returnField = `{
  name: ${quote(asFieldName(config.groupName, config.camelName))},
  label: ${quote(config.groupLabel)},
  type: 'group',
  fields: [
${fields}
  ],
}`
  } else if (config.structure === 'row') {
    const fields = config.fields.map((field) => withIndent(`${serializeFieldConfig(field, imports, 3)},`, 3)).join('\n')
    returnField = `{
  type: 'row',
  fields: [
${fields}
  ],
}`
  } else {
    const tabs = config.tabs
      .map((tab) => {
        const fields = tab.fields.map((field) => withIndent(`${serializeFieldConfig(field, imports, 5)},`, 5)).join('\n')
        return `    {
      label: ${quote(tab.label)},
      fields: [
${fields}
      ],
    }`
      })
      .join('\n')

    returnField = `{
  type: 'tabs',
  tabs: [
${tabs}
  ],
}`
  }

  const lines = []
  if (imports.needsLexicalEditor) lines.push("import { lexicalEditor } from '@payloadcms/richtext-lexical'")
  lines.push("import type { Field } from 'payload'")
  if (imports.blockExports.size > 0) lines.push(`import { ${Array.from(imports.blockExports).sort().join(', ')} } from '@/cms/blocks'`)
  if (imports.helperExports.size > 0) lines.push(`import { ${Array.from(imports.helperExports).sort().join(', ')} } from '@/cms/fields'`)

  lines.push('')
  lines.push(`type ${optionsTypeName} = {`)
  lines.push(...buildFieldFactoryOptionsType(config))
  lines.push('}')
  lines.push('')
  lines.push(`export const ${config.factoryName} = (options: ${optionsTypeName} = {}): Field => ${applyRootOverrides(config, returnField)}`)

  return `${lines.join('\n')}\n`
}

const buildBlockConfigFile = (config) => {
  const imports = createImportsState()
  const fieldLines = config.fields.map((field) => withIndent(`${serializeFieldConfig(field, imports, 2)},`, 2)).join('\n')
  const lines = ["import type { Block } from 'payload'"]

  if (imports.needsLexicalEditor) lines.push("import { lexicalEditor } from '@payloadcms/richtext-lexical'")
  if (imports.blockExports.size > 0) lines.push(`import { ${Array.from(imports.blockExports).sort().join(', ')} } from '@/cms/blocks'`)
  if (imports.helperExports.size > 0) lines.push(`import { ${Array.from(imports.helperExports).sort().join(', ')} } from '@/cms/fields'`)

  lines.push('')
  lines.push(`export const ${config.exportName}: Block = {`)
  lines.push(`  slug: ${quote(config.slug)},`)
  lines.push('  labels: {')
  lines.push(`    singular: ${quote(config.label)},`)
  lines.push(`    plural: ${quote(asBlockPluralLabel(config.label))},`)
  lines.push('  },')
  lines.push('  fields: [')
  lines.push(fieldLines)
  lines.push('  ],')
  lines.push('}')

  return `${lines.join('\n')}\n`
}

const buildBlockEntryFile = (config) => `export { ${config.exportName} } from './config'\n`

const buildBlockComponentFile = (config) =>
  `import type { GenericBlockData } from './types'\n\ntype Props = {\n  block: GenericBlockData\n}\n\nexport const ${config.componentName} = ({ block }: Props) => {\n  return (\n    <section className="starter-block starter-block--generated" data-block-type=${quote(config.slug)}>\n      <h2>${config.label}</h2>\n      <pre>{JSON.stringify(block, null, 2)}</pre>\n    </section>\n  )\n}\n`

const normalizeBlocksIndex = (filePath) => {
  const source = readFile(filePath)
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  const exportLines = []
  const importLines = []
  const otherLines = []

  for (const line of lines) {
    if (/^export \{ \w+ \} from '\.\//.test(line)) {
      if (!exportLines.includes(line)) exportLines.push(line)
      continue
    }

    if (/^import \{ \w+ \} from '\.\//.test(line)) {
      if (!importLines.includes(line)) importLines.push(line)
      continue
    }

    if (line.trim().length > 0) otherLines.push(line)
  }

  writeFile(filePath, `${[...exportLines, '', ...importLines, '', ...otherLines].join('\n').replace(/\n{3,}/g, '\n\n')}\n`)
}

const updateCmsBlocksIndex = (config) => {
  const filePath = path.join(blocksDir, 'index.ts')
  upsertLine(filePath, `export { ${config.exportName} } from './${config.pascalName}'`, {
    beforeMatch: /^import /,
    append: false,
  })
  upsertLine(filePath, `import { ${config.exportName} } from './${config.pascalName}'`, {
    afterMatch: /^import /,
  })

  const source = readFile(filePath)
  const pattern = /export const PAGE_BLOCKS = \[([\s\S]*?)\] as const/
  if (!pattern.test(source)) return
  if (new RegExp(`\\b${escapeRegExp(config.exportName)}\\b`).test(source.match(pattern)?.[1] ?? '')) {
    normalizeBlocksIndex(filePath)
    return
  }

  writeFile(
    filePath,
    source.replace(pattern, (_match, inner) => {
      const entries = inner
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
      entries.push(config.exportName)
      return `export const PAGE_BLOCKS = [${entries.join(', ')}] as const`
    }),
  )

  normalizeBlocksIndex(filePath)
}

const updateBlockComponentIndex = (config) => {
  upsertLine(path.join(blockComponentsDir, 'index.ts'), `export * from './${config.componentName}'`)
}

const updateBlockRegistry = (config) => {
  const filePath = path.join(blockComponentsDir, 'registry.tsx')
  upsertLine(filePath, `import { ${config.componentName} } from './${config.componentName}'`, {
    afterMatch: /^import /,
  })

  const source = readFile(filePath)
  const rendererKey = asRendererKey(config.slug)
  const registryEntry = `  ${rendererKey}: ({ block }) => <${config.componentName} block={block as GenericBlockData} />,`
  if (source.includes(registryEntry)) return

  writeFile(
    filePath,
    source.replace(
      /export const BLOCK_RENDERERS: Record<string, BlockComponent> = \{\n/,
      (match) => `${match}${registryEntry}\n`,
    ),
  )
}

const generateField = async () => {
  const prompt = createPrompt()

  try {
    const helperName = await prompt.ask('Reusable field helper name')
    const camelName = asCamelCase(helperName)
    if (!camelName) throw new Error('Reusable field helper name is required.')

    const factoryName = `${camelName}Field`
    assertFieldHelperDoesNotExist({ camelName, factoryName })
    const structure = await prompt.select('Reusable field structure', FIELD_STRUCTURES)

    const config = { camelName, factoryName, structure }

    if (structure === 'single field') {
      config.field = await buildFieldConfig(prompt, { allowDescriptions: true, allowReusable: false }, 0)
    } else if (structure === 'field group') {
      config.groupName = asFieldName(await prompt.ask('Group field name', camelName), camelName)
      config.groupLabel = await prompt.ask('Group field label', asStartCase(config.groupName))
      config.fields = await buildFieldLoop(prompt, { allowDescriptions: true, allowReusable: false }, 1)
    } else if (structure === 'row') {
      config.fields = await buildFieldLoop(prompt, { allowDescriptions: true, allowReusable: false }, 1)
    } else {
      config.tabs = []
      while (true) {
        const tabLabel = await prompt.ask('Tab label')
        const fields = await buildFieldLoop(prompt, { allowDescriptions: true, allowReusable: false }, 1)
        config.tabs.push({ fields, label: tabLabel })
        if (!(await prompt.confirm('Add another tab?', false))) break
      }
    }

    const shouldExport = await prompt.confirm('Export from src/cms/fields/index.ts?', true)

    process.stdout.write(
      `\nSummary:\n- Field helper: ${factoryName}\n- Structure: ${structure}\n- Export from index: ${shouldExport ? 'yes' : 'no'}\n`,
    )

    if (!(await prompt.confirm('Generate this reusable field helper now?', true))) return

    const outputPath = path.join(fieldsDir, `${camelName}.ts`)
    writeFile(outputPath, buildFieldHelperFile(config))

    if (shouldExport) {
      upsertLine(path.join(fieldsDir, 'index.ts'), `export * from './${camelName}'`)
    }

    process.stdout.write(`Created ${path.relative(rootDir, outputPath)}\n`)
  } finally {
    await prompt.close()
  }
}

const generateBlock = async () => {
  const prompt = createPrompt()

  try {
    const name = await prompt.ask('Block name')
    const pascalName = asPascalCase(name)
    if (!pascalName) throw new Error('Block name is required.')

    const slug = asBlockSlug(await prompt.ask('Block slug', asBlockSlug(name)), name)
    const exportName = asBlockExportName(pascalName)
    const componentName = exportName
    assertBlockDoesNotExist({ exportName, componentName, pascalName, slug })

    const label = await prompt.ask('Block label', asStartCase(name))
    const addFrontendComponent = await prompt.confirm('Add frontend component stub?', true)
    const registerBlockAutomatically = addFrontendComponent ? await prompt.confirm('Register block automatically?', true) : false
    const fields = await buildFieldLoop(prompt, { allowDescriptions: false, allowReusable: true }, 0)

    const reusableHelpersUsed = Array.from(
      new Set(
        fields
          .flatMap((field) => JSON.stringify(field).match(/"exportName":"([^"]+)"/g) ?? [])
          .map((entry) => entry.replace(/.*"exportName":"([^"]+)".*/, '$1')),
      ),
    )

    process.stdout.write(
      `\nSummary:\n- Block: ${label}\n- Slug: ${slug}\n- Renderer key: ${asRendererKey(slug)}\n- Fields: ${fields.length}\n- Reusable helpers: ${reusableHelpersUsed.length > 0 ? reusableHelpersUsed.join(', ') : 'none'}\n- Frontend stub: ${addFrontendComponent ? 'yes' : 'no'}\n- Auto-register: ${registerBlockAutomatically ? 'yes' : 'no'}\n`,
    )

    if (!(await prompt.confirm('Generate this block now?', true))) return

    const cmsBlockDir = path.join(blocksDir, pascalName)
    writeFile(path.join(cmsBlockDir, 'config.ts'), buildBlockConfigFile({ exportName, fields, label, pascalName, slug }))
    writeFile(path.join(cmsBlockDir, 'index.ts'), buildBlockEntryFile({ exportName }))
    updateCmsBlocksIndex({ exportName, pascalName })

    if (addFrontendComponent) {
      writeFile(path.join(blockComponentsDir, `${componentName}.tsx`), buildBlockComponentFile({ componentName, label, slug }))
      updateBlockComponentIndex({ componentName })
      if (registerBlockAutomatically) {
        updateBlockRegistry({ componentName, slug })
      }
    }

    process.stdout.write(`Created CMS block at ${path.relative(rootDir, cmsBlockDir)}\n`)
  } finally {
    await prompt.close()
  }
}

const command = process.argv[2]

if (command === 'field') {
  generateField().catch((error) => {
    console.error('[gen:field] failed', error)
    process.exit(1)
  })
} else if (command === 'block') {
  generateBlock().catch((error) => {
    console.error('[gen:block] failed', error)
    process.exit(1)
  })
} else {
  console.error('Usage: node src/scripts/generators/interactive.mjs <field|block>')
  process.exit(1)
}

const path = require('node:path')

const toWords = (value) =>
  String(value)
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_\-.\s]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)

const toPascalCase = (value) =>
  toWords(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

const toCamelCase = (value) => {
  const pascal = toPascalCase(value)
  if (!pascal) return ''
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

const toKebabCase = (value) => toWords(value).map((word) => word.toLowerCase()).join('-')

module.exports = function register(plop) {
  plop.setHelper('pascalCase', toPascalCase)
  plop.setHelper('camelCase', toCamelCase)
  plop.setHelper('kebabCase', toKebabCase)

  plop.setGenerator('collection', {
    description: 'Create a starter collection',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Collection name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/collections/{{pascalCase name}}/index.ts'),
        templateFile: path.join(__dirname, 'plop-templates/collection/index.ts.hbs'),
      },
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/collections/{{pascalCase name}}/hooks/assignAuthor.ts'),
        templateFile: path.join(__dirname, 'plop-templates/collection/hooks/assignAuthor.ts.hbs'),
      },
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/collections/{{pascalCase name}}/hooks/setPublishedAt.ts'),
        templateFile: path.join(__dirname, 'plop-templates/collection/hooks/setPublishedAt.ts.hbs'),
      },
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/collections/{{pascalCase name}}/hooks/createAuditHooks.ts'),
        templateFile: path.join(__dirname, 'plop-templates/collection/hooks/createAuditHooks.ts.hbs'),
      },
    ],
  })

  plop.setGenerator('global', {
    description: 'Create a starter global',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Global name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/globals/{{pascalCase name}}/index.ts'),
        templateFile: path.join(__dirname, 'plop-templates/global/index.ts.hbs'),
      },
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/globals/{{pascalCase name}}/hooks/.gitkeep'),
        template: '',
      },
    ],
  })

  plop.setGenerator('block', {
    description: 'Create a starter block',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Block name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/blocks/{{pascalCase name}}/config.ts'),
        templateFile: path.join(__dirname, 'plop-templates/block/config.ts.hbs'),
      },
      {
        type: 'add',
        path: path.join(__dirname, 'src/cms/blocks/{{pascalCase name}}/index.ts'),
        templateFile: path.join(__dirname, 'plop-templates/block/index.ts.hbs'),
      },
    ],
  })
}

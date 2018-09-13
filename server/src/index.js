const Fuse = require('fuse.js')
//const jsonToTable = require('json-to-table')
const tableify = require('tableify')
const { transformKubectlHws, transformKubectlVms } = require('../data/transformKubectl')
const { GraphQLServer } = require('graphql-yoga')
const hwKubectl = require('../data/kubectl/nodes.json')
const vmKubectl = require('../data/kubectl/virtualmachines.json')

const typeDefs = `
  type Query {
    opsquery(opsquerystr: String): String
  }
`

const resolvers = {
  Query: {
    opsquery: (_, args) => `${ tableify(fuse.search(args.opsquerystr || 'PROD')) }`,
  },
}

const hw = transformKubectlHws(hwKubectl.items)
const vm = transformKubectlVms(vmKubectl.items)

// finding slot number in externalID: 0.2-0.4
const options = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "name",
    "addresses",
    "environment"
  ]
}

const fuse = new Fuse(hw.concat(vm), options)

const server = new GraphQLServer({ typeDefs, resolvers })
server.start(() => console.log(`Server is running at http://localhost:4000`))

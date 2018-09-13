const Fuse = require('fuse.js')
//const jsonToTable = require('json-to-table')
const tableify = require('tableify')
const { transformKubectlHws, transformKubectlVms } = require('../data/transformKubectl')
const { GraphQLServer } = require('graphql-yoga')
const hwKubectl = require('../data/kubectl/nodes.json')
const vmsKubectl = require('../data/kubectl/virtualmachines.json')

const typeDefs = `
  type Query {
    opsquery(opsquerystr: String): String
  }
`

const resolvers = {
  Query: {
    opsquery: (_, args) => `${ tableify(fuse.search(args.opsquerystr || 'fz2')) }`,
  },
}

const hw = transformKubectlHws(hwKubectl.items)

// finding slot number in externalID: 0.2-0.4
const options = {
  shouldSort: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "name"
  ]
}

const fuse = new Fuse(hw, options)

const server = new GraphQLServer({ typeDefs, resolvers })
server.start(() => console.log(`Server is running at http://localhost:4000`))

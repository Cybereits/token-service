import Agenda from 'agenda'
import propReader from 'properties-reader'
import path from 'path'

let reader = propReader(path.resolve(__dirname, '../../config/server.properties'))
let ip = reader.get('db_ip')
let port = reader.get('db_port')
let name = reader.get('job_db_name')
let collectionName = reader.get('job_collection_name')
const mongoConnectionString = `mongodb://${ip}:${port}/${name}`

const AgendaClient = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: collectionName,
    processEvery: '1 minute',
  },
})

export default AgendaClient

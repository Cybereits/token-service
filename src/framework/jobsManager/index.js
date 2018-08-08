import Agenda from 'agenda'

import { mongo, agenda } from '../../config/env.json'

let { ip, port } = mongo
let { job, collection } = agenda
const mongoConnectionString = `mongodb://${ip}:${port}/${job}`

const AgendaClient = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: collection,
    processEvery: '1 minute',
  },
})

export default AgendaClient

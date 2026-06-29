import WorkerFactory from './WorkerFactory'
export default class CommandFactory {
  store = new Map()
  static instance = null
  constructor() {
    if (this.instance) {
      return this.instance
    }
    this.instance = this
  }
  static getInstance() {
    if (!CommandFactory.instance) {
      CommandFactory.instance = new CommandFactory()
    }
    return CommandFactory.instance
  }
  dispatch(cmd) {
    const Worker = WorkerFactory.create(cmd)
    if (!Worker) {
      throw new Error('未找到对应的Worker')
    }
    // if (!this.store.has(Worker.name)) {
    //   this.store.set(Worker.name, new Worker())
    // }
    // return this.store.get(Worker.name) 
    return new Worker()
  }
  clear() { 
    this.store.clear()
    this.instance = null
  }
}

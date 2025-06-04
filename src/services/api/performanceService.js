import performanceData from '../mockData/performances.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const performanceService = {
  async getAll() {
    await delay(300)
    return [...performanceData]
  },

  async getById(id) {
    await delay(200)
    const performance = performanceData.find(item => item.id === id)
    if (!performance) {
      throw new Error('Performance not found')
    }
    return { ...performance }
  },

  async create(performanceData) {
    await delay(400)
    const newPerformance = {
      ...performanceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    return { ...newPerformance }
  },

  async update(id, updates) {
    await delay(350)
    const performance = performanceData.find(item => item.id === id)
    if (!performance) {
      throw new Error('Performance not found')
    }
    const updatedPerformance = { ...performance, ...updates }
    return { ...updatedPerformance }
  },

  async delete(id) {
    await delay(250)
    const performanceIndex = performanceData.findIndex(item => item.id === id)
    if (performanceIndex === -1) {
      throw new Error('Performance not found')
    }
    return { success: true }
  }
}

export default performanceService
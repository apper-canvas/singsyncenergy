import songData from '../mockData/songs.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const songService = {
  async getAll() {
    await delay(300)
    return [...songData]
  },

  async getById(id) {
    await delay(200)
    const song = songData.find(item => item.id === id)
    if (!song) {
      throw new Error('Song not found')
    }
    return { ...song }
  },

  async create(songData) {
    await delay(400)
    const newSong = {
      ...songData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    return { ...newSong }
  },

  async update(id, updates) {
    await delay(350)
    const song = songData.find(item => item.id === id)
    if (!song) {
      throw new Error('Song not found')
    }
    const updatedSong = { ...song, ...updates }
    return { ...updatedSong }
  },

  async delete(id) {
    await delay(250)
    const songIndex = songData.findIndex(item => item.id === id)
    if (songIndex === -1) {
      throw new Error('Song not found')
    }
    return { success: true }
  }
}

export default songService
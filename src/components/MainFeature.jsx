import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import songService from '../services/api/songService'
import performanceService from '../services/api/performanceService'

const MainFeature = () => {
  // State management
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSong, setSelectedSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [recordingData, setRecordingData] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)

  // Refs
  const audioRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  // Load songs on mount
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true)
      try {
        const result = await songService.getAll()
        setSongs(result || [])
      } catch (err) {
        setError(err.message)
        toast.error("Failed to load songs")
      } finally {
        setLoading(false)
      }
    }
    loadSongs()
  }, [])

  // Audio time update
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      
      // Update current lyric based on time
      if (selectedSong?.lyricsData) {
        const currentIndex = selectedSong.lyricsData.findIndex((lyric, index) => {
          const nextLyric = selectedSong.lyricsData[index + 1]
          return audio.currentTime >= lyric.time && (!nextLyric || audio.currentTime < nextLyric.time)
        })
        if (currentIndex !== -1 && currentIndex !== currentLyricIndex) {
          setCurrentLyricIndex(currentIndex)
        }
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [selectedSong, currentLyricIndex])

  // Filter songs based on search
  const filteredSongs = songs.filter(song =>
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Play/Pause functionality
  const togglePlay = async () => {
    if (!selectedSong) {
      setShowSearch(true)
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      toast.error("Failed to play audio")
    }
  }

  // Song selection
  const selectSong = (song) => {
    setSelectedSong(song)
    setShowSearch(false)
    setCurrentTime(0)
    setCurrentLyricIndex(0)
    setIsPlaying(false)
    toast.success(`"${song.title}" selected`)
  }

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Seek functionality
  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

// Recording functionality
  const toggleRecording = async () => {
    if (!selectedSong) {
      toast.error("Please select a song first")
      return
    }

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      toast.success("Recording stopped")
    } else {
      // Start recording
      try {
        // Check if MediaRecorder is available
        if (typeof MediaRecorder === 'undefined') {
          toast.error("Recording is not supported in this browser")
          return
        }

        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Microphone access is not supported in this browser")
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        // Check if MediaRecorder supports the stream
        if (!MediaRecorder.isTypeSupported('audio/webm') && !MediaRecorder.isTypeSupported('audio/wav')) {
          toast.error("Audio recording format not supported")
          stream.getTracks().forEach(track => track.stop())
          return
        }

        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/wav'
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
        chunksRef.current = []

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const url = URL.createObjectURL(blob)
          setRecordingData({
            url,
            blob,
            songId: selectedSong.id,
            duration: currentTime
          })
          setShowShare(true)
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorderRef.current.onerror = (event) => {
          console.error('MediaRecorder error:', event.error)
          toast.error("Recording error occurred")
          setIsRecording(false)
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorderRef.current.start()
        setIsRecording(true)
        toast.success("Recording started")
      } catch (error) {
        console.error('Recording error:', error)
        if (error.name === 'NotAllowedError') {
          toast.error("Microphone access denied. Please allow microphone access and try again.")
        } else if (error.name === 'NotFoundError') {
          toast.error("No microphone found. Please connect a microphone and try again.")
        } else if (error.name === 'NotSupportedError') {
          toast.error("Recording is not supported in this browser")
        } else {
          toast.error("Failed to access microphone")
        }
      }
    }
  }

  // Save performance
  const savePerformance = async () => {
    if (!recordingData) return

    try {
      const performance = {
        userId: "user123", // In real app, this would come from auth
        songId: recordingData.songId,
        recordingUrl: recordingData.url,
        duration: recordingData.duration,
        effects: [],
        sharedPlatforms: [],
        createdAt: new Date().toISOString()
      }

      await performanceService.create(performance)
      toast.success("Performance saved successfully!")
      setShowShare(false)
      setRecordingData(null)
    } catch (error) {
      toast.error("Failed to save performance")
    }
  }

  // Font size options
  const fontSizeClasses = {
    small: 'text-lg md:text-xl',
    medium: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl'
  }

  return (
    <div className="container mx-auto">
      {/* Hidden audio element */}
      {selectedSong && (
        <audio
          ref={audioRef}
          src={selectedSong.audioUrl}
          volume={volume}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Main Karaoke Interface */}
      <div className="relative">
        {/* Lyrics Display Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-effect rounded-3xl p-6 md:p-8 mb-6"
          style={{ minHeight: '60vh' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl md:text-3xl font-heading font-bold">
                {selectedSong ? selectedSong.title : 'Select a Song to Start'}
              </h3>
              {selectedSong && (
                <span className="text-surface-300">by {selectedSong.artist}</span>
              )}
            </div>
            
            {/* Font Size Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-surface-300">Size:</span>
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    fontSize === size 
                      ? 'bg-primary text-white shadow-neon-primary' 
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }`}
                >
                  {size[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Lyrics Container */}
          <div className="relative h-96 overflow-hidden">
            {selectedSong?.lyricsData ? (
              <div className="absolute inset-0 flex flex-col justify-center">
                <div className="text-center space-y-4 scrollbar-hide">
                  {selectedSong.lyricsData.map((lyric, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0.4 }}
                      animate={{ 
                        opacity: index === currentLyricIndex ? 1 : 0.4,
                        scale: index === currentLyricIndex ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`${fontSizeClasses[fontSize]} font-medium leading-relaxed transition-all duration-300 ${
                        index === currentLyricIndex 
                          ? 'text-white text-glow' 
                          : 'text-surface-300'
                      }`}
                    >
                      {lyric.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-neon rounded-full flex items-center justify-center shadow-glow">
                    <ApperIcon name="Music" className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-xl text-surface-300 mb-4">Ready to sing?</p>
                  <button
                    onClick={() => setShowSearch(true)}
                    className="btn-primary"
                  >
                    Choose Your Song
                  </button>
</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {selectedSong && (
            <div className="mt-6">
              <div 
                className="relative h-2 bg-surface-700 rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-neon rounded-full transition-all duration-300"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-glow transition-all duration-300"
                  style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-surface-300">
                <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}</span>
                <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Floating Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="fixed bottom-6 left-4 right-4 z-50"
        >
          <div className="glass-effect rounded-2xl p-4 neon-border">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-12 h-12 bg-surface-700 hover:bg-surface-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  <ApperIcon name="Search" className="w-6 h-6" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    isPlaying 
                      ? 'bg-accent shadow-glow animate-pulse' 
                      : 'bg-primary shadow-neon-primary'
                  }`}
                >
                  <ApperIcon 
                    name={isPlaying ? 'Pause' : 'Play'} 
                    className="w-7 h-7 text-white" 
                  />
                </button>
              </div>

              {/* Center - Volume Control */}
              <div className="flex items-center space-x-3 flex-1 max-w-xs mx-6">
                <ApperIcon name="Volume2" className="w-5 h-5 text-surface-300" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-500 shadow-neon-primary animate-pulse' 
                      : 'bg-surface-700 hover:bg-surface-600'
                  }`}
                >
                  <ApperIcon 
                    name={isRecording ? 'Square' : 'Mic'} 
                    className="w-8 h-8 text-white" 
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Song Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-3xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading font-bold">Choose Your Song</h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="w-10 h-10 bg-surface-700 hover:bg-surface-600 rounded-xl flex items-center justify-center transition-all duration-300"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <ApperIcon name="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search songs or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-800 border border-surface-600 rounded-xl text-white placeholder-surface-400 focus:border-primary focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Songs Grid */}
              <div className="overflow-y-auto max-h-96 scrollbar-hide">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-400">
                    <p>Error loading songs: {error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSongs.map((song) => (
                      <motion.div
                        key={song.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => selectSong(song)}
                        className="glass-effect rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-glow group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-neon rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-neon-primary">
                            <ApperIcon name="Music" className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate">{song.title}</h4>
                            <p className="text-surface-300 text-sm truncate">{song.artist}</p>
                            <p className="text-surface-400 text-xs">
                              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Performance Modal */}
      <AnimatePresence>
        {showShare && recordingData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-3xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-neon rounded-full flex items-center justify-center shadow-glow">
                  <ApperIcon name="Mic" className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-heading font-bold mb-4">Performance Recorded!</h3>
                <p className="text-surface-300 mb-6">Your amazing performance has been recorded. Save it or share with the world!</p>
                
{/* Audio Preview */}
                <div className="bg-surface-800 rounded-xl p-4 mb-6">
                  <audio controls className="w-full">
                    <source src={recordingData.url} type={recordingData.blob?.type || 'audio/wav'} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={savePerformance}
                    className="w-full btn-primary"
                  >
                    <ApperIcon name="Save" className="w-5 h-5 mr-2" />
                    Save Performance
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowShare(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Shared to social media!")
                        setShowShare(false)
                      }}
                      className="bg-surface-700 hover:bg-surface-600 px-4 py-2 rounded-xl font-semibold transition-all duration-300"
                    >
                      <ApperIcon name="Share" className="w-5 h-5 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(90deg, #FF006E, #8338EC);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(90deg, #FF006E, #8338EC);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
        }
      `}</style>
    </div>
  )
}

export default MainFeature
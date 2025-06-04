import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: 'Mic',
      title: 'Real-time Lyrics',
      description: 'Synchronized lyrics with highlight-as-you-sing technology'
    },
    {
      icon: 'Radio',
      title: 'Record & Share',
      description: 'Capture your performances and share on social media'
    },
    {
      icon: 'Music',
      title: 'Vast Library',
      description: 'Access thousands of songs from popular platforms'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-4 md:p-6"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-neon rounded-xl flex items-center justify-center shadow-neon-primary">
              <ApperIcon name="Mic" className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-glow">
              SingSync
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm text-surface-300">
            <span>{currentTime.toLocaleDateString()}</span>
            <span className="text-accent font-semibold">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative px-4 md:px-6 py-8 md:py-12"
      >
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-glow"
          >
            Turn Your Voice Into
            <span className="block bg-gradient-neon bg-clip-text text-transparent">
              Concert Magic
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-surface-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the ultimate karaoke platform with real-time lyrics, 
            professional recording capabilities, and seamless social sharing. 
            Sing your heart out and become the star you've always dreamed of being.
          </motion.p>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="px-4 md:px-6 py-8 md:py-12"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                className="card-glass group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-neon-primary transition-all duration-300">
                    <ApperIcon name={feature.icon} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-surface-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Feature */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="px-4 md:px-6 py-8 md:py-12"
      >
        <MainFeature />
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="px-4 md:px-6 py-8 md:py-12 border-t border-surface-800"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '50K+', label: 'Songs Available' },
              { number: '125K+', label: 'Performances Recorded' },
              { number: '89%', label: 'User Satisfaction' },
              { number: '24/7', label: 'Platform Availability' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                className="glass-effect rounded-xl p-4 md:p-6"
              >
                <div className="text-2xl md:text-3xl font-heading font-bold text-accent mb-2 text-glow">
                  {stat.number}
                </div>
                <div className="text-surface-300 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="px-4 md:px-6 py-8 border-t border-surface-800"
      >
        <div className="container mx-auto text-center">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center">
                <ApperIcon name="Mic" className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-semibold">SingSync</span>
            </div>
            
            <div className="flex space-x-6 text-surface-400">
              <a href="#" className="hover:text-primary transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors duration-300">
                Support
              </a>
            </div>
            
            <div className="text-surface-400 text-sm">
              © 2024 SingSync. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home
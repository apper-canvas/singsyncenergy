import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-neon rounded-full flex items-center justify-center shadow-neon-primary mb-6">
            <ApperIcon name="MicOff" className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-8xl md:text-9xl font-heading font-bold text-glow mb-4">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
            Song Not Found
          </h2>
          
          <p className="text-surface-300 text-lg mb-8 max-w-md mx-auto">
            Looks like this page hit a wrong note. Let's get you back to the main stage!
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
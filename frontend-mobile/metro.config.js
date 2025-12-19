const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const sharedPath = path.resolve(projectRoot, '..', 'shared')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [sharedPath]

module.exports = config

require 'optparse'
require './housemap.rb'

options = ARGV.getopts('o:', 'unstage', 'framerate:')

housemap = Housemap.new
housemap.framerate = options['framerate'].to_i if options['framerate']
housemap.load_file
housemap.create_map
housemap.save(options['o'] || 'data.json')

#puts housemap.map
housemap.unstage_images if options['unstage']

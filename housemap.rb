require 'json'
require 'optparse'
require 'set'
require 'fileutils'

class Housemap
  attr_reader :map
  attr_accessor :framerate, :space_resolution, :time_resolution, :stride, :angle_margin

  def initialize
    @route = []
    @map = []
    @config = {}
    @framerate = 2
    @frame_offset = 3

    # Configure parameters depending on your environment
    @space_resolution = 0.1
    @stride = 1.25
    @angle_margin = 10 # degree

    @direction_vectors = { north: [0, -1],
                           south: [0, 1],
                           east: [1, 0],
                           west: [-1, 0] }
  end

  def load_file
    @route = JSON.parse(File.read('route.json'))
    @config = JSON.parse(File.read('config.json'))
  end

  def pick_points
    id = 1
    @route.each_with_index do |position, i|
      pos = position
      pos['id'] = id
      scene_name = zeropadding(pos['ts'] * @framerate + @frame_offset, 4)
      pos['scene'] = "scene_#{scene_name}"

      if i == 0
        @map.push(pos)
        id += 1
      else
        prev_pos = @route[i - 1]
        from = prev_pos['ts'].to_i + 1
        to = pos['ts'].to_i
        delta = 1.0 / @framerate
        (from..to).step(delta).each_with_index do |ts, j|
          p = {}
          p['id'] = id
          p['ts'] = ts
          p['x'] = interpolate(prev_pos['x'], pos['x'], pos['ts'] - prev_pos['ts'], (j + 1) * delta)
          p['y'] = interpolate(prev_pos['y'], pos['y'], pos['ts'] - prev_pos['ts'], (j + 1) * delta)
          p['zone'] = pos['zone']
          scene_name = zeropadding((ts * @framerate).round + @frame_offset, 4)
          p['scene'] = "scene_#{scene_name}"

          neighbors = find_nearest_neighbors(p, @space_resolution) & find_same_zone_points(p)

          if neighbors.size == 0
            @map.push(p)
            id += 1
          end
        end
      end
    end
  end

  def create_links
    @map.each do |point|
      link_north = find_north_nearest_neighbor(point)
      link_south = find_south_nearest_neighbor(point)
      link_east = find_east_nearest_neighbor(point)
      link_west = find_west_nearest_neighbor(point)
      point['links'] = { 'north' => link_north ? link_north['id'] : nil,
                         'south' => link_south ? link_south['id'] : nil,
                         'east' => link_east ? link_east['id'] : nil,
                         'west' => link_west ? link_west['id'] : nil }
    end
  end

  def create_map
    pick_points
    create_links
  end

  def save(outputfile)
    data = { config: @config, map: @map }
    File.write(outputfile, data.to_json)
  end

  def find_point_by_scene_no(scene_no)
    @map.find { |p| p['scene'] == "scene_#{scene_no}" }
  end

  def find_same_zone_points(point)
    @map.select { |p| point['id'] != p['id'] && same_zone?(point, p) }
  end

  def find_same_direction_points(point, vector, margin = @angle_margin)
    @map.select { |p| point['id'] != p['id'] && same_direction?(point, p, vector, margin) }
  end

  def find_nearest_neighbors(point, th = @stride)
    @map.select { |p| point['id'] != p['id'] && within_stride?(point, p, th) }
  end

  def unstage_images
    puts 'unstaging...'
    all = Dir.glob("generated/*.jpg")
    stages = @map.map { |m| 'generated/' + to_filename(m['scene']) }
    unstages = Set.new(all) - Set.new(stages)
    FileUtils.mkdir_p('generated/unstage')
    FileUtils.mv(unstages.to_a, 'generated/unstage/') if unstages.size > 0
    puts "unstaged #{unstages.size} images"
  end

  private 

  def zeropadding(num, digits)
    ('0' * digits + num.to_s)[-digits..-1]
  end

  def interpolate(from, to, steps, i)
    d = to - from
    d_step = d.to_f / steps
    from + d_step * i
  end

  def degree_to_radian(degree)
    Math::PI * 2.0 * degree / 360.0
  end

  def inner_product(v1, v2)
    v1[0] * v2[0] + v1[1] * v2[1]
  end

  def normalize(v)
    norm = Math.sqrt(v[0] * v[0] + v[1] * v[1])
    [v[0] / norm, v[1] / norm]
  end

  def within_stride?(point1, point2, th)
    (point1['x'] - point2['x']).abs < th && (point1['y'] - point2['y']).abs < th
  end

  def same_zone?(point1, point2)
    Set.new(point1['zone']).intersect?(Set.new(point2['zone']))
  end

  def same_direction?(point1, point2, vector, margin)
    v = [point2['x'] - point1['x'], point2['y'] - point1['y']]
    dot = inner_product(vector, normalize(v))
    dot > Math.cos(degree_to_radian(margin))
  end

  def distance(point1, point2)
    (point1['x'] - point2['x']).abs + (point1['y'] - point2['y']).abs
  end

  def find_north_nearest_neighbor(point)
    candidates = find_same_direction_points(point, @direction_vectors[:north]) & find_nearest_neighbors(point) & find_same_zone_points(point)
    candidates.min_by { |p| distance(p, point) }
  end

  def find_south_nearest_neighbor(point)
    candidates = find_same_direction_points(point, @direction_vectors[:south]) & find_nearest_neighbors(point) & find_same_zone_points(point)
    candidates.min_by { |p| distance(p, point) }
  end

  def find_east_nearest_neighbor(point)
    candidates = find_same_direction_points(point, @direction_vectors[:east]) & find_nearest_neighbors(point) & find_same_zone_points(point)
    candidates.min_by { |p| distance(p, point) }
  end

  def find_west_nearest_neighbor(point)
    candidates = find_same_direction_points(point, @direction_vectors[:west]) & find_nearest_neighbors(point) & find_same_zone_points(point)
    candidates.min_by { |p| distance(p, point) }
  end

  def to_filename(scene_name)
    scene_name.gsub("scene_", "") + ".jpg"
  end
end

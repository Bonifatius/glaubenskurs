require 'flickraw'
require 'json'

FLICKR_CACHE_DIR = File.expand_path('../../_cache/flickr', __FILE__)
FileUtils.mkdir_p(FLICKR_CACHE_DIR)

module Jekyll
  module Flickr
    def self.initialize
      FlickRaw.api_key = config['api_key']
      FlickRaw.shared_secret = config['shared_secret']
    end

    def self.config
      @config ||= Jekyll.configuration({})['flickr'] || {}
    end


    class APIWrapper
      def []=(key)
        data[key]
      end

      def method_missing(method_sym, *args, &block)
        if data.key?(method_sym.to_s)
          data[method_sym.to_s]
        else
          super
        end
      end

      def respond_to_missing?(method_sym, include_private = false)
        data.key?(method_sym.to_s) || super
      end

      def client
        @client ||= APIClient.new
      end
    end

    class APIClient
      def getPhotoInfo photo_id
        cache('photo', photo_id) do
          flickr.photos.getInfo photo_id: photo_id
        end
      end

      def getPhotosetInfo photoset_id
        cache('album', photoset_id) do
          flickr.photosets.getInfo photoset_id: photoset_id
        end
      end

      def getPhotos photoset_id
        cache('photos', photoset_id) do
          flickr.photosets.getPhotos photoset_id: photoset_id
        end
      end

      def cache(type, id)
        if defined?(FLICKR_CACHE_DIR)
          path = File.join(FLICKR_CACHE_DIR, "#{type}_#{id}.yml")
          if File.exists?(path)
            data = YAML::load(File.read(path))
          else
            puts "Retrieving data from API for #{type} #{id}..."
            data = yield
            File.open(path, "w") do |f|
              f.write(YAML::dump(data))
            end
          end
        else
          data = yield
        end

        return data
      end
    end

    class Photo < APIWrapper
      PHOTO_SIZES = { square: 'q', thumbnail: 't', small: 'm', small320: 'n', medium: 'z', large: 'b', large1600: 'h', original: 'o'}

      attr_reader :photo_id

      def initialize(photo_id)
        if photo_id.is_a? String
          @photo_id = photo_id
        else
          @data = photo_id
          @photo_id = data['photo_id']
        end
      end

      def data
        @data ||= client.getPhotoInfo photo_id
      end

      def url(size = :medium)
        size = PHOTO_SIZES[size] if PHOTO_SIZES.key? size

        "https://farm#{farm}.staticflickr.com/#{server}/#{id}_#{secret}_#{size}.jpg"
      end
    end

    class PhotoSet < APIWrapper

      attr_reader :photoset_id

      def initialize(photoset_id)
        @photoset_id = photoset_id
      end

      def data
        @data ||= client.getPhotosetInfo photoset_id
      end

      def photos
        @photos ||= begin
            raw = client.getPhotos photoset_id
            raw['photo'].lazy.map do | photo_raw |
              Photo.new photo_raw
            end
        end
      end

    end

    class PhotoTag < Liquid::Tag
      include Jekyll::LiquidExtensions

      attr_reader :photo_id, :photo

      def initialize(tag_name, photo_id, token)
        super

        Jekyll::Flickr.initialize

        @photo_id = photo_id.strip
      end

      def render(context)
        if @photo_id =~ /([\w]+\.[\w]+)/i
          @photo_id = lookup_variable(context, set_id)
        end

        @photo = Jekyll::Flickr::Photo.new @photo_id.strip

        %Q[<img alt="#{photo.title}" src="#{photo.url :large}" class="image image-flickr image-large" />]
      end
    end

    class PhotoSetTag < Liquid::Tag
      include Jekyll::LiquidExtensions

      attr_reader :set_id, :set

      def initialize(tag_name, set_id, token)
        super

        Jekyll::Flickr.initialize

        @set_id = set_id.strip
      end

      def render(context)
        if set_id =~ /([\w]+\.[\w]+)/i
          @set_id = lookup_variable(context, set_id)
        end

        @set = Jekyll::Flickr::PhotoSet.new set_id
        puts "loaded album ##{set_id} #{set.title} with #{set.photos.count} photos"

        html = '<div class="gallery">'
        set.photos.each do | photo |
          html << %Q[<a href="#{ photo.url :large }"><img alt="#{photo.title}" src="#{photo.url :small320}" class="image image-flickr image-small" /></a>]
        end
        html << '</div>'
        html
      end
    end
  end
end

Liquid::Template.register_tag('flickr_photo', Jekyll::Flickr::PhotoTag)
Liquid::Template.register_tag('flickr_gallery', Jekyll::Flickr::PhotoSetTag)

# Hooks are not yet released
#Jekyll::Hooks.register :site, :pre_render do |site|
#  Jekyll::Flickr.initialize
#end

module FlickRaw
  class Response
    def key?(key)
      @h.key? key
    end
  end
end

# https://farm3.staticflickr.com/2901/14514238987_403a7dd969_h_d.jpg
# https://farm3.staticflickr.com/2901/14514238987_403a7dd969_b.jpg

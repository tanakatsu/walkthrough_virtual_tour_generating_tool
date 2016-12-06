# Walkthrough virtual tour generating tool

You can create a walkthrough virtual tour from panoramic video.

## Requirements

- ruby
- ffmpeg
- [krpano](http://krpano.com/download/)
- panoramic video (Equirectangular format)

## How to use
### Shooting panoramic video

You need to shoot a panoramic video.
There are several devices that can take a panoramic video. 
RICOH's [Theta S](https://theta360.com/ja/about/theta/s.html) is one of devices (I used this).
For Theta S, you have to convert videos to generate Equrectangular video using Theta's PC application which is available from [here](https://theta360.com/ja/about/application/pc.html).

##### [Important]
When taking video, you have to **keep camera angle fixed** (no rotation). You will realize that this is not easy but you have to do this for now... This should be improved. 

### Download krpano

[Krpano](http://krpano.com) is a panorama viewer application. It also provides a tool to generate a virtual tour. Download site is [here](http://krpano.com/download/).
Download krpano and place it in root directory.

Directory structure should be like this.

```
  create_vtour.sh
  krpano-1.19-pr8/
                 krpanotools
                 templates/
```


### Edit route

You have to write a route description file.

Sample file is like this.

```
[
  {"ts": 2, "x": 6.3, "y": 4.5, "zone": ["1a"]},
  {"ts": 8, "x": 4.3, "y": 4.5, "zone": ["1a"]},
  {"ts": 12, "x": 4.3, "y": 6.1, "zone": ["1a"]},
  {"ts": 20, "x": 6.0, "y": 6.1, "zone": []},
  {"ts": 32, "x": 1.0, "y": 6.1, "zone": ["1a", "1b", "1c"]},
  {"ts": 37, "x": 1.0, "y": 8.3, "zone": []},
  {"ts": 58, "x": 1.0, "y": 1.6, "zone": ["1c"]},
  {"ts": 70, "x": 1.0, "y": 5.4, "zone": []},
]  
```

### Adjust parameters

Edit `config.json` to set initial viewing direction. 
You may need several times trials to do right.

### Generate content

Open create\_vtour.sh in your editor and edit  `krpanotools_dir` value.

Then,

```
$ ./create_vtour.sh your-video.mp4
```

Contents will be generated in `generated/vtour/` directory.

If you get a wrong initial view direction in a virtual tour, edit `config.json` and recreate a tour.

### Sample content

You can try this tool with sample video.

```
$ cp config.sample.json config.json
$ cp route.sample.json route.json
$ ./create_vtour.sh sample-video.mp4
```
Start krpano Testing server (`tour_testingserver.exe` or `tour_testingserver_macos`). 


## Showcase

I've created [a virtual tour](https://momonoki.blob.core.windows.net/content/tsujido-vtour/tour.html
) using this tool.


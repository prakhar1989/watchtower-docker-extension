# WatchTowerr

A Docker extension for automating Docker container base image updates. 

Built on the top of excellent tool - https://github.com/containrrr/watchtower

![i1](screenshots/1.png)
![i2](screenshots/2.png)

## Installation

Make sure your Docker desktop supports extensions. Currently, this extension is not yet available on the marketplace so the best way to try it out to is to build and install it locally.

```
$ git clone https://github.com/prakhar1989/watchtowerr.git
$ cd dive-in
$ make build-extension
$ make install-extension
```

## Development

Go through [the official docs](https://docs.docker.com/desktop/extensions-sdk/quickstart/) to understand the basic setting up of the Docker extension.

Useful commands for setting up debugging

```
$ docker extension dev debug prakhar1989/watchtowerr
$ docker extension dev ui-source prakhar1989/watchtowerr http://localhost:3000
```

Make sure you run `npm run start` in the `ui/` folder.
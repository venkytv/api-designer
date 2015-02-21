# api-designer

Docker image of the Mulesoft API Designer.

## Prerequisites

1. [Docker](https://www.docker.com/) (Or Boot2Docker for [Mac](https://docs.docker.com/installation/mac/) or [Windows](https://docs.docker.com/installation/windows/))

## Usage

To launch API Designer the first time:

    $ docker run -d -p 9013:9013 --name=api-designer venkytv/api-designer

On subsequent runs:

    $ docker start api-designer

To stop the application:

    $ docker stop api-designer

Accessing it in your browser:

* On Linux, browse to [http://localhost:9013](http://localhost:9013)
* On Mac and Windows, use http://192.168.59.103:9013

_In case you are are unable to access the api-console on Mac or Windows, make
sure that the VM IP has not changed using the `boot2docker` command._
```
    $ boot2docker ip
    192.168.59.103
```

## Debugging

You can examine the logs on a running instance using `docker logs`:

    $ docker logs api-designer

To launch a shell within the running container:

    $ docker exec -it api-designer bash

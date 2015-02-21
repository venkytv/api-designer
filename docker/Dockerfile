FROM ubuntu
MAINTAINER Venky <venky@duh-uh.com>

RUN apt-get update \
    && apt-get install -y \
        git \
        nodejs-legacy \
        npm \
        ruby

# Install Bower and Grunt
RUN npm install --silent -g bower grunt-cli

# Clone the Covisint api-console fork
RUN git clone https://github.com/venkytv/api-designer.git \
    && cd api-designer \
    && git checkout c667878fef91cc7944f7aeddf4176ed0fd514cc7

WORKDIR /api-designer

RUN npm install --silent
RUN bower install --allow-root

# Install webdriver
RUN node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update

# api-designer listens on port 9013
EXPOSE 9013

CMD [ "grunt", "server" ]

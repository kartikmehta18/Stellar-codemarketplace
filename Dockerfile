FROM node

# ENV

# RUN mkdir -p stellarcodemarket-65-main

# Create and set the working directory
WORKDIR /stellarcodemarket-65-main

COPY . /stellarcodemarket-65-main   

# Install the dependencies
RUN npm install

CMD ["npm","run" ,"dev"]
#docker buildx build -t stellarcodemarket:1.0 .





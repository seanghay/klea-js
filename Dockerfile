FROM node:20


WORKDIR /app
COPY package*.json ./

RUN npm ci

COPY . .
ADD https://huggingface.co/spaces/seanghay/KLEA/resolve/main/G_60000.int8.onnx .
ADD https://huggingface.co/spaces/seanghay/KLEA/resolve/main/g2p.fst .

ENTRYPOINT [ "npm", "start" ]

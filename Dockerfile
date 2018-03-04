FROM node:9.4.0

ENV TIMER_HOME /timer

COPY package*.json ${TIMER_HOME}/

WORKDIR $TIMER_HOME

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

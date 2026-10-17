FROM node:20-alpine AS build

LABEL authors="shobhit"

WORKDIR /frontend

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=http://localhost:3050
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- serve stage ----
FROM node:20-alpine
WORKDIR /frontend

RUN npm install -g serve
COPY --from=build /frontend/dist ./dist

USER node
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
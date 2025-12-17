FROM node:24-alpine3.22

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

<<<<<<< HEAD
=======

>>>>>>> 5dfb98a080428a5056aff175ad118db4bf178d8d
EXPOSE 3000

CMD ["sh", "-c", "pnpm dlx prisma generate && pnpm dlx prisma db push --accept-data-loss && pnpm prisma db seed && pnpm start"]
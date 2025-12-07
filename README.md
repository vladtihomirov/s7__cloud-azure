# s7__cloud-azure

## How to run app
1. npm install
2. npm run prisma:generate
3. Run services:
   - `npm run start:user` - User service
   - `npm run start:order` - Order service
   - `npm run start:clothing` - Clothing service
   - `npm run start:return` - Return service

## Check table content
1. Run app that you are interested in and open `http://localhost:${APP_PORT}/api`
2. You will see a swagger and the first endpoint should be `temp-...`
3. Run it and see the result of db rows in JSON format

Alternatively, you can connect directly to DB and check

## Check schema
I am using ORM called  [Prisma](https://www.prisma.io/).
There is supporting plugin for Nest.js: https://docs.nestjs.com/recipes/prisma
File location of DB schema: `prisma/schema.prisma`

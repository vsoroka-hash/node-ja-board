# Announcements API (Express + Prisma)

REST API для дошки оголошень з автентифікацією, безпекою, логуванням та завантаженням фото в Cloudinary.

## Основний функціонал

- `GET /announcements` — список з пошуком, сортуванням, пагінацією
- `GET /announcements/:id` — одне оголошення
- `POST /announcements` — створення оголошення (JWT, `multipart/form-data`, опційне фото)
- `PATCH /announcements/:id` — часткове оновлення (JWT, `multipart/form-data`, опційне фото)
- `DELETE /announcements/:id` — видалення (JWT)
- `POST /auth/register` — реєстрація
- `POST /auth/login` — отримання JWT токена

## Безпека та інфраструктура

- `helmet` для безпечних HTTP заголовків
- `cors` з allowlist через `ALLOWED_ORIGINS`
- `express-rate-limit` на `/auth/*` (10 запитів / 15 хвилин)
- `pino` + `pino-http` для логів
- `multer` для тимчасового збереження файлів у `uploads/`
- `cloudinary` для завантаження фото та збереження `imageUrl` у БД

## Налаштування

1. Встановити залежності:

```bash
npm install
```

2. Створити `.env` на основі `.env.example`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_long_random_secret"
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

3. Застосувати міграції:

```bash
npm run prisma:migrate
```

4. Запустити сервер:

```bash
npm run dev
```

## Документація API

- Swagger UI: `http://localhost:3000/api-docs`
- Готові приклади запитів: `requests.http`

## Додатково

- Prisma Studio:

```bash
npm run prisma:studio
```

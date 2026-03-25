import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// 1. Головна сторінка GET /
app.get('/', async (req, res, next) => {
  try {
    const { search = '', sort = 'newest', page = '1' } = req.query;
    const normalizedSearch = String(search).trim();
    let where = {};
    const orderBy = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const perPage = 10;
    const pageNum = Math.max(Number(page) || 1, 1);
    const skip = (pageNum - 1) * perPage;

    if (normalizedSearch) {
      const matchedRows = await prisma.$queryRaw`
        SELECT id
        FROM Announcement
        WHERE LOWER(title) LIKE LOWER(${`%${normalizedSearch}%`})
      `;
      const matchedIds = matchedRows.map((row) => row.id);
      where = { id: { in: matchedIds.length ? matchedIds : [-1] } };
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({ where, orderBy, skip, take: perPage }),
      prisma.announcement.count({ where })
    ]);

    const totalPages = Math.ceil(total / perPage);

    res.render('index', {
      announcements,
      search: normalizedSearch,
      sort,
      page: pageNum,
      totalPages,
      hasPrev: pageNum > 1,
      hasNext: pageNum < totalPages
    });
  } catch (err) {
    next(err);
  }
});

// 2. Форма створення GET /announcements
app.get('/announcements', (req, res) => {
  res.render('new', { errors: {}, data: null });
});

// 3. Створення оголошення POST /announcements
app.post('/announcements', async (req, res, next) => {
  try {
    const { title, description, price, category, contactInfo } = req.body;
    const errors = {};

    const trimmedTitle = title?.trim();
    const trimmedDesc = description?.trim();
    const trimmedContact = contactInfo?.trim();

    if (!trimmedTitle || trimmedTitle.length < 5 || trimmedTitle.length > 100) {
      errors.title = 'Назва має бути від 5 до 100 символів';
    }
    if (!trimmedDesc || trimmedDesc.length < 10) {
      errors.description = 'Опис має бути не менше 10 символів';
    }
    if (!['sale', 'service', 'job', 'other'].includes(category)) {
      errors.category = 'Оберіть валідну категорію';
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      errors.price = 'Ціна має бути додатним числом';
    }
    if (!trimmedContact || trimmedContact.length < 5) {
      errors.contactInfo = 'Контакти мають бути не менше 5 символів';
    }

    if (Object.keys(errors).length > 0) {
      return res.render('new', { errors, data: req.body });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: trimmedTitle,
        description: trimmedDesc,
        price: Number(price),
        category,
        contactInfo: trimmedContact
      }
    });

    res.redirect(`/announcements/${announcement.id}`);
  } catch (err) {
    next(err);
  }
});

// 4. Перегляд оголошення GET /announcements/:id
app.get('/announcements/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(404).render('404', { message: 'Невалідний ID оголошення' });
    }

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).render('404', { message: 'Оголошення не знайдено' });
    }

    res.render('announcement', { announcement });
  } catch (err) {
    next(err);
  }
});

// 5. Видалення оголошення DELETE /announcements/:id
app.delete('/announcements/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(404).render('404', { message: 'Невалідний ID оголошення' });
    }

    await prisma.announcement.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { message: 'Сторінку не знайдено' });
});

// Error Handler (500)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Внутрішня помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

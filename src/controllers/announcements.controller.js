import prisma from '../../prisma/client.js';

const PER_PAGE = 10;

export async function getAnnouncements(req, res) {
  const { search = '', sort = 'newest', page = 1 } = req.query;
  const normalizedSearch = String(search).trim();
  const pageNum = Math.max(Number(page) || 1, 1);
  const orderBy = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
  const skip = (pageNum - 1) * PER_PAGE;

  let where = {};

  // SQLite + Prisma does not support `mode: 'insensitive'` on contains, so use SQL LOWER.
  if (normalizedSearch) {
    const rows = await prisma.$queryRaw`
      SELECT id
      FROM Announcement
      WHERE LOWER(title) LIKE LOWER(${`%${normalizedSearch}%`})
    `;

    const matchedIds = rows.map((row) => row.id);
    where = { id: { in: matchedIds.length ? matchedIds : [-1] } };
  }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({ where, orderBy, skip, take: PER_PAGE }),
    prisma.announcement.count({ where })
  ]);

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  return res.json({
    data,
    pagination: {
      total,
      page: pageNum,
      totalPages,
      perPage: PER_PAGE
    }
  });
}

export async function getAnnouncementById(req, res) {
  const id = Number(req.params.id);
  const announcement = await prisma.announcement.findUniqueOrThrow({ where: { id } });

  return res.json(announcement);
}

export async function createAnnouncement(req, res) {
  const { title, description, price, category, contactInfo } = req.body;

  const created = await prisma.announcement.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      contactInfo: contactInfo.trim()
    }
  });

  return res.status(201).json(created);
}

export async function patchAnnouncement(req, res) {
  const id = Number(req.params.id);
  const data = { ...req.body };

  if (typeof data.title === 'string') data.title = data.title.trim();
  if (typeof data.description === 'string') data.description = data.description.trim();
  if (typeof data.contactInfo === 'string') data.contactInfo = data.contactInfo.trim();
  if (data.price !== undefined) data.price = Number(data.price);

  const updated = await prisma.announcement.update({
    where: { id },
    data
  });

  return res.json(updated);
}

export async function deleteAnnouncement(req, res) {
  const id = Number(req.params.id);
  await prisma.announcement.delete({ where: { id } });

  return res.status(204).end();
}

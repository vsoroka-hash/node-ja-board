import prisma from '../../prisma/client.js';
import fs from 'node:fs/promises';
import cloudinary, { isCloudinaryConfigured } from '../lib/cloudinary.js';
import logger from '../logger.js';

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
  let imageUrl;

  if (req.file) {
    if (!isCloudinaryConfigured()) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(500).json({ message: 'Cloudinary is not configured' });
    }

    try {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: 'announcements'
      });
      imageUrl = upload.secure_url;
      logger.info({ path: req.file.path, imageUrl }, 'Announcement image uploaded');
    } catch (error) {
      logger.error({ err: error }, 'Cloudinary upload failed');
      return res.status(502).json({ message: 'Image upload failed' });
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }

  const created = await prisma.announcement.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      contactInfo: contactInfo.trim(),
      imageUrl,
      userId: req.user?.id
    }
  });

  logger.info({ announcementId: created.id, userId: req.user?.id }, 'Announcement created');

  return res.status(201).json(created);
}

export async function patchAnnouncement(req, res) {
  const id = Number(req.params.id);
  const data = { ...req.body };
  // `image` can appear in multipart text fields, but it is not a Prisma model field.
  delete data.image;

  if (typeof data.title === 'string') data.title = data.title.trim();
  if (typeof data.description === 'string') data.description = data.description.trim();
  if (typeof data.contactInfo === 'string') data.contactInfo = data.contactInfo.trim();
  if (data.price !== undefined) data.price = Number(data.price);

  if (req.file) {
    if (!isCloudinaryConfigured()) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(500).json({ message: 'Cloudinary is not configured' });
    }

    try {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: 'announcements'
      });
      data.imageUrl = upload.secure_url;
      logger.info({ path: req.file.path, imageUrl: data.imageUrl }, 'Announcement image uploaded');
    } catch (error) {
      logger.error({ err: error }, 'Cloudinary upload failed');
      return res.status(502).json({ message: 'Image upload failed' });
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }

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

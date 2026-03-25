import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  patchAnnouncement
} from '../controllers/announcements.controller.js';
import {
  announcementIdValidator,
  createAnnouncementValidator,
  listAnnouncementsValidator,
  patchAnnouncementValidator
} from '../validators/announcements.validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Announcements
 *     description: REST API for announcements board
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: Get announcements list with search, sorting and pagination
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title substring (case-insensitive)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: Announcements list with pagination metadata
 *       400:
 *         description: Validation error
 */
router.get('/', listAnnouncementsValidator, getAnnouncements);

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     tags: [Announcements]
 *     summary: Get one announcement by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcement object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Announcement not found
 */
router.get('/:id', announcementIdValidator, getAnnouncementById);

/**
 * @swagger
 * /announcements:
 *   post:
 *     tags: [Announcements]
 *     summary: Create a new announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, price, category, contactInfo]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *               price:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       201:
 *         description: Created announcement
 *       400:
 *         description: Validation error
 */
router.post('/', createAnnouncementValidator, createAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     tags: [Announcements]
 *     summary: Partially update an announcement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *               price:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       200:
 *         description: Updated announcement
 *       400:
 *         description: Validation error
 *       404:
 *         description: Announcement not found
 */
router.patch('/:id', patchAnnouncementValidator, patchAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     tags: [Announcements]
 *     summary: Delete an announcement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted successfully (no content)
 *       400:
 *         description: Validation error
 *       404:
 *         description: Announcement not found
 */
router.delete('/:id', announcementIdValidator, deleteAnnouncement);

export default router;

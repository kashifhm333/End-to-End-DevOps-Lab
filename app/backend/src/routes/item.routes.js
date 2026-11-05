import { Router } from 'express';
import { getItems, createItem, deleteItem } from '../controllers/item.controller.js';

const router = Router();

// GET /api/items - Retrieve all records from MongoDB
router.get('/items', getItems);

// POST /api/items - Create a new record in MongoDB
router.post('/items', createItem);

// DELETE /api/items/:id - Remove a record from MongoDB
router.delete('/items/:id', deleteItem);

export default router;


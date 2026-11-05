import mongoose from 'mongoose';
import Item from '../models/item.model.js';

/**
 * Ensures MongoDB is connected before attempting DB operations.
 * Returns true if connected, false otherwise.
 */
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

/**
 * Controller to list all items from MongoDB.
 */
export const getItems = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database unavailable: MongoDB is not connected. Ensure MongoDB is running and MONGODB_URI is properly configured.',
          status: 503
        }
      });
    }

    const items = await Item.find().sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to create a new item in MongoDB.
 */
export const createItem = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database unavailable: MongoDB is not connected. Ensure MongoDB is running and MONGODB_URI is properly configured.',
          status: 503
        }
      });
    }

    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error: Title is required and must not be empty.',
          status: 400
        }
      });
    }

    const newItem = await Item.create({
      title: title.trim(),
      description: description ? String(description).trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Record successfully saved to MongoDB',
      data: newItem
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to delete an item from MongoDB by ID.
 */
export const deleteItem = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database unavailable: MongoDB is not connected. Ensure MongoDB is running and MONGODB_URI is properly configured.',
          status: 503
        }
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid item ID format',
          status: 400
        }
      });
    }

    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in MongoDB',
          status: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Record deleted from MongoDB',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
};


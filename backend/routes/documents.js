const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Create new document
router.post('/', auth, async (req, res) => {
  try {
    const { title, language, content } = req.body;
    const document = new Document({
      title,
      language,
      content,
      owner: req.user.userId
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
});

// Get all documents for a user
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.userId },
        { collaborators: req.user.userId },
        { isPublic: true }
      ]
    }).populate('owner', 'username');
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { collaborators: req.user.userId },
        { isPublic: true }
      ]
    }).populate('owner', 'username');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

// Update document
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, language } = req.body;
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { collaborators: req.user.userId }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Save current version
    document.versions.push({
      content: document.content,
      author: req.user.userId
    });

    // Update document
    document.content = content;
    if (language) document.language = language;
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.collaborators.includes(userId)) {
      document.collaborators.push(userId);
      await document.save();
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error adding collaborator', error: error.message });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

module.exports = router; 
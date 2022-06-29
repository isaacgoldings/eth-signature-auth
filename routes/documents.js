const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// Console log posts to view

//Get all posts
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find();
        res.json(documents);
    } catch (error) {
        res.json({ message: err});
}})

module.exports = router;
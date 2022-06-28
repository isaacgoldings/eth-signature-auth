const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Console log users to view

//Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.json({ message: err});
}})


router.post('/', async (req, res) => {
    const user = new User({
        title: req.body.title,
        description: req.body.description,
        signatory: req.body.signatory
    });
    try{
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
        res.json({ message: err});
    }
});

// Get specific users
router.get('/:userId', async (req, res) => {
    // console.log(req.params.userId);
    try {
        const user = await User.findById(req.params.userId);
        res.json(user);
    } catch (error) {
        res.json({ message: err});
    }
});

// delete
router.delete('/:userId', async (req, res) => {
    try {
        const removedUser = await User.remove({_id: req.params.userId});
        res.json(removedUser);
    } catch (error) {
        res.json({ message: err});
    }
});

router.patch('/:userId', async (req, res) => {
    try {
        const updatedUser = await User.updateOne(
            {_id: req.params.userId},
            {$set: { title: req.body.title}},
            {$set: { signatory: req.body.signatory}},
        );
        res.json(updatedUser);
    } catch (error) {
        res.json({ message: err});
    }
})
module.exports = router;
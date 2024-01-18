const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');



// Route 1 : Get all notes using get: "/api/notes/getuser", login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Note.find({ user: req.user.id });

        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }


});
// Route 2 : Add a new Note using post: "/api/notes/addnote", login required

router.post('/addnote', fetchuser, [
    body('title', ' Enter a valid title').isLength({ min: 3 }),
    body('description', 'description must contain at least 5 cherectors').isLength({ min: 5 }),
], async (req, res) => {

    try {



        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()

        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }

});

// Route 3 : update an existing Note using put: "/api/notes/updatenote", login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it

        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(400).send("Not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }

});


// Route 4 : Delete an existing Note using Delete: "/api/notes/deletenote", login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //find the note to be delete it

        let note = await Note.findById(req.params.id);
        console.log('backendNote',note);
        if (!note) { return res.status(400).send("Not found") }

        // Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")  
    }


});

module.exports = router
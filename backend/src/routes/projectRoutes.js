const express = require('express');
const {
  createProject,
  getUserProjects,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');
const Project = require('../models/Project');

const router = express.Router();

// CRUD de proyectos
router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getUserProjects);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

// Subir imagen a un proyecto
router.post('/:id/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'tfg-portafolios' },
      async (error, result) => {
        if (error) return res.status(500).json({ error });

        const project = await Project.findOneAndUpdate(
          { _id: req.params.id, owner: req.user.id },
          { $push: { images: result.secure_url } },
          { new: true }
        );

        res.json(project);
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

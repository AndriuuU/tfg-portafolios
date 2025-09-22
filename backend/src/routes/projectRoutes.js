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

// Eliminar un proyecto (solo dueño)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await project.deleteOne();

    res.json({ message: "Proyecto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un proyecto por ID (solo dueño)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar proyecto (todos los campos + imagen)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: "No autorizado" });

    // Actualizar campos si vienen en body
    const fields = ["title", "slug", "description", "tags", "liveUrl", "repoUrl"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) project[f] = f === "tags" ? req.body[f].split(",").map(t => t.trim()) : req.body[f];
    });

    // Eliminar imagen si removeImage === "true"
    if (req.body.removeImage === "true") project.images = [];

    // Subir nueva imagen a Cloudinary si existe
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "tfg-portafolios" },
        async (error, result) => {
          if (error) return res.status(500).json({ error });
          project.images = [result.secure_url];
          await project.save();
          return res.json(project);
        }
      );
      return stream.end(req.file.buffer);
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

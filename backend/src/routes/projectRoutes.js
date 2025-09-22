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

// Editar un proyecto (solo dueño)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProject);
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

// Actualizar proyecto (título, descripción, imágenes)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Actualizar campos
    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;

    // Si se sube nueva imagen → sustituye
    if (req.file) {
      project.images = [`/uploads/${req.file.filename}`];
    }

    // Si se marca eliminar imagen
    if (req.body.removeImage === "true") {
      project.images = [];
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

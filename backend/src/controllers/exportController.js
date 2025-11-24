const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Project = require('../models/Project');

/**
 * Generar PDF del portfolio del usuario
 */
exports.exportPortfolioPDF = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener datos del usuario
    const user = await User.findById(userId).select(
      'username name email bio avatarUrl links followers'
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener proyectos del usuario
    const projects = await Project.find({ owner: userId })
      .select('title description tags images stats')
      .sort({ createdAt: -1 });

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="portfolio_${user.username}_${Date.now()}.pdf"`
    );

    // Pipe al response
    doc.pipe(res);

    // ===== HEADER CON INFORMACIÓN DEL USUARIO =====
    doc.fontSize(24).font('Helvetica-Bold').text(user.name, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(user.username, { align: 'center' });

    if (user.bio) {
      doc.fontSize(10).font('Helvetica-Oblique').text(user.bio, {
        align: 'center',
        width: 400,
      });
    }

    // Información de contacto
    doc.fontSize(9).text(`📧 ${user.email}`, { align: 'center' });
    doc.fontSize(9).text(`👥 ${user.followers?.length || 0} seguidores`, {
      align: 'center',
    });

    // Enlaces
    if (user.links && user.links.length > 0) {
      doc.fontSize(9).text('Enlaces:', { align: 'center' });
      user.links.forEach((link) => {
        doc.fontSize(8).text(`• ${link.name}: ${link.url}`, { align: 'center' });
      });
    }

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ===== SECCIÓN DE PROYECTOS =====
    if (projects.length === 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Sin proyectos');
      doc.fontSize(10).font('Helvetica').text('Este usuario no tiene proyectos aún.');
    } else {
      doc.fontSize(16).font('Helvetica-Bold').text('📊 Proyectos');
      doc.moveDown(0.5);

      projects.forEach((project, index) => {
        // Título del proyecto
        doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${project.title}`);

        // Descripción
        if (project.description) {
          doc.fontSize(10).font('Helvetica').text(project.description, {
            width: 400,
          });
        }

        // Tags
        if (project.tags && project.tags.length > 0) {
          doc.fontSize(9).text(`Tags: ${project.tags.join(', ')}`);
        }

        // Estadísticas
        if (project.stats) {
          const statsText = [
            project.stats.views ? `👀 ${project.stats.views} vistas` : '',
            project.stats.likes ? `❤️ ${project.stats.likes} likes` : '',
            project.stats.comments ? `💬 ${project.stats.comments} comentarios` : '',
          ]
            .filter(Boolean)
            .join(' • ');

          if (statsText) {
            doc.fontSize(9).text(statsText);
          }
        }

        // Espacio entre proyectos
        doc.moveDown(0.5);

        // Agregar salto de página si es necesario
        if (index < projects.length - 1) {
          const currentY = doc.y;
          if (currentY > 700) {
            doc.addPage();
          } else {
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
            doc.moveDown(0.5);
          }
        }
      });
    }

    // ===== FOOTER =====
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.fontSize(8)
      .font('Helvetica-Oblique')
      .text('Generado por TFG Portafolios', { align: 'center' });
    doc.text(`${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });

    // Finalizar documento
    doc.end();
  } catch (error) {
    console.error('Error exportPortfolioPDF:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generar PDF de un proyecto específico
 */
exports.exportProjectPDF = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Obtener proyecto
    const project = await Project.findById(projectId).populate(
      'owner',
      'name username email'
    );

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Verificar que el proyecto pertenece al usuario
    if (project.owner._id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para exportar este proyecto' });
    }

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="proyecto_${project.slug}_${Date.now()}.pdf"`
    );

    // Pipe al response
    doc.pipe(res);

    // ===== INFORMACIÓN DEL PROYECTO =====
    doc.fontSize(24).font('Helvetica-Bold').text(project.title);
    doc.fontSize(10)
      .font('Helvetica')
      .text(`Por: ${project.owner.name} (@${project.owner.username})`);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Descripción
    if (project.description) {
      doc.fontSize(12).font('Helvetica-Bold').text('Descripción');
      doc.fontSize(10).font('Helvetica').text(project.description, {
        width: 400,
      });
      doc.moveDown(0.5);
    }

    // Tags
    if (project.tags && project.tags.length > 0) {
      doc.fontSize(11).font('Helvetica-Bold').text('Categorías');
      doc.fontSize(10).text(project.tags.join(', '));
      doc.moveDown(0.5);
    }

    // Estadísticas
    doc.fontSize(11).font('Helvetica-Bold').text('Estadísticas');
    doc.fontSize(10);
    if (project.stats) {
      doc.text(`Vistas: ${project.stats.views || 0}`);
      doc.text(`Likes: ${project.stats.likes || 0}`);
      doc.text(`Comentarios: ${project.stats.comments || 0}`);
    }

    // URL
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold').text('Enlace');
    const projectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${project.slug}`;
    doc.fontSize(9).text(projectUrl, { underline: true });

    // ===== FOOTER =====
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.fontSize(8)
      .font('Helvetica-Oblique')
      .text('Generado por TFG Portafolios', { align: 'center' });
    doc.text(`${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });

    // Finalizar documento
    doc.end();
  } catch (error) {
    console.error('Error exportProjectPDF:', error);
    res.status(500).json({ error: error.message });
  }
};

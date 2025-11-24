/**
 * Componente para generar el HTML de un proyecto en formato PDF
 */

const ProjectPDFGenerator = ({ project, owner }) => {
  if (!project || !owner) return null;

  const generateHTML = () => {
    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #2d3748;
          line-height: 1.6;
          background-color: white;
        }
        
        .project-wrapper {
          max-width: 900px;
          margin: 0 auto;
          background-color: white;
        }
        
        /* HEADER */
        .header {
          text-align: center;
          padding-bottom: 30px;
          border-bottom: 3px solid #667eea;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 36px;
          margin-bottom: 15px;
          color: #1a202c;
        }
        
        .owner-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin: 15px 0;
          color: #718096;
        }
        
        .owner-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 2px solid #667eea;
        }
        
        /* IMAGES */
        .project-images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .project-image-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-inside: avoid;
        }
        
        .project-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .project-image-placeholder {
          font-size: 48px;
          color: white;
        }
        
        /* INFO CARDS */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        
        .info-card {
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          page-break-inside: avoid;
        }
        
        .info-card-label {
          font-size: 12px;
          color: #a0aec0;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .info-card-value {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }
        
        /* DESCRIPTION */
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
          margin: 30px 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .description {
          color: #4a5568;
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        
        /* TAGS */
        .tags-container {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 15px 0;
        }
        
        .tag {
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        /* LINKS */
        .links-container {
          display: flex;
          gap: 15px;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        
        .link-button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          page-break-inside: avoid;
        }
        
        .link-button.secondary {
          background: #e2e8f0;
          color: #2d3748;
          border: 2px solid #cbd5e0;
        }
        
        /* STATS */
        .stats-section {
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          page-break-inside: avoid;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 10px 0;
          font-size: 14px;
        }
        
        .stat-icon {
          font-size: 20px;
        }
        
        .stat-text {
          color: #4a5568;
        }
        
        .stat-value {
          font-weight: 700;
          color: #667eea;
        }
        
        /* FOOTER */
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #a0aec0;
          font-size: 11px;
        }
        
        @media (max-width: 600px) {
          .project-images {
            grid-template-columns: 1fr;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .links-container {
            flex-direction: column;
          }
          
          .link-button {
            display: block;
            text-align: center;
          }
        }
      </style>
    `;

    const ownerInitial = (owner.name || owner.username)
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const imagesHTML =
      project.images && project.images.length > 0
        ? project.images
            .map(
              (img) =>
                `<div class="project-image-container"><img src="${img}" alt="${project.title}" /></div>`
            )
            .join('')
        : `<div class="project-image-container"><div class="project-image-placeholder">🖼️</div></div>`;

    const tagsHTML =
      project.tags && project.tags.length > 0
        ? project.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')
        : '';

    const statsHTML =
      project.stats && (project.stats.views || project.stats.likes || project.stats.comments)
        ? `
          <div class="stats-section">
            <div class="section-title">📊 Estadísticas</div>
            ${project.stats.views ? `<div class="stat-item"><span class="stat-icon">👀</span><span class="stat-text">Vistas: <span class="stat-value">${project.stats.views}</span></span></div>` : ''}
            ${project.stats.likes ? `<div class="stat-item"><span class="stat-icon">❤️</span><span class="stat-text">Likes: <span class="stat-value">${project.stats.likes}</span></span></div>` : ''}
            ${project.stats.comments ? `<div class="stat-item"><span class="stat-icon">💬</span><span class="stat-text">Comentarios: <span class="stat-value">${project.stats.comments}</span></span></div>` : ''}
          </div>
        `
        : '';

    const linksHTML =
      project.liveUrl || project.repoUrl
        ? `<div class="links-container">
        ${project.liveUrl ? `<a href="${project.liveUrl}" class="link-button" target="_blank">🚀 Ver en vivo</a>` : ''}
        ${project.repoUrl ? `<a href="${project.repoUrl}" class="link-button secondary" target="_blank">💻 Repositorio</a>` : ''}
      </div>`
        : '';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.title}</title>
        ${styles}
      </head>
      <body>
        <div class="project-wrapper">
          <div class="header">
            <h1>${project.title}</h1>
            <div class="owner-info">
              <div class="owner-avatar">${ownerInitial}</div>
              <div>
                <div><strong>${owner.name || owner.username}</strong></div>
                <div style="color: #a0aec0; font-size: 12px;">@${owner.username}</div>
              </div>
            </div>
          </div>
          
          <div class="project-images">
            ${imagesHTML}
          </div>
          
          ${project.description ? `
            <div class="section-title">📝 Descripción</div>
            <div class="description">${project.description}</div>
          ` : ''}
          
          ${tagsHTML ? `
            <div class="section-title">🏷️ Tecnologías</div>
            <div class="tags-container">${tagsHTML}</div>
          ` : ''}
          
          ${linksHTML}
          
          ${statsHTML}
          
          <div class="footer">
            <p>Generado por TFG Portafolios • ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  return {
    generateHTML,
  };
};

export default ProjectPDFGenerator;

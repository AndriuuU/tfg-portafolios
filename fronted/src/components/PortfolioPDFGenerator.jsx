/**
 * Componente para generar el HTML del portfolio en formato PDF
 * Este componente crea un HTML bien estructurado que será exportado a PDF
 */

const PortfolioPDFGenerator = ({ user, projects }) => {
  if (!user || !projects) return null;

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
        
        .portfolio-wrapper {
          max-width: 800px;
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
        
        .header-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 20px;
          border: 4px solid #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          font-weight: bold;
        }
        
        .header h1 {
          font-size: 32px;
          margin-bottom: 8px;
          color: #1a202c;
        }
        
        .header .username {
          color: #667eea;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .header .bio {
          color: #718096;
          font-size: 14px;
          font-style: italic;
          margin-bottom: 15px;
          max-width: 600px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          font-size: 13px;
          color: #4a5568;
          margin: 15px 0;
        }
        
        .contact-info div {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .stat-badge {
          background: rgba(102, 126, 234, 0.1);
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          color: #667eea;
        }
        
        .links {
          margin-top: 15px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .links a {
          color: #667eea;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border: 1px solid #667eea;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        /* SECTION TITLES */
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
          margin: 30px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        /* PROJECTS */
        .projects-container {
          display: grid;
          gap: 20px;
        }
        
        .project-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          page-break-inside: avoid;
          background: #f7fafc;
        }
        
        .project-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          overflow: hidden;
        }
        
        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .project-content {
          padding: 20px;
        }
        
        .project-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 10px;
        }
        
        .project-description {
          color: #4a5568;
          font-size: 13px;
          margin-bottom: 12px;
          line-height: 1.6;
        }
        
        .project-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        
        .tag {
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .project-stats {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #718096;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }
        
        .project-links {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        
        .project-links a {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
          font-style: italic;
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
          .contact-info {
            flex-direction: column;
            gap: 10px;
          }
          
          .links {
            flex-direction: column;
          }
          
          .project-card {
            border-radius: 4px;
          }
        }
      </style>
    `;

    const headerInitial = (user.name || user.username)
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const projectsHTML =
      projects && projects.length > 0
        ? projects
            .map((project) => {
              const imageHTML = project.images && project.images.length > 0
                ? `<img src="${project.images[0]}" alt="${project.title}" />`
                : '🖼️';

              const tagsHTML = project.tags && project.tags.length > 0
                ? project.tags
                    .map((tag) => `<span class="tag">${tag}</span>`)
                    .join('')
                : '';

              const statsHTML = project.stats
                ? `
                  ${project.stats.views ? `👀 ${project.stats.views} vistas` : ''}
                  ${project.stats.likes ? `❤️ ${project.stats.likes} likes` : ''}
                  ${project.stats.comments ? `💬 ${project.stats.comments} comentarios` : ''}
                `.trim()
                : '';

              const linksHTML =
                project.liveUrl || project.repoUrl
                  ? `<div class="project-links">
                    ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank">🚀 Ver en vivo</a>` : ''}
                    ${project.repoUrl ? `<a href="${project.repoUrl}" target="_blank">💻 Código</a>` : ''}
                  </div>`
                  : '';

              return `
                <div class="project-card">
                  <div class="project-image">${imageHTML}</div>
                  <div class="project-content">
                    <div class="project-title">${project.title}</div>
                    ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                    ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
                    ${statsHTML ? `<div class="project-stats">${statsHTML}</div>` : ''}
                    ${linksHTML}
                  </div>
                </div>
              `;
            })
            .join('')
        : '<div class="empty-state">No hay proyectos que mostrar</div>';

    const linksHTML =
      user.links && user.links.length > 0
        ? `<div class="links">
        ${user.links
          .map(
            (link) =>
              `<a href="${link.url}" target="_blank">${link.name}</a>`
          )
          .join('')}
      </div>`
        : '';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio - ${user.name || user.username}</title>
        ${styles}
      </head>
      <body>
        <div class="portfolio-wrapper">
          <div class="header">
            <div class="header-avatar">${headerInitial}</div>
            <h1>${user.name || user.username}</h1>
            <div class="username">@${user.username}</div>
            ${user.bio ? `<div class="bio">"${user.bio}"</div>` : ''}
            
            <div class="contact-info">
              <div>📧 ${user.email}</div>
              <div><span class="stat-badge">👥 ${user.followers?.length || 0} seguidores</span></div>
            </div>
            
            ${linksHTML}
          </div>
          
          <div class="section-title">📂 Proyectos (${projects?.length || 0})</div>
          <div class="projects-container">
            ${projectsHTML}
          </div>
          
          <div class="footer">
            <p>Generado por TFG Portafolios • ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  // Exponer función para ser usada por Portfolio.jsx
  return {
    generateHTML,
  };
};

export default PortfolioPDFGenerator;

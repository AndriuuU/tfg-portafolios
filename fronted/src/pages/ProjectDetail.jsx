import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectById, likeProject, unlikeProject, saveProject, unsaveProject } from "../api/api";
import { downloadProjectPDF } from "../api/exportApi";
import { useToast } from "../context/ToastContext";
import Comments from "../components/Comments";
import CollaboratorList from "../components/CollaboratorList";
import InviteCollaborator from "../components/InviteCollaborator";
import ProjectPDFGenerator from "../components/ProjectPDFGenerator";
import "../styles/ProjectDetail.scss";

export default function ProjectDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await getProjectById(id);
      const projectData = res.data;
      setProject(projectData);
      
      // Verificar si el usuario dio like
      if (currentUser._id && projectData.likes) {
        const userIdString = currentUser._id.toString();
        const hasLike = projectData.likes.some(likeId => likeId.toString() === userIdString);
        setIsLiked(hasLike);
      }
      
      // Establecer contador de likes
      setLikesCount(projectData.likes?.length || 0);
      
      // Verificar si el usuario guardó el proyecto
      if (currentUser.savedProjects) {
        const projectIdString = projectData._id.toString();
        const hasSaved = currentUser.savedProjects.some(savedId => savedId.toString() === projectIdString);
        setIsSaved(hasSaved);
      }
    } catch (err) {
      console.error("Error al cargar proyecto:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await likeProject(id);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await saveProject(id);
      setIsSaved(response.data.saved);
      
      // Actualizar localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (response.data.saved) {
        if (!updatedUser.savedProjects) updatedUser.savedProjects = [];
        if (!updatedUser.savedProjects.includes(id)) {
          updatedUser.savedProjects.push(id);
        }
      } else {
        updatedUser.savedProjects = updatedUser.savedProjects.filter(
          savedId => savedId.toString() !== id.toString()
        );
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando proyecto...</div>;
  }

  if (!project) {
    return <div className="error-container">Proyecto no encontrado</div>;
  }

  const isOwner = currentUser.id === project.owner?._id || currentUser._id === project.owner?._id;
  const isCollaborator = project.collaborators?.some(c => 
    c.user._id === currentUser.id || c.user._id === currentUser._id
  );
  const canEdit = isOwner || (isCollaborator && 
    project.collaborators?.find(c => 
      (c.user._id === currentUser.id || c.user._id === currentUser._id) && 
      c.role === 'editor'
    )
  );

  return (
    <div className="project-detail-page">
      <div className="project-detail-container">
        {/* Header */}
        <div className="project-header">
          <div className="project-title-section">
            <h1>{project.title}</h1>
            <div className="project-meta">
              <Link to={`/u/${project.owner?.username}`} className="project-owner">
                Por {project.owner?.name || project.owner?.username}
              </Link>
              <span className="project-date">
                {new Date(project.createdAt).toLocaleDateString('es-ES')}
              </span>
              {project.visibility && (
                <span className={`visibility-badge ${project.visibility}`}>
                  {project.visibility === 'public' ? '🌐 Público' : '🔒 Privado'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="project-actions">
            {canEdit && (
              <Link to={`/projects/${id}/edit`} className="btn-edit">
                ✏️ Editar
              </Link>
            )}
            <button 
              onClick={async () => {
                setExporting(true);
                try {
                  // Validar que tenemos los datos necesarios
                  if (!project || !project.owner) {
                    showToast('Error: No se puede exportar el proyecto', 'error');
                    return;
                  }

                  // Generar HTML del proyecto
                  const pdfGenerator = ProjectPDFGenerator({ project, owner: project.owner });
                  const projectHTML = pdfGenerator.generateHTML();

                  // Descargar como PDF
                  const result = await downloadProjectPDF(projectHTML);
                  if (result.success) {
                    showToast('¡PDF descargado con éxito! 📄', 'success');
                  } else {
                    showToast(`Error: ${result.message}`, 'error');
                  }
                } catch (error) {
                  console.error("Error exporting project:", error);
                  showToast('Error al exportar el proyecto', 'error');
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="btn-export"
              title="Descargar proyecto como PDF"
            >
              {exporting ? '⏳ Generando PDF...' : '📄 Exportar'}
            </button>
            {currentUser._id && (
              <>
                <button onClick={handleLike} className={`btn-like ${isLiked ? 'liked' : ''}`}>
                  {isLiked ? '❤️' : '🤍'} {likesCount}
                </button>
                <button onClick={handleSave} className={`btn-save ${isSaved ? 'saved' : ''}`}>
                  {isSaved ? '💾' : '🔖'} {isSaved ? 'Guardado' : 'Guardar'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Images */}
        {project.images?.length > 0 && (
          <div className="project-images">
            {project.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${project.title} - Imagen ${idx + 1}`}
                className="project-image"
              />
            ))}
          </div>
        )}

        {/* Description */}
        <div className="project-description">
          <h2>Descripción</h2>
          <p>{project.description}</p>
        </div>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="project-tags">
            <h3>Tecnologías</h3>
            <div className="tags-list">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(project.liveUrl || project.repoUrl) && (
          <div className="project-links">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                🔗 Ver Demo
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                📦 Ver Repositorio
              </a>
            )}
          </div>
        )}

        {/* Collaborators Section */}
        <div className="collaborators-section">
          <div className="section-header">
            <h2>Colaboradores</h2>
            <button 
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="btn-toggle"
            >
              {showCollaborators ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {showCollaborators && (
            <>
              <CollaboratorList 
                projectId={id} 
                isOwner={isOwner}
                onUpdate={fetchProject}
              />

              {isOwner && (
                <div className="invite-section">
                  <button 
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="btn-primary"
                  >
                    {showInviteForm ? 'Cancelar' : '➕ Invitar Colaborador'}
                  </button>

                  {showInviteForm && (
                    <InviteCollaborator 
                      projectId={id}
                      onInviteSent={() => {
                        setShowInviteForm(false);
                        fetchProject();
                      }}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Comments */}
        <div className="comments-section">
          <h2>Comentarios</h2>
          <Comments projectId={id} token={localStorage.getItem("token")} />
        </div>
      </div>
    </div>
  );
}

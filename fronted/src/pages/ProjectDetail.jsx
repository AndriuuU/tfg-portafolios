import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectById, likeProject, unlikeProject, saveProject, unsaveProject } from "../api/api";
import Comments from "../components/Comments";
import CollaboratorList from "../components/CollaboratorList";
import InviteCollaborator from "../components/InviteCollaborator";
import "../styles/Dashboard.scss";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await getProjectById(id);
      setProject(res.data);
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
      if (project.isLiked) {
        await unlikeProject(id);
        setProject({
          ...project,
          likes: project.likes - 1,
          isLiked: false
        });
      } else {
        await likeProject(id);
        setProject({
          ...project,
          likes: project.likes + 1,
          isLiked: true
        });
      }
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (project.isSaved) {
        await unsaveProject(id);
        setProject({
          ...project,
          isSaved: false
        });
      } else {
        await saveProject(id);
        setProject({
          ...project,
          isSaved: true
        });
      }
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
            {currentUser.id && (
              <>
                <button onClick={handleLike} className={`btn-like ${project.isLiked ? 'liked' : ''}`}>
                  {project.isLiked ? '❤️' : '🤍'} {project.likes || 0}
                </button>
                <button onClick={handleSave} className={`btn-save ${project.isSaved ? 'saved' : ''}`}>
                  {project.isSaved ? '💾' : '🔖'} {project.isSaved ? 'Guardado' : 'Guardar'}
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

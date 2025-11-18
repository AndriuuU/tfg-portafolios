
// Importar controladores modulares
const projectCrud = require('./project/projectCrudController');
const comments = require('./project/commentController');
const likes = require('./project/likeController');
const markers = require('./project/markerController');
const collaborators = require('./project/collaboratorController');

// CRUD de proyectos
exports.createProject = projectCrud.createProject;
exports.getUserProjects = projectCrud.getUserProjects;
exports.getFollowingProjects = projectCrud.getFollowingProjects;
exports.getProjectById = projectCrud.getProjectById;
exports.updateProject = projectCrud.updateProject;
exports.deleteProject = projectCrud.deleteProject;

// Comentarios
exports.addComment = comments.addComment;
exports.deleteComment = comments.deleteComment;
exports.likeComment = comments.likeComment;
exports.unlikeComment = comments.unlikeComment;

// Likes en proyectos
exports.likeProject = likes.likeProject;
exports.unlikeProject = likes.unlikeProject;

// Marcadores
exports.saveProject = markers.saveProject;
exports.unsaveProject = markers.unsaveProject;
exports.getSavedProjects = markers.getSavedProjects;

// Colaboradores
exports.inviteCollaborator = collaborators.inviteCollaborator;
exports.acceptInvitation = collaborators.acceptInvitation;
exports.rejectInvitation = collaborators.rejectInvitation;
exports.removeCollaborator = collaborators.removeCollaborator;
exports.updateCollaboratorRole = collaborators.updateCollaboratorRole;
exports.getCollaborators = collaborators.getCollaborators;
exports.getMyInvitations = collaborators.getMyInvitations;
exports.leaveProject = collaborators.leaveProject;


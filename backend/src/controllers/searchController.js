const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Búsqueda avanzada de proyectos
 * Soporta filtrado por texto, tags, owner (username o ID), paginación y ordenamiento
 */
exports.searchProjects = async (req, res) => {
    try {
        const {
            q,
            tags,
            owner,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Construir filtros
        const filters = {};

        // Búsqueda de texto (case-insensitive)
        if (q) {
            filters.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        // Filtrar por tags
        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim());
            filters.tags = { $in: tagsArray };
        }

        // Filtrar por owner (soporta username o ID)
        if (owner) {
            // Intentar buscar por username primero
            const user = await User.findOne({
                $or: [
                    { username: owner },
                    { _id: owner.match(/^[0-9a-fA-F]{24}$/) ? owner : null } // Validar que sea un ObjectId válido
                ]
            });

            if (user) {
                filters.owner = user._id;
            } else {
                // Si no se encuentra el usuario, retornar resultados vacíos
                return res.json({
                    projects: [],
                    pagination: {
                        total: 0,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                });
            }
        }

        // Configurar ordenamiento
        const validSortFields = ['createdAt', 'likes', 'title'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order === 'asc' ? 1 : -1;

        let sortOptions = {};
        if (sortField === 'likes') {
            // Para ordenar por likes, necesitamos usar el tamaño del array
            sortOptions = { likesCount: sortOrder };
        } else {
            sortOptions[sortField] = sortOrder;
        }

        // Paginación
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20)); // Máximo 50
        const skip = (pageNum - 1) * limitNum;

        // Ejecutar búsqueda con agregación para manejar likesCount
        let projects;
        const totalCount = await Project.countDocuments(filters);

        if (sortField === 'likes') {
            // Usar agregación para ordenar por número de likes
            projects = await Project.aggregate([
                { $match: filters },
                {
                    $addFields: {
                        likesCount: { $size: '$likes' }
                    }
                },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                {
                    $unwind: {
                        path: '$owner',
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $project: {
                        'owner.password': 0,
                        'owner.followers': 0,
                        'owner.following': 0,
                        'owner.blockedUsers': 0,
                        'owner.followRequests': 0,
                        'owner.savedProjects': 0
                    }
                }
            ]);
        } else {
            // Búsqueda normal con populate
            projects = await Project.find(filters)
                .populate('owner', 'username name email avatarUrl')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .lean();
        }

        // Calcular metadatos de paginación
        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            projects,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error searchProjects:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Búsqueda de usuarios
 * Permite buscar usuarios por username, name o email
 */
exports.searchUsers = async (req, res) => {
    try {
        const {
            q,           // Búsqueda de texto
            page = 1,
            limit = 20
        } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
        }

        const filters = {
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        };

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const totalCount = await User.countDocuments(filters);

        const users = await User.find(filters)
            .select('username name email avatarUrl bio')
            .sort({ username: 1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            users,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error searchUsers:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener tags más populares
 * Útil para sugerencias y filtros
 */
exports.getPopularTags = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        // Agregación para contar tags
        const popularTags = await Project.aggregate([
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limitNum },
            {
                $project: {
                    tag: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json({ tags: popularTags });

    } catch (error) {
        console.error('Error getPopularTags:', error);
        res.status(500).json({ error: error.message });
    }
};

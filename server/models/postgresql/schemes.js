import { DataTypes } from 'sequelize'
import sequelize from '../../config/sequelize.js'

/* ------------------------------- TABLE USER -----------------------------*/

export const userScheme = sequelize.define('usuarios', {
	id_user: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},

	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},

	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true,
		},
	},

	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})

/* ------------------------------- TABLE ROLES -----------------------------*/

export const rolScheme = sequelize.define(
	'roles',
	{
		id_rol: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},

		type_rol: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'docente',
			validate: {
				isIn: [['admin', 'docente', 'general']],
			},
		},

		id_user_fk: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
		},
	},

	{
		timestamps: false,
	}
)

userScheme.hasOne(rolScheme, {
	foreignKey: 'id_user_fk',
	sourceKey: 'id_user',
})

/* ------------------------------- TABLE CATEGORY -----------------------------*/

export const categoryScheme = sequelize.define('categories', {
	id_category: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},

	description: {
		type: DataTypes.STRING,
		allowNull: true,
	},

	active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

categoryScheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE PARAMETER -----------------------------*/

export const parameter_global_Scheme = sequelize.define('parameter', {
	id_parameter: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: true,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

parameter_global_Scheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE TAG -----------------------------*/

export const tagScheme = sequelize.define('tags', {
	id_tag: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},

	description: {
		type: DataTypes.STRING,
		allowNull: true,
	},

	active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

tagScheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE CONFIG -----------------------------*/

export const configScheme = sequelize.define('config', {
	id_config: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	name_institution: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		defaultValue: 'vacio',
	},

	abbreviation: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		defaultValue: 'vacio',
	},

	slogan: {
		type: DataTypes.STRING,
		allowNull: true,
		unique: true,
		defaultValue: 'vacio',
	},

	link_fb: {
		type: DataTypes.STRING,
		allowNull: true,
		unique: true,
		defaultValue: 'vacio',
	},

	link_ig: {
		type: DataTypes.STRING,
		allowNull: true,
		unique: true,
		defaultValue: 'vacio',
	},

	link_x: {
		type: DataTypes.STRING,
		allowNull: true,
		unique: true,
		defaultValue: 'vacio',
	},

	link_yt: {
		type: DataTypes.STRING,
		allowNull: true,
		unique: true,
		defaultValue: 'vacio',
	},
})

/* ------------------------------- TABLE LOGS -----------------------------*/

export const movementScheme = sequelize.define('movements', {
	id_movement: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	action: {
		type: DataTypes.STRING,
		allowNull: false,
	},

	targetType: {
		type: DataTypes.ENUM(
			'usuarios',
			'categorias',
			'etiquetas',
			'formatos',
			'articulos',
			'paremetros',
			'comentarios',
			'colleciones'
		),
		allowNull: false,
	},

	targetId: {
		type: DataTypes.UUID,
		allowNull: false,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

movementScheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE TEMPLATE -----------------------------*/

export const templateScheme = sequelize.define('template', {
	id_template: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	id_category_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: categoryScheme,
			key: 'id_category',
		},
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

templateScheme.belongsTo(categoryScheme, {
	foreignKey: 'id_category_fk',
	targetKey: 'id_category',
})

templateScheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE RELATIONS TAG-TEMPLATE -----------------------------*/

export const relation_tag_template_Scheme = sequelize.define(
	'relation_tag_template',
	{
		id_relation_tag_template: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},

		id_template_fk: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: templateScheme,
				key: 'id_template',
			},
		},

		id_tag_fk: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: tagScheme,
				key: 'id_tag',
			},
		},
	},
	{
		timestamps: false,
	}
)

relation_tag_template_Scheme.belongsTo(templateScheme, {
	foreignKey: 'id_template_fk',
	targetKey: 'id_template',
	onDelete: 'CASCADE',
})

relation_tag_template_Scheme.belongsTo(tagScheme, {
	foreignKey: 'id_tag_fk',
	targetKey: 'id_tag',
	onDelete: 'CASCADE',
})

/* ------------------------------- TABLE ARTICLE -----------------------------*/

export const articleScheme = sequelize.define('article', {
	id_article: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	id_template_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: templateScheme,
			key: 'id_template',
		},
	},

	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'pendiente',
		validate: {
			isIn: [['pendiente', 'aprobado']],
		},
	},

	manager: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},

	id_category_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: categoryScheme,
			key: 'id_category',
		},
	},

	title: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},

	summary: {
		type: DataTypes.TEXT,
		allowNull: false,
	},

	link: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
})

articleScheme.belongsTo(templateScheme, {
	foreignKey: 'id_template_fk',
	targetKey: 'id_template',
})

articleScheme.belongsTo(userScheme, {
	foreignKey: 'manager',
	targetKey: 'id_user',
})

articleScheme.belongsTo(categoryScheme, {
	foreignKey: 'id_category_fk',
	targetKey: 'id_category',
})

/* ------------------------------- TABLE RELATIONS PARAMETER-ARTICLE -----------------------------*/

export const relation_parameter_article_Scheme = sequelize.define('relation_parameter_article', {
	id_relation_parameter_article: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	id_article_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: articleScheme,
			key: 'id_article',
		},
	},

	id_parameter_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: parameter_global_Scheme,
			key: 'id_parameter',
		},
	},

	description: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})

relation_parameter_article_Scheme.belongsTo(articleScheme, {
	foreignKey: 'id_article_fk',
	targetKey: 'id_article',
})

relation_parameter_article_Scheme.belongsTo(parameter_global_Scheme, {
	foreignKey: 'id_parameter_fk',
	targetKey: 'id_parameter',
})

/* ------------------------------- TABLE RELATIONS TAG-ARTICLE -----------------------------*/

export const relation_tag_article_Scheme = sequelize.define('relation_tag_article', {
	id_relation_tag_article: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	id_article_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: articleScheme,
			key: 'id_article',
		},
	},

	id_tag_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: tagScheme,
			key: 'id_tag',
		},
	},

	description: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})

relation_tag_article_Scheme.belongsTo(articleScheme, {
	foreignKey: 'id_article_fk',
	targetKey: 'id_article',
})

relation_tag_article_Scheme.belongsTo(tagScheme, {
	foreignKey: 'id_tag_fk',
	targetKey: 'id_tag',
})

/* ------------------------------- TABLE REVIEWS -----------------------------*/

export const review_Scheme = sequelize.define('review', {
	id_review: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	id_article_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: articleScheme,
			key: 'id_article',
		},
	},

	manager: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},

	task: {
		type: DataTypes.STRING,
		allowNull: false,
	},

	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'pendiente',
		validate: {
			isIn: [['pendiente', 'aprobado']],
		},
	},
})

review_Scheme.belongsTo(articleScheme, {
	foreignKey: 'id_article_fk',
	targetKey: 'id_article',
})

review_Scheme.belongsTo(userScheme, {
	foreignKey: 'manager',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE COMMENT -----------------------------*/

export const comments_Scheme = sequelize.define('comment', {
	id_comment: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	comment: {
		type: DataTypes.TEXT,
		allowNull: false,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},

	id_article_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: articleScheme,
			key: 'id_article',
		},
	},
})

comments_Scheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

comments_Scheme.belongsTo(articleScheme, {
	foreignKey: 'id_article_fk',
	targetKey: 'id_article',
})

/* ------------------------------- TABLE COLLECTION ARTICLE -----------------------------*/

export const collection_article_Scheme = sequelize.define('collection_article', {
	id_collection_article: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},

	id_article_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: articleScheme,
			key: 'id_article',
		},
	},
})

collection_article_Scheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

collection_article_Scheme.belongsTo(articleScheme, {
	foreignKey: 'id_article_fk',
	targetKey: 'id_article',
})

/* ------------------------------- TABLE CODE OPT -----------------------------*/

export const otpCodeScheme = sequelize.define('optCode', {
	id_code: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	operation_type: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'login',
		validate: {
			isIn: [['login', 'update']],
		},
	},

	code: {
		type: DataTypes.STRING,
		allowNull: false,
	},

	id_user_fk: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

otpCodeScheme.belongsTo(userScheme, {
	foreignKey: 'id_user_fk',
	targetKey: 'id_user',
})

/* ------------------------------- TABLE CHAT -----------------------------*/

export const chatScheme = sequelize.define('chat', {
	id_chat: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},

	message: {
		type: DataTypes.STRING,
		allowNull: false,
	},

	read: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},

	id_sender: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},

	id_receiver: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: userScheme,
			key: 'id_user',
		},
	},
})

chatScheme.belongsTo(userScheme, {
	foreignKey: 'id_sender',
	targetKey: 'id_user',
})

chatScheme.belongsTo(userScheme, {
	foreignKey: 'id_receiver',
	targetKey: 'id_user',
})

// Imports
import * as Sequelize from 'sequelize';

export class BaseRepository {
    protected static sequelize: Sequelize.Sequelize = null;
    protected static models: { Post: Sequelize.Model<{}, {}>, Word: Sequelize.Model<{}, {}> } = null;

    private static defineModels(): void {
        const Post = BaseRepository.sequelize.define('post', {
            author: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            authorImage: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            body: {
                allowNull: false,
                type: Sequelize.TEXT,
            },
            category: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            description: {
                allowNull: true,
                type: Sequelize.TEXT,
            },
            image: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            key: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            linkedInShareCount: {
                allowNull: false,
                type: Sequelize.NUMERIC,
            },
            publishedTimestamp: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING,
            },
        });

        const Word = BaseRepository.sequelize.define('word', {
            count: {
                allowNull: false,
                type: Sequelize.NUMERIC,
            },
            text: {
                allowNull: false,
                type: Sequelize.STRING,
            },
        });

        Post.hasMany(Word, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
        Word.belongsTo(Post, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

        this.models = {
            Post,
            Word,
        };
    }

    constructor(private host: string, private username: string, private password: string) {

        if (!BaseRepository.sequelize) {
            BaseRepository.sequelize = new Sequelize('github-blog', username, password, {
                dialect: 'postgres',
                host,
                logging: false,
                pool: {
                    idle: 10000,
                    max: 5,
                    min: 0,
                },
            });

            BaseRepository.defineModels();
        }
    }

    public sync(): Promise<void> {
        return new Promise((resolve, reject) => {
            BaseRepository.sequelize.sync({ force: true }).then(() => {
                resolve();
            });
        });
    }

    public close(): void {
        BaseRepository.sequelize.close();
    }

}

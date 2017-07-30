// Imports
import * as Sequelize from 'sequelize';

export class BaseRepository {
    protected static sequelize: Sequelize.Sequelize = null;
    protected static models: { Post: Sequelize.Model<{}, {}>, Visitor: Sequelize.Model<{}, {}> } = null;

    private static defineModels(): void {
        const Post = BaseRepository.sequelize.define('post', {
            key: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            title: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            description: {
                allowNull: true,
                type: Sequelize.TEXT,
            },
            body: {
                allowNull: false,
                type: Sequelize.TEXT,
            },
            linkedInShareCount: {
                allowNull: false,
                type: Sequelize.NUMERIC,
            },
            author: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            authorImage: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            publishedTimestamp: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
        });

        const Visitor = BaseRepository.sequelize.define('visitor', {
            username: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            key: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            type: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            lastVisitTimestamp: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            lastLoginTimestamp: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
        });

        this.models = {
            Post,
            Visitor,
        };
    }

    constructor(private host: string, private username: string, private password: string) {

        if (!BaseRepository.sequelize) {
            BaseRepository.sequelize = new Sequelize('github-blog-db', username, password, {
                dialect: 'postgres',
                host,
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

// Imports
import * as Sequelize from 'sequelize';

export class BaseRepository {
    protected static sequelize: Sequelize.Sequelize = null;
    protected static models: { Post: Sequelize.Model<{}, {}>, Visitor: Sequelize.Model<{}, {}> } = null;

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
            description: {
                allowNull: true,
                type: Sequelize.TEXT,
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
                allowNull: true,
                type: Sequelize.STRING,
            },
        });

        const Visitor = BaseRepository.sequelize.define('visitor', {
            key: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            lastLoginTimestamp: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            lastVisitTimestamp: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            type: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            username: {
                allowNull: false,
                type: Sequelize.STRING,
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

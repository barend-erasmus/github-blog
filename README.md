# Github Blog

An Open Source Github powered blog framework for developers.

## About

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eu tempor purus. Ut rutrum, massa eget suscipit fringilla, mi tortor placerat felis, a varius libero urna nec massa. Donec aliquet consectetur finibus. Nulla varius congue augue, sit amet feugiat ex condimentum sit amet. Mauris magna mauris, consectetur non quam nec, imperdiet ullamcorper dui. Mauris lacus nisi, iaculis ac libero in, accumsan malesuada quam. Vivamus nec enim vitae sem hendrerit mollis. Sed nec vulputate arcu. Aenean hendrerit rhoncus arcu et mollis. Fusce id turpis et diam egestas consequat. Morbi ac porttitor eros. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse potenti.

## How it Works?

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eu tempor purus. Ut rutrum, massa eget suscipit fringilla, mi tortor placerat felis, a varius libero urna nec massa. Donec aliquet consectetur finibus. Nulla varius congue augue, sit amet feugiat ex condimentum sit amet. Mauris magna mauris, consectetur non quam nec, imperdiet ullamcorper dui. Mauris lacus nisi, iaculis ac libero in, accumsan malesuada quam. Vivamus nec enim vitae sem hendrerit mollis. Sed nec vulputate arcu. Aenean hendrerit rhoncus arcu et mollis. Fusce id turpis et diam egestas consequat. Morbi ac porttitor eros. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse potenti.

![](https://github.com/barend-erasmus/github-blog/raw/master/images/github-blog.png)

## Getting Started

### Running locally or in production.

Whether you're running this locally or in production you'll first need to `fork` and `clone` this [Repository](https://github.com/barend-erasmus/github-blog).

![](https://github.com/barend-erasmus/github-blog/raw/master/images/screenshot-fork-clone.PNG)

This project will also require a database such as mysql, mssql, SQLite, postgresql or mongo.

Once you've setuped the database, you'll need to change some configuration in the `config.json` file which can be found under the `src` directory.

* Database

    This section defines your database details such as type, username, password and host.

    ```
    "database": {
        "host": "127.0.0.1",
        "password": "password",
        "type": "mysql" | "mssql" | "postgresql" | "lite" | "mongo",
        "username": "username"
    }
    ```

* Domain

    This section defines your domain which will be used to generate LinkedIn and Facebook share urls.

    ```
    "domain": "http://yourdomain.com",
    ```
* Github

    This section defines your Github credentials which will be used to generate an authentication token.

    ```
    "github": {
        "password": "your Github password",
        "username": "your Github username"
    }
    ```

* OAuth 2

    This section defines your OAuth2 details for Github, Google and LinkendIn. This is the only supported OAuth2 providers.

    ```
    "oauth2": {
        "github": {
            "callback": "http://yourdomain.com/auth/github/callback",
            "clientId": "your client id",
            "clientSecret": "your client secret"
        },
        "google": {
            "callback": "http://yourdomain.com/auth/google/callback",
            "clientId": "your client id",
            "clientSecret": "your client secret"
        },
        "linkedIn": {
            "callback": "http://yourdomain.com/auth/linkedin/callback",
            "clientId": "your client id",
            "clientSecret": "your client secret"
        }
    }
    ```
* Pages

    ```
    "pages": {
            "about": {
                "title": "What is Developer's Workspace all about? Developer's Workspace vision is to create MIT licensed software solution to allow developers to focus on their idea instead of other requirements such as authentication"
            },
            "contact": {
                "title": "Developer's Workspace is always open to ideas, support and solutions. Feel free to contact us at any time."
            },
            "home": {
                "title": "Cape Town, South Africa based Software Engineer sharing knowledge, experiences and ideas."
            }
        },
    ```

* Scheduled Task

    This section defines the details of the scheduled task.

    ```
    "scheduledTask": {
        "cron": {
            "pattern": "0 0 * * * *"
        }
    }
    ```

* Users

    This section defines the Github profiles which will scraped for blog posts.

    ```
    "users": [
        "barend-erasmus",
        "developersworkspace"
    ]
    ```

Now that the database is configure we can run `npm install` which will install all the required `node modules` followed by `npm run job` which will run the scheduled task and populate the database with some blog posts from `barend-erasmus` and `developersworkspace`. You can change this in the `config.json` file.

### The Attributes of a Blog Post

A Blog Post has the following attributes:

* Key - Unique Identifier of the Blog Post.
* Title - Title of the Blog Post.
* Description - Short Description of the Blog Post.
* Body - Body of the Blog Post.
* Image - Image of the Blog Post.
* Category - Category of the Blog Post.
* Author - Username of Author of the Blog Post.
* Author Image - Profile Image of Author of the Blog Post.
* Published Timestamp - Published or Last Updated Timestamp of the Blog Post.
* LinkedIn Share Count - Number of times Blog Post shared on LinkedIn.

### Creating a new Blog Post

Github Blog uses one or more Github account as a data source for its content, thus you'll have to create a [Github Account](https://github.com/join) or if you already have one, you'll need to [Login](https://github.com/login).

After you've registered or logged in, you need to make sure that your username is added to the configuration of the Github Blog.

#### **Step 1**

Now that you are logged in and made sure that your username is added to the configuration of the Github Blog, we can start creating our first Blog Post.

Each Blog Post is based off a Github repository. Let's go and make a [New Repository](https://github.com/new).

![](https://github.com/barend-erasmus/github-blog/raw/master/images/screenshot-new-repository.PNG)

#### **Step 2**

Once you have created the new repository, you can clone it by using [Source Tree](https://www.sourcetreeapp.com/) which can be downloaded [here](https://downloads.atlassian.com/software/sourcetree/windows/ga/SourceTreeSetup-2.1.2.5.exe?_ga=2.15719541.279631402.1502350707-1804559775.1502350707).

#### **Step 3**

Open the `README.md` file using your favorite text editor such as [Visual Studio Code](https://code.visualstudio.com/), [Sublime Text](https://www.sublimetext.com/), [Notepad ++](https://notepad-plus-plus.org/download/v7.4.2.html) or [Atom](https://atom.io/).

#### **Step 4**

You can use this [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) as a guideline on how to edit your `README.md` file.

### Publishing a new Blog Post

Github Blog won't publish your blog unless a `blog-data` file exists.

Create a `blog-data` file in the same directory as your `README.md` file with the following content.

```
{
    "title": "My Blog Post",
    "category": "My Blog Post Category",
    "image": "http://via.placeholder.com/350x150"
}
```

This file will set the `Title`, `Category` and `Image` attribute of your blog post.

Once this file is commited and pushed to your repository, it will be added to your blog on the next cycle of the scheduled task.
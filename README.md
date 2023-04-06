# Airtable GitHub Repos

This Airtable extension uses GitHub's GraphQL API to fetch metadata about all repositories in an organisation and load it into an Airtable Table.

This extension is based upon Open-Source code developed for another personal project: https://docs.zencrepes.io/

## Configuration

### Obtain a GitHub developer token

Log-in your profile in GitHub, and go to your settings.

![](/img/zencrepes-dev-github-settings.png)

In the left-side menu, click on `Developer settings` at the bottom.

Then select `Personal access tokens`, `Tokens (classic)` and `Generate new token`.

![](/img/github-dev-settings.png)

Give your token a name, and select the following scopes:

- repo
- read:org

Those scopes should be sufficient to get started, click on `Generate token` and keep this token safe (don't share it!).

### Configure the extension

After providing your GitHub token, clicking on "Fetch available organizations" will retrieve the list of all organizations attached to your user.

From there you can specify the name of the table to use and click on "Save".

## Fetching repositories

Behind the scenes, fetching repositories is done in two steps:

- Get the list of repositories attached to the organization you specified. This process usually takes a couple of seconds.
- Get the actual metadata (see [the query here](./frontend/fetchrepos/github/graphql/gqlGetReposByIds.ts)) for every single repositories in the organization. Depending of the amount of repositories, this operation can easily take a couple of minutes for large organizations.

While repos are being fetched, a "Logs" button it available, it provides some details about what is happening in the background. For example, the transfer rate (in repos/s) will give you an idea of how long the import is expected to take.

### Playing nicely with GitHub API

The extension does its best to play nicely with GitHub API, it will monitor query costs and will pause if all query tokens have been exhausted (you get 5000 per hour).

During data import, the script will pause for 1s between each GraphQL query.

## Handling errors

In some occurences, GitHub API will return an error (a 502 in most cases), pointing to an errors on their end. This is likely caused by the large repositories (age, size, number of issues, ...) in the organization.

The import process will retry queries up to 3 times, and will fail if it reaches 3 failures in a row (a successful query resets the error count).

### Tweak nodes fetching

In general, reducing the number of nodes fetched at once is a good technique to reduce the error rate, but it also means that the import will take much longer (remember, there is a 1s pause between queries).

So it's all about balance when choosing a number of repositories to be fecthed per GraphQL query (no more than 100). You can start with 50 and increase or decrease it depending of the error rate.

## Credits

A bunch of the logic for repositories fetching is coming from https://github.com/zencrepes/zindexer

This project was used as a ted bed to learn about Airtable extensions: https://github.com/Airtable-Automator/flickr-search-and-import

<div align="center">

# Markdown Safe Web Browsing

[![Help donate](https://img.shields.io/badge/%20-@markbattistella-blue?logo=paypal)](https://www.paypal.me/markbattistella/6AUD)

---
</div>

## Background

I started with this tweet by [@seanallen](https://twitter.com/seanallen_dev/status/1332696819625844736) where he added a URL into a YouTube video description.

The URL became compromised within the week of adding it, and his channel was flagged with **strike 1**.

I realised there isn't anything out there to prevent this from happening to anyone's repository.

## Usage

1. Install the module from `npm`

    ```sh
    # locally
    npm i @markbattistella/markdown-safe-link

    # globally
    npm i @markbattistella/markdown-safe-link -g
    ```

1. Run it from your terminal

    ```sh
    markdown-safe-link \
        --api="<YOUR_API_KEY_HERE>" \
        --dir="~/projects/my-docs/" \
        --replace="~~UNSAFE~~"
    ```

### GitHub action

If you want to use this as part of your repository there is also [an action you can use](https://github.com/markbattistella/markdown-safe-link-action).

## Requirements

You need to get your own API for [Google Safe Browsing](https://developers.google.com/safe-browsing/) as there are limits to the number of calls made.

This package supports Node.js 20 and 22 or newer.

## Configuration

| Name       | Description                     |
|------------|---------------------------------|
| `dir`      | The directory to scan md files  |
| `api`      | Google API for scanning URLs    |
| `replace`  | What to replace the URLs with   |
| `proxy`    | Are you behind a proxy server   |
| `url`      | Proxy url address or IP address |
| `port`     | Proxy port number               |
| `username` | Username if your proxy has auth |
| `password` | Password if your proxy has auth |
| `dry`      | Don't actually re-write files   |
| `help`     | Display the help screen         |

### Full command line

```sh
markdown-safe-link \
  --api="<YOUR_API_KEY_HERE>" \
  --dir="~/projects/my-docs/" \
  --replace="~~UNSAFE~~"      \
  --proxy                     \
    --url="127.0.0.1"         \
    --port="3128"             \
    --username="jdoe"         \
    --password="MyPassword"   \
  --dry
```

## Contributing

1. Clone the repo:

    `git clone https://github.com/markbattistella/markdown-safe-link.git`

1. Create your feature branch:

    `git checkout -b my-feature`

1. Commit your changes:

    `git commit -am 'Add some feature'`

1. `Push` to the branch:

    `git push origin my-new-feature`

1. Submit the `pull` request

## Development

```sh
npm ci
npm test
npm run lint
```

## Release

The release workflow only runs when a version tag is pushed. It validates the package, normalizes date-style tags for npm, then publishes to npm and GitHub Packages.

```sh
npm version 2026.5.9 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Release 2026.5.9"
git tag 2026.05.09
git push origin main
git push origin 2026.05.09
```

The tag can use leading zeroes for date-style releases. For example, tag `2026.05.09` is normalized to npm package version `2026.5.9`.

If one registry publishes and the other fails, run the workflow manually from GitHub Actions and enter the same release tag, for example `2026.05.09`. The workflow checks each registry first and skips any package version that already exists.

### npm Trusted Publisher

The npm publish job uses Trusted Publishing with GitHub Actions OIDC, so it does not need an `NPM_AUTH_TOKEN` secret.

On npmjs.com, configure the package's trusted publisher with:

| Field | Value |
|-------|-------|
| Organization or user | `markbattistella` |
| Repository | `markdown-safe-link` |
| Workflow filename | `release.yml` |
| Environment name | Leave blank |

Trusted Publisher settings are under the existing npm package's settings. If the package has never been published to npm, publish it once with a normal npm token first, then configure Trusted Publishing for future releases.

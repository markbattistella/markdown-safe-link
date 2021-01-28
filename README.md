<div align="center">

# Markdown Safe Web Browsing

[![Help donate](https://img.shields.io/badge/%20-@markbattistella-blue?logo=paypal)](https://www.paypal.me/markbattistella/6AUD)
[![Buy me a coffee](https://img.shields.io/badge/%20-buymeacoffee-black?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/markbattistella)

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

### Github action

If you want to use this as part of your repository there is also [an action you can use](https://github.com/markbattistella/markdown-safe-link-action).

## Requirements

You need to get your own API for [Google Safe Browsing](https://developers.google.com/safe-browsing/) as there are limits to the number of calls made.

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

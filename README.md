<div align="center">

# Markdown Safe Web Browsing

---

![Help donate](https://img.shields.io/badge/%20-@markbattistella-blue?logo=paypal&link=https://www.paypal.me/markbattistella/6AUD) ![Buy me a coffee](https://img.shields.io/badge/%20-buymeacoffee-black?logo=buy-me-a-coffee&link=https://www.buymeacoffee.com/markbattistella)

---

</div>

## How we got here

I started with this tweet by [@seanallen](https://twitter.com/seanallen_dev):

<blockquote class="twitter-tweet" data-dnt="true" data-theme="light"><p lang="en" dir="ltr">I may need to stop including links in my videos that feature others (Swift News, etc). Turns out if a site I link to gets compromised, my channel is affected. The link redacted below goes to a site marked &quot;deceptive&quot; by Google. For those that don&#39;t know, 3 strikes and you&#39;re done <a href="https://t.co/RefaHgHRLY">pic.twitter.com/RefaHgHRLY</a></p>&mdash; Sean Allen (@seanallen_dev) <a href="https://twitter.com/seanallen_dev/status/1332696819625844736?ref_src=twsrc%5Etfw">November 28, 2020</a></blockquote>

To which I realised there isn't anything out there to do prevent this!

## How it works

1. You need to get your own API for [Google Safe Browsing](https://developers.google.com/safe-browsing/)

1. Install the module from npm

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
        --replace="UNSAFE"
    ```

## Watch it work

> I tried recording it but its way too quick - I'll get a video one day!

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

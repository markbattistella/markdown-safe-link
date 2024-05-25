# Markdown Safe Link Checker

Turn `malicious-url.stealyourdetails.bad` into **~~UNSAFE_URL~~**

![Malware message](assets/err01.jpg)

## TLDR

- I made a `nodejs` module that scans for malicious urls via Google Safe Browsing
- I converted it into a `Github Action` (with some guidance)
- It works great for markdown files where you might link to external sites
- Perfect if you host a blog on Github or write mainly in markdown

## How we got here

We love making collections. And lists. And collections of lists. It's human nature.

We create `git` repositories of [awesome lists](https://github.com/topics/awesome-list), use it to make [news updates](https://github.com/rust-lang/this-week-in-rust), or [aggregated topics](https://github.com/SAllen0400/swift-news) for your followers.

Whatever it is when writing markdown, ensuring the urls you link to are safe and not compromised can be difficult - especially when its a small team (or just ourselves).

## What this fixes

When you write markdown files, and you add in links to websites depending on the flavour of option you choose, you can have all the urls scanned and ratified against Google Safe Browsing.

If you run it either standalone, or as part of your nodejs application then you can have it remove any unsafe urls before building.

If you have it as part of a workflow in your Github actions, then on every `push`, `pull_request`, `cron` schedule, (or however you please) it can send those links off to Google Safe Browsing.

?> The saving grace its knowing whatever you submit to your friends, clients, or publicly will be safe on the same grounds as what most browsers use for their malicious scanning

## Why it matters

It might seem trivial if you're only linking to other `git` repositories or to a Twitter link - how do these get flagged?

The short answer is major sites won't get flagged, and links to a private post or tweet won't be redacted. But we hope that those major companies have their own sanitisation systems.

This is for those sites where today it has a mock up portfolio design, and in 6 months time the domain has been sold or reclaimed to link to a scam.

This is designed for people like me with fat fingers, poor typing skills, and don't always proof-read. Instead of sending my users to `paypal.com` and I send them to `paypol.com` why wouldn't I mitigate the risks and lost trust with my followers?

## How it works

Briefly, as you can always examine the `npm` package for the source but:

1. It recursively scans all your markdown files (`.md`) for urls
1. It collates them into an array
1. Removes duplicate links from the array (less API calls)
1. Sends it off to Google Safe Browsing for assessments
1. The returned urls (malicious) then replaced from all the markdown files

---

<small>**Last updated:** {docsify-updated}</small>

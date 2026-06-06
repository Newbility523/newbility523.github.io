# Blog Writing Guide

## Posts

Put published posts under `_posts/`. Keep the Jekyll filename format:

```text
YYYY-MM-DD-title.md
```

Use `layout: post` in front matter. The page title comes from `title`, so start the article body with `##` headings instead of adding another `#` heading.

```yaml
---
layout: post
title: Remote development with VSCode
tags: [frp, vscode, remote, develop, ssh]
---
```

## Table of Contents

Do not write a manual table of contents at the top of a post.

The post layout automatically builds the right-side table of contents from heading IDs in the article body. It uses `h2` through `h4`, so these Markdown heading levels are included:

```markdown
## Main section
### Subsection
#### Detail
```

On wide screens, the generated table of contents appears on the right and highlights the current section while scrolling. On narrower screens, it is hidden to keep the article readable.

Try to keep headings unique and stable. Changing a heading changes its anchor link.

## Comments

Giscus comments are enabled for posts by default. Do not paste the Giscus script into individual posts.

To disable comments for one post, add this to its front matter:

```yaml
comments: false
```

Comments are mapped by the post URL pathname, so avoid changing an already-published post filename or permalink unless you are okay with creating a new comment thread.

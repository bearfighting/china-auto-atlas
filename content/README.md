# China Auto Atlas — Editorial Content

Editorial documents are separate from structured entities and events.

```text
content/
└── news/
```

News frontmatter uses stable IDs and explicit references:

```yaml
id: news-2022-08-08-avatr-11-global-launch
type: news
title:
slug:
status: published
published_at:
updated_at:
author_ids: []
topic_ids: []
entity_ids: []
event_ids: []
source_ids: []
evidence_status: confirmed
```

The body explains the event and its significance. It must not duplicate the complete Vehicle or Technology record.

Controlled author and topic IDs are defined in `content/taxonomy/`.

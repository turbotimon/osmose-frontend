import os
from typing import Dict, List, Optional
from uuid import UUID

from asyncpg import Connection

from modules.query import fixes_default

from .tool import tag2link

t2l = tag2link.tag2link(
    os.path.dirname(os.path.realpath(__file__)) + "/tool/tag2link_sources.xml"
)


async def _get(
    db: Connection, err_id: Optional[int] = None, uuid: Optional[UUID] = None
):
    columns_marker = [
        "markers.item",
        "markers.source_id",
        "markers.class",
        "elems",
        "fixes",
        "lat::float",
        "lon::float",
        "title",
        "subtitle",
        "updates_last.timestamp",
        "detail",
        "fix",
        "trap",
        "example",
        "source AS source_code",
        "resource",
    ]

    if err_id:
        sql = (
            "SELECT uuid_to_bigint(markers.uuid) AS id, "
            + ",".join(columns_marker)
            + """
        FROM
            markers
            JOIN class ON
                class.item = markers.item AND
                class.class = markers.class
            JOIN updates_last ON
                updates_last.source_id = markers.source_id
        WHERE
            uuid_to_bigint(uuid) = $1
        """
        )
        marker = await db.fetchrow(sql, err_id)
    else:
        sql = (
            "SELECT "
            + ",".join(columns_marker)
            + """
        FROM
            markers
            JOIN class ON
                class.item = markers.item AND
                class.class = markers.class
            JOIN updates_last ON
                updates_last.source_id = markers.source_id
        WHERE
            uuid = $1
        """
        )
        marker = await db.fetchrow(sql, uuid)

    if not marker:
        return None

    return {
        **marker,
        **{
            "fixes": fixes_default(marker["fixes"]),
            "elems": list(
                map(
                    lambda elem: dict(
                        elem,
                        type_long={"N": "node", "W": "way", "R": "relation"}[
                            elem["type"]
                        ],
                    ),
                    marker["elems"] or [],
                )
            ),
        },
    }


def _expand_tags(
    tags: Dict[str, str], links: Dict[str, str], short: bool = False
) -> List[Dict[str, str]]:
    t = []
    if short:
        for k in tags:
            t.append({"k": k})
    else:
        for (k, v) in sorted(tags.items()):
            if links and k in links:
                t.append({"k": k, "v": v, "vlink": links[k]})
            else:
                t.append({"k": k, "v": v})
    return t

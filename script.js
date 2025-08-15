async function fetchNotionData(token, databaseId) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            filter: {
                or: [
                    { property: 'Status', select: { equals: 'Planned' } },
                    { property: 'Status', select: { equals: 'Scheduled' } }
                ]
            },
            sorts: [{ property: 'Post Date', direction: 'ascending' }]
        })
    });

    if (!response.ok) {
        throw new Error(`Notion API error: ${response.statusText}`);
    }

    return await response.json();
}

function renderGrid(posts, size) {
    const grid = document.getElementById('gridContainer');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    posts.slice(0, size * 3).forEach(post => {
        const image = post.properties.Image.files?.[0]?.file?.url || post.properties.Image.files?.[0]?.external?.url;
        if (image) {
            const img = document.createElement('img');
            img.src = image;
            grid.appendChild(img);
        }
    });
}

document.getElementById('loadGrid').addEventListener('click', async () => {
    const token = document.getElementById('notionToken').value.trim();
    const dbId = document.getElementById('databaseId').value.trim();
    const size = parseInt(document.getElementById('gridSize').value);

    try {
        const data = await fetchNotionData(token, dbId);
        renderGrid(data.results, size);

        const embedUrl = `${window.location.origin}${window.location.pathname}?db=${dbId}&size=${size}`;
        document.getElementById('embedCode').value = `<iframe src="${embedUrl}" style="width:100%;height:500px;border:none;"></iframe>`;
    } catch (err) {
        alert(err.message);
    }
});

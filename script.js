const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const browseBtn = document.getElementById('browseBtn');
const clearBtn = document.getElementById('clearBtn');
const countBadge = document.getElementById('countBadge');

const savedFiles = JSON.parse(localStorage.getItem('toolwork-files') || '[]');

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** index;
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.includes('text') || file.name.endsWith('.lua') || file.name.endsWith('.rbxm') || file.name.endsWith('.rbxmx')) return 'asset';
  return 'file';
}

function fileToCard(file, index) {
  const card = document.createElement('article');
  card.className = 'asset-card';

  const thumb = document.createElement('div');
  thumb.className = 'asset-thumb';

  const fileType = getFileType(file);

  if (fileType === 'image' && file.preview) {
    const img = document.createElement('img');
    img.src = file.preview;
    img.alt = file.name;
    thumb.appendChild(img);
  } else {
    const label = document.createElement('span');
    label.textContent = fileType === 'audio' ? '♫' : 'FILE';
    label.style.fontSize = '2.8rem';
    label.style.fontWeight = '900';
    label.style.color = '#ff6666';
    thumb.appendChild(label);
  }

  const meta = document.createElement('div');
  meta.className = 'asset-meta';

  const name = document.createElement('p');
  name.className = 'asset-name';
  name.textContent = file.name;

  const size = document.createElement('span');
  size.className = 'asset-size';
  size.textContent = formatBytes(file.size);

  const type = document.createElement('span');
  type.className = 'asset-type';
  type.textContent = fileType;

  meta.append(name, size, type);
  card.append(thumb, meta);

  return { card, index };
}

function renderFiles() {
  fileList.innerHTML = '';

  if (!savedFiles.length) {
    fileList.innerHTML = '<div class="empty-state"><p>No uploads yet. Add your first asset.</p></div>';
    countBadge.textContent = '0 files';
    return;
  }

  const cards = savedFiles.map((file, index) => fileToCard(file, index));
  cards.forEach(({ card }) => fileList.appendChild(card.card));
  countBadge.textContent = `${savedFiles.length} file${savedFiles.length === 1 ? '' : 's'}`;
}

async function handleFiles(fileListInput) {
  const files = Array.from(fileListInput || []);

  if (!files.length) return;

  const prepared = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                preview: event.target.result,
              });
            };
            reader.readAsDataURL(file);
          } else {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
            });
          }
        })
    )
  );

  savedFiles.push(...prepared);
  localStorage.setItem('toolwork-files', JSON.stringify(savedFiles));
  renderFiles();
}

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => {
  handleFiles(event.target.files);
  fileInput.value = '';
});

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('toolwork-files');
  savedFiles.length = 0;
  renderFiles();
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (event) => {
  const droppedFiles = event.dataTransfer.files;
  handleFiles(droppedFiles);
});

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});

renderFiles();

const polyphonyLevels = [1, 2, 3, 4, 5, 6, 7];
const exampleIds = [1, 2, 3];
const maxRawFiles = 7;

const samplesDiv = document.getElementById("samples");
const datasetSelect = document.getElementById("datasetSelect");
const description = document.getElementById("description");

// Create and insert Processing dropdown
const processingWrapper = document.createElement("div");
processingWrapper.className = "processing-wrapper";
processingWrapper.innerHTML = `
  <label for="processingSelect">Processing:</label>
  <select id="processingSelect">
    <option value="">None</option>
    <option value="_denoised">Denoising</option>
  </select>
`;
samplesDiv.parentNode.insertBefore(processingWrapper, samplesDiv);

const processingSelect = document.getElementById("processingSelect");

// Helper function to get versioned filenames
function versionedFile(filename, versionId) {
  const parts = filename.split(".");
  return parts[0] + versionId + "." + parts[1];
}

function renderDatasetDescription(dataset) {
  description.innerHTML = "";
  const path = `data/${dataset}/description.txt`;
  fetch(path)
    .then(response => {
      if (!response.ok) {
        description.textContent = "No description available.";
        throw new Error("Text file not found or could not be loaded.");
      }
      return response.text();
    })
    .then(data => {
      description.innerHTML = data;
    })
    .catch(() => {
      description.textContent = "No description available.";
    });
}

function renderSamples(dataset) {
  samplesDiv.innerHTML = "";

  polyphonyLevels.forEach(poly => {
    const sampleDiv = document.createElement("div");
    sampleDiv.className = "sample";

    const title = document.createElement("h3");
    title.textContent = `Polyphony Level ${poly}`;
    sampleDiv.appendChild(title);

    const leftCol = document.createElement("div");
    leftCol.className = "left-column";

    const select = document.createElement("select");
    exampleIds.forEach(ex => {
      const option = document.createElement("option");
      option.value = ex;
      option.textContent = `Example ${ex}`;
      select.appendChild(option);
    });

    const mediaDiv = document.createElement("div");
    mediaDiv.className = "media";

    const image = document.createElement("img");
    image.className = "spectrogram";

    const audio = document.createElement("audio");
    audio.controls = true;

    const basePath = (exampleId) =>
      `data/${dataset}/polyphony_${poly}/example_${exampleId}`;

    function updateMedia(exampleId) {
      const versionId = processingSelect.value;
      image.src = versionedFile(`${basePath(exampleId)}/images/mix_mel_spectrogram.png`, versionId);
      image.alt = `Spectrogram poly ${poly} example ${exampleId}`;
      audio.src = versionedFile(`${basePath(exampleId)}/audio/mix_audio.wav`, versionId);
    }

    select.addEventListener("change", () => {
      const val = select.value;
      updateMedia(val);
      updateRawGrid(val);
    });

    processingSelect.addEventListener("change", () => {
      const val = select.value;
      updateMedia(val);
      updateRawGrid(val);
    });

    mediaDiv.appendChild(select);
    mediaDiv.appendChild(image);
    mediaDiv.appendChild(audio);
    leftCol.appendChild(mediaDiv);

    const rightCol = document.createElement("div");
    rightCol.className = "right-column";

    const rawGrid = document.createElement("div");
    rawGrid.className = "raw-grid";

    function updateRawGrid(exampleId) {
      rawGrid.innerHTML = "";

      const versionId = processingSelect.value;
      const rawFilesToShow = Math.min(poly, maxRawFiles);

      for (let rawId = 1; rawId <= rawFilesToShow; rawId++) {
        const wrapper = document.createElement("div");
        wrapper.className = "raw-audio-wrapper";

        const rawImage = document.createElement("img");
        rawImage.className = "raw-spectrogram";
        rawImage.src = versionedFile(`${basePath(exampleId)}/images/raw_mel_spectrogram_${rawId}.png`, versionId);
        rawImage.alt = `Raw spectrogram ${rawId}`;

        const rawAudio = document.createElement("audio");
        rawAudio.controls = true;
        rawAudio.src = versionedFile(`${basePath(exampleId)}/audio/raw_audio_${rawId}.wav`, versionId);

        const label = document.createElement("div");
        label.className = "raw-label";
        label.textContent = `Raw Audio ${rawId}`;

        wrapper.appendChild(rawImage);
        wrapper.appendChild(rawAudio);
        wrapper.appendChild(label);

        rawGrid.appendChild(wrapper);
      }

      if (rawFilesToShow === 0) {
        const noFiles = document.createElement("p");
        noFiles.textContent = "No raw audio files available";
        rawGrid.appendChild(noFiles);
      }
    }

    // Initial load
    updateMedia(exampleIds[0]);
    updateRawGrid(exampleIds[0]);

    rightCol.appendChild(rawGrid);
    sampleDiv.appendChild(leftCol);
    sampleDiv.appendChild(rightCol);

    samplesDiv.appendChild(sampleDiv);
  });
}

// Tab switching logic
const buttons = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.tab;
    contents.forEach(c => {
      c.classList.toggle("active", c.id === target);
    });

    if (processingWrapper) {
      processingWrapper.style.display = target === "samples" ? "flex" : "none";
    }
  });
});

// Initial load
processingWrapper.style.display = "flex";
renderSamples(datasetSelect.value);
renderDatasetDescription(datasetSelect.value);

// Change dataset
datasetSelect.addEventListener("change", () => {
  renderSamples(datasetSelect.value);
  renderDatasetDescription(datasetSelect.value);
});

const polyphonyLevels = [1, 2, 3, 4, 5, 6, 7];
    const exampleIds = [ 1, 2, 3];
    const maxRawFiles = 7;

    const samplesDiv = document.getElementById("samples");
    const datasetSelect = document.getElementById("datasetSelect");
    const description = document.getElementById('description');

    function renderDatasetDescription(dataset) {

      description.innerHTML = "";

       // Fetch and insert the text file content
      path = `data/${dataset}/description.txt`;
      console.log(path);
      fetch(path)
        .then(response => {
          if (!response.ok) {
            description.textContent = "No description available."
            throw new Error('Text file not found or could not be loaded.');
          }
          return response.text();
        })
        .then(data => {
          description.innerHTML = data;
        })
        .catch(error => {
          description.textContent = "No description available.";
        });
    }

    function renderSamples(dataset) {
      samplesDiv.innerHTML = "";  // clear old content

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
          image.src = `${basePath(exampleId)}/images/mix_spectrogram.png`;
          image.alt = `Spectrogram poly ${poly} example ${exampleId}`;
          audio.src = `${basePath(exampleId)}/audio/mix_audio.wav`;
        }

        select.addEventListener("change", () => {
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

          const rawFilesToShow = Math.min(poly, maxRawFiles);
          for (let rawId = 1; rawId <= rawFilesToShow; rawId++) {
            const wrapper = document.createElement("div");
            wrapper.className = "raw-audio-wrapper";

            const rawImage = document.createElement("img");
            rawImage.className = "raw-spectrogram";
            rawImage.src = `${basePath(exampleId)}/images/raw_spectrogram_${rawId}.png`;
            rawImage.alt = `Raw spectrogram ${rawId}`;

            const rawAudio = document.createElement("audio");
            rawAudio.controls = true;
            rawAudio.src = `${basePath(exampleId)}/audio/raw_audio_${rawId}.wav`;

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

const buttons = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Toggle active button
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Show relevant content
    const target = btn.dataset.tab;
    contents.forEach(c => {
      c.classList.toggle("active", c.id === target);
    });
  });
});

    // Initial load
    renderSamples(datasetSelect.value);
    renderDatasetDescription(datasetSelect.value);

    // Change dataset
    datasetSelect.addEventListener("change", () => {
      renderSamples(datasetSelect.value);
      renderDatasetDescription(datasetSelect.value);
    });
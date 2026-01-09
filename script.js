function searchWord() {
    var wordInput = document.getElementById('wordInput');
    var word = wordInput.value.trim();
    var resultsContainer = document.getElementById('resultsContainer');
    var errorDiv = document.getElementById('error');
    var spinner = document.getElementById('spinner');

    if (!word) {
        alert("Please enter a word.");
        return;
    }

    resultsContainer.innerHTML = "";
    errorDiv.style.display = "none";
    spinner.style.display = "block"; // show loader

    // Direct API call - NO backend
    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Word not found");
            }
            return response.json();
        })
        .then(function (data) {
            spinner.style.display = "none"; // hide loader

            // Limit to 6 meanings max as per previous logic
            var meaningsToShow = [];
            var count = 0;

            if (data && data.length > 0) {
                // Find audio URL
                var audioUrl = "";
                if (data[0].phonetics) {
                    for (var i = 0; i < data[0].phonetics.length; i++) {
                        if (data[0].phonetics[i].audio) {
                            audioUrl = data[0].phonetics[i].audio;
                            break;
                        }
                    }
                }

                // Process meanings
                data.forEach(function (entry) {
                    if (entry.meanings) {
                        entry.meanings.forEach(function (meaning) {
                            if (meaning.definitions) {
                                meaning.definitions.forEach(function (def) {
                                    if (count >= 6) return;

                                    meaningsToShow.push({
                                        word: entry.word,
                                        phonetic: entry.phonetic || (entry.phonetics[0] ? entry.phonetics[0].text : ""),
                                        partOfSpeech: meaning.partOfSpeech,
                                        definition: def.definition,
                                        example: def.example || "Example not available",
                                        audio: audioUrl
                                    });
                                    count++;
                                });
                            }
                        });
                    }
                });
            }

            if (meaningsToShow.length > 0) {
                meaningsToShow.forEach(function (info) {
                    var card = document.createElement('div');
                    card.className = 'result-card';

                    // logic: only show audio player if audio exists
                    // NO TTS - only API audio

                    var html = `
                        <div class="word-header">
                            <h2 class="result-word">${info.word}</h2>
                            <span class="pos-tag">${info.partOfSpeech}</span>
                        </div>
                        <p class="phonetic">${info.phonetic || ''}</p>
                        
                        <div class="detail-item">
                            <span class="detail-label">Definition</span>
                            <p class="detail-content">${info.definition}</p>
                        </div>

                        <div class="detail-item">
                            <span class="detail-label">Example</span>
                            <p class="detail-content example-text">${info.example}</p>
                        </div>

                        ${info.audio ? `
                        <audio class="card-audio" controls>
                            <source src="${info.audio}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>` : ''}
                    `;

                    card.innerHTML = html;
                    resultsContainer.appendChild(card);
                });
            } else {
                errorDiv.innerText = "Word not found. Please try another word.";
                errorDiv.style.display = "block";
            }
        })
        .catch(function (err) {
            spinner.style.display = "none"; // stop loader on error
            errorDiv.innerText = "Word not found. Please try another word.";
            errorDiv.style.display = "block";
            console.error("Search failed:", err);
        });
}

document.getElementById('wordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWord();
    }
});

const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const result = document.getElementById("result");
const sound = document.getElementById("sound");
const btn = document.getElementById("search-btn");
const inpWord = document.getElementById("inp-word");

// Add event listeners
btn.addEventListener("click", searchWord);
inpWord.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchWord();
});

async function searchWord() {
    const word = inpWord.value.trim();
    if (!word) return;

    // Show loading state
    result.innerHTML = `
        <div class="text-center py-8 fade-in">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p>Searching for "${word}"...</p>
        </div>
    `;

    try {
        const response = await fetch(`${url}${word}`);
        if (!response.ok) throw new Error("Word not found");
        
        const data = await response.json();
        displayResult(data, word);
    } catch (error) {
        showError(word);
    }
}

function displayResult(data, word) {
    // Get the first phonetic with audio
    const phonetic = data[0].phonetics.find(p => p.audio) || {};
    
    // Get all parts of speech
    const partsOfSpeech = data[0].meanings.map(m => m.partOfSpeech).join(", ");
    
    // Get all definitions (limit to 3)
    const definitions = data[0].meanings.flatMap(meaning => 
        meaning.definitions.slice(0, 3).map(def => ({
            definition: def.definition,
            example: def.example || null
        }))
    );
    
    result.innerHTML = `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-indigo-900 capitalize">${word}</h2>
                    <div class="flex items-center gap-4 mt-2">
                        <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">${partsOfSpeech}</span>
                        ${phonetic.text ? `<span class="text-indigo-600">${phonetic.text}</span>` : ''}
                    </div>
                </div>
                ${phonetic.audio ? `
                <button onclick="playSound()" class="h-12 w-12 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-700 transition-all duration-300">
                    <i class="fas fa-volume-up text-xl"></i>
                </button>
                ` : ''}
            </div>
            
            <div class="space-y-6">
                ${definitions.map((def, i) => `
                <div class="bg-indigo-50/50 p-4 rounded-lg border-l-4 border-indigo-300">
                    <p class="text-gray-800 mb-2"><span class="font-semibold text-indigo-700">${i+1}.</span> ${def.definition}</p>
                    ${def.example ? `
                    <div class="mt-2 pl-4 border-l-2 border-indigo-200">
                        <p class="text-gray-600 italic">"${def.example}"</p>
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>
            
            <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-sm font-semibold text-gray-500 mb-3">WORD ORIGIN</h3>
                <p class="text-gray-700">${data[0].origin || 'Origin not available for this word.'}</p>
            </div>
        </div>
    `;
    
    if (phonetic.audio) {
        sound.setAttribute("src", `https:${phonetic.audio}`);
    }
}

function showError(word) {
    result.innerHTML = `
        <div class="text-center py-8 fade-in">
            <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <i class="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-800 mb-2">Word not found</h3>
            <p class="text-gray-600 mb-4">We couldn't find "${word}" in our dictionary.</p>
            <button onclick="window.location.reload()" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                Try another word
            </button>
        </div>
    `;
}

function playSound() {
    sound.play().catch(e => {
        console.error("Error playing sound:", e);
        // Show a subtle notification that audio isn't available
        const notification = document.createElement("div");
        notification.className = "fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-md shadow-md animate-bounce";
        notification.innerHTML = '<i class="fas fa-volume-mute mr-2"></i> Pronunciation not available';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    });
}


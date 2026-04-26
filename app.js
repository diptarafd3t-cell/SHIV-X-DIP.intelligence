document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Settings Modal elements
    const settingsBtn = document.getElementById('settings-btn');
    const apiModal = document.getElementById('api-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Load API key if it exists
    let apiKey = localStorage.getItem('gemini_api_key') || '';
    if (apiKey) apiKeyInput.value = apiKey;

    // Modal Logic
    settingsBtn.addEventListener('click', () => apiModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => apiModal.classList.add('hidden'));
    saveKeyBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        localStorage.setItem('gemini_api_key', apiKey);
        apiModal.classList.add('hidden');
        addMessage('API Key saved successfully!', 'ai-message');
    });

    // Handle sending message
    const sendMessage = async () => {
        const text = userInput.value.trim();
        if (!text) return;
        if (!apiKey) {
            alert('Please set your Gemini API key in settings first!');
            apiModal.classList.remove('hidden');
            return;
        }

        addMessage(text, 'user-message');
        userInput.value = '';
        
        // Show loading state
        const loadingId = addMessage('Thinking...', 'ai-message');

        try {
            // Call Gemini API (1.5 Flash model is fast and free-tier friendly)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                })
            });

            const data = await response.json();
            
            // Remove loading message
            document.getElementById(loadingId).remove();

            if (data.error) {
                addMessage(`Error: ${data.error.message}`, 'ai-message');
            } else {
                const aiResponse = data.candidates[0].content.parts[0].text;
                addMessage(aiResponse, 'ai-message');
            }
        } catch (error) {
            document.getElementById(loadingId).remove();
            addMessage('Network error. Please try again.', 'ai-message');
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function addMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.id = 'msg-' + Date.now();
        // Replace newlines with <br> for formatting
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return msgDiv.id;
    }

    // Register Service Worker for PWA (Chrome Installability)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker Registered'));
    }
});

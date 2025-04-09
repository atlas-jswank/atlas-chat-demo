document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    const joinBtn = document.getElementById('join-btn');
    const chatBox = document.getElementById('chat-box');
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const titleHeading = document.getElementById('title');

    // User state
    let username = window.sessionStorage.getItem("username") ?? '';

    // Handle user already logged in
    if (username !== '') {
        showMessages()
    }

    // Join chat with username
    joinBtn.addEventListener('click', () => {
        if (usernameInput.value.trim() !== '') {
            username = usernameInput.value.trim();
            window.sessionStorage.setItem("username", username)
            showMessages();
            usernameInput.value = '';
        }
    });

    // Allow pressing Enter to join
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinBtn.click();
        }
    });

    // Send message
    sendBtn.addEventListener('click', sendMessage);

    // Allow pressing Enter to send message
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Send chat message to server
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message !== '') {
            // Send message to server
            postMessage({ username, message })
            addMessage(`${username}: ${message}`, 'me');

            // Clear input
            messageInput.value = '';
        }
    }

    // Helper functions
    function addMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showMessages() {
        // Show chat interface, hide username form
        usernameForm.classList.add('hidden');
        chatBox.classList.remove('hidden');
        titleHeading.replaceChildren(logoutButton(username));
        messagesContainer.innerHTML = '';
        loadMessages();
    }

    function logoutButton(username) {
        const btn = document.createElement('span');
        btn.innerText = username + ' (Logout)';
        btn.style = 'cursor: pointer;';
        btn.addEventListener('click', () => {
            window.sessionStorage.clear();
            chatBox.classList.add('hidden');
            usernameForm.classList.remove('hidden');
            titleHeading.replaceChildren("Real-Time Chat");
        })
        return btn;
    }

    // Load chat messages from server
    function loadMessages() {
        fetch('/messages')
            .then(response => response.json())
            .then(messages => {
                messages.forEach(message => {
                    if (message.username === username) {
                        addMessage(`${message.username}: ${message.message}`, 'me');
                    } else {
                        addMessage(`${message.username}: ${message.message}`, 'received');
                    }

                });
            })
    }

    // Post a new chat message to server
    async function postMessage(message) {
        return fetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        })
    }
});
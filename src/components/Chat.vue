<template>
  <div class="chat-widget" :class="{ expanded: isExpanded }">
    <!-- Si le chat n'est pas développé, affiche une icône compacte avec badge de notification -->
    <div v-if="!isExpanded" class="chat-collapsed" @click="toggleChat">
      afficher le chat
      <span v-if="unreadCount > 0" class="notification">{{ unreadCount }}</span>
    </div>

    <!-- Si le chat est développé, affiche l'interface complète -->
    <div v-else class="chat">
      <div class="chat-header" :style="'background-color:' + playercolor" @click="toggleChat">
        <span class="close-btn">←</span> Tchat
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <strong :style="'color:' + msg.color">{{ msg.sender }}:</strong> {{ msg.message }}
          <span class="timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
        </div>
      </div>
      <div class="input-area">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Votre message..."
        />
        <button @click="sendMessage">Envoyer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, defineProps } from 'vue';
import socket from '@/socket';

// On récupère le room code via une prop
const props = defineProps({
  room: String,
  playercolor: String
});
const roomCode = props.room;

const isExpanded = ref(false);
const unreadCount = ref(0);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  socket.emit('chatMessage', {
    roomCode,
    message: newMessage.value,
  });
  newMessage.value = '';
  // Si le chat est déjà ouvert, on force le scroll
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

const toggleChat = () => {
  isExpanded.value = !isExpanded.value;
  // Si le chat s'ouvre, on réinitialise la notification
  if (isExpanded.value) {
    unreadCount.value = 0;
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
};

onMounted(() => {
  // Vérifie que le conteneur est bien assigné
  console.log("messagesContainer onMounted:", messagesContainer.value);
  socket.on('chatMessage', (data) => {
    messages.value.push(data);
    // Auto-scroll si le chat est développé
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
    // Si le chat est fermé, incrémente le compteur de messages non lus
    if (!isExpanded.value) {
      unreadCount.value++;
    }
  });
});

// Pour être certain que le scroll se déclenche à chaque nouveau message
watch(messages, async () => {
  await nextTick();
  if (isExpanded.value && messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-family: Arial, sans-serif;
  z-index: 1000;
}

/* Mode compact : icône et notification */
.chat-collapsed {
  background-color: #ffffff;
  color: rgb(88, 88, 88);
  width: 200px;
  height: 35px;
  display: flex;
  border: 1px solid rgb(173, 173, 173);
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  box-shadow: 5px 4px 5px 0px rgba(0,0,0,0.43);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: fixed;
  bottom: 0;
  right: 50px;
}

.chat-icon {
  font-size: 24px;
}

.notification {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 50%;
}

/* Mode étendu : interface complète du chat */
.chat {
  background: white;
  border: 1px solid #dadada;
  border-radius: 10px;
  position: fixed;
  bottom: 0;
  right: 50px;
  width: 300px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  color: white;
  padding: 10px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.close-btn {
  font-weight: bold;
  margin-right: 10px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 5px;
}

.timestamp {
  font-size: 0.8em;
  color: gray;
  margin-left: 10px;
}

.input-area {
  display: flex;
  border-top: 1px solid #ccc;
}

input {
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
}

button {
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
</style>

import { ref, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

export function usePoll() {
    const socket = io("http://localhost:3200", {
        transports: ["websocket", "polling"],
        autoConnect: true
    });
    const connected = ref(false);

    function connect() {
        if (socket.connected) return;
        socket.on("connect", () => {
            connected.value = true;
        });

        socket.on("disconnect", () => {
            connected.value = false;
        });
    }

    function participateQuiz(quizId) {
        if (!socket?.connected) {
            connect();
        }

        socket.emit('participateQuiz', quizId);
    }
    function questionResponse(quizId, questionId, option, studentId) {
        if (!socket?.connected) {
            connect();
        }
        socket.emit('answerSubmission', {
            quizId,
            questionId,
            option,
            studentId
        });
    }

    function onStudentResponse(callback) {
        if (!socket?.connected) {
            socket.once("connect", () => {
                socket.on('newAnswerSubmission', callback);
            });
            connect();
        } else {
            socket.on('newAnswerSubmission', callback);
        }
    }

    onMounted(() => {
        connect();
    });

    onBeforeUnmount(() => {
        socket.off();
        socket.disconnect();
    });

    return {
        socket,
        connect,
        connected,
        participateQuiz,
        questionResponse,
        onStudentResponse,
    };
}

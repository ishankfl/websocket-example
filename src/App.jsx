import { useEffect, useState } from "react";
import io from "socket.io-client";

// Establish a connection to the server
const socket = io("http://localhost:5000");

const App = () => {
  const [usernameInput, setUsernameInput] = useState(""); // Temporary input for username
  const [username, setUsername] = useState(""); // Registered username
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for private messages
    socket.on("private_message", ({ sender, message }) => {
      setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    });

    // Listen for errors when sending messages
    socket.on("user_not_found", ({ recipient }) => {
      alert(`User ${recipient} not found or not online.`);
    });

    return () => {
      socket.off("private_message");
      socket.off("user_not_found");
    };
  }, []);

  const registerUser = () => { 
    if (usernameInput.trim()) {
      socket.emit("register", usernameInput); // Notify the server of the new username
    } else {
      alert("Username cannot be empty!");
    }

    socket.on("user_exists", ({ username }) =>
      alert(`User ${username} already exists`)
    );

    socket.on("registration_success", ({ username }) => {
      setUsername(username); // Set the registered username
    });
  };

  const sendMessage = () => {
    if (recipient.trim() && message.trim()) {
      socket.emit("private_message", { sender: username, recipient, message });
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", message },
      ]);
      setMessage("");
    } else {
      alert("Both recipient and message are required!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Private Chat App
        </h1>

        {/* User Registration */}
        {!username && (
          <div className="flex flex-col items-center space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={registerUser}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Register
            </button>
          </div>
        )}

        {/* Chat Interface */}
        {username && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
              Welcome, {username}!
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient's username"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                type="text"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={sendMessage}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                Send
              </button>
            </div>

            {/* Display Messages */}
            <div className="mt-6">
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Messages:
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {messages.map((msg, index) => (
                  <p
                    key={index}
                    className={`px-4 py-2 rounded-lg ${
                      msg.sender === "You"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <strong>{msg.sender}:</strong> {msg.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

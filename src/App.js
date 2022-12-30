
import React, { useState, useEffect, useRef } from 'react';
//import { findDOMNode } from 'react-dom';
import './App.css';
import config from './config.json';

function App() {

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("text-davinci-003");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const baseUri = `http://${config.hostName}:${config.port}`;
  
  useEffect(() => {
    getAIModels(baseUri);
  }, [baseUri]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  function clearChat() {
    setChatLog([]);
  }

  async function createImageRequest() {
    let chatLogNew = [...chatLog, { user: "me", message: `${input}` }];
    setInput("");
    setChatLog(chatLogNew);
    const response = await fetch(`${baseUri}/images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: input,
      })
    });
    const data = await response.json();
    setChatLog([...chatLogNew, { user: "gpt", message: `${data.url}` }]);
  }

  function getAIModels(baseUri){
    fetch(`${baseUri}/models`)
    .then(res => res.json())
    .then(data => {
      setModels(data.data)
    });
  }

  async function formHandler(e){
    e.preventDefault();
    //findDOMNode(inputRef.current).focus();
    inputRef.current?.focus();
    var messages = "";
    let chatLogNew = [...chatLog, { user: "me", message: `${input}`}];
    setInput("");
    setChatLog(chatLogNew);
    
    // for prompt length, dont want to go over prompt max-length, if it is a lengthy convo
    if (chatLogNew.length > 5)
    {
      const recentPrompts = [...chatLogNew.slice(1)];
      messages = recentPrompts.map((message) => message.message).join("\n");
    }
    else
    {
      messages = chatLogNew.map((message) => message.message).join("\n");
    }
   
    const response = await fetch(`${baseUri}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: messages,
        currentModel 
      })
    });
    const data = await response.json();
    setChatLog([...chatLogNew, {user: "gpt", message: `${data.message}`}]);
  }

  return (
    <div className="App">
      <aside className="navigation-menu">
        <div className='select-model-div'>
          <label htmlFor="select-model">Models:</label>
            <select id="select-model" className='select-models' value={currentModel} onChange={(e) => {
              setCurrentModel(e.target.value)
            }}>
              {models.map((model, index) => (
                <option key={model.id} value={model.id}>{model.id}</option>
              ))}
            </select>
        </div>
        <div className="new-chat-button" onClick={clearChat}>
          <span>+</span>
          New Chat
        </div>
        <div className="new-chat-button create-image-button-position" onClick={createImageRequest}>
          <span></span>
          Send Image Request
        </div>
      </aside>
      <section className="chat-area">
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} bottomRef={bottomRef} />
          ))}
        </div>
        <div className="chat-prompt">
          <form onSubmit={formHandler}>
            <input className="chat-textarea" 
                   placeholder="Type your query here..." 
                   ref={inputRef}
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
            />
          </form>
        </div>
      </section>
  </div>
  );
}

const ChatMessage = ({ message, bottomRef }) => {
  return (
    <div className={`chat-message ${message.user === "gpt" ? "chatgpt" : ""}`}>
      <div className={`avatar ${message.user === "gpt" ? "chatgpt" : ""}`}>
          {message.user === "gpt" ? 
          <svg
            width={40}
            height={40}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth={1.5}
            className="h-6 w-6">
            <path
              d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813ZM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496ZM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744ZM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237Zm27.658 6.437-9.724-5.615 3.367-1.943a.121.121 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.65-1.132Zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763Zm-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225Zm1.829-3.943 4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5V18Z"
              fill="currentColor"
            />
          </svg>
          :
          <span>Me</span>
          }
      </div>
      <div className="message">
          {message.message.indexOf("https://") === 0
          ? 
          <img src={message.message.trim()} className="chat-image" alt='DALL-E' />
          : 
          <pre>{message.message.trim()}</pre>}
      </div>
      <div className="dummy-message" ref={bottomRef} >
      </div>
    </div>
  )
}

export default App;

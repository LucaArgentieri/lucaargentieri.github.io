import "./App.css";
import { Canvas } from "./components/Canvas";

function App() {
  console.log(`
  Hello! I see that you are curious :D

  ▄█▄    ▄█ ██   ████▄ 
█▀ ▀▄  ██ █ █  █   █ 
█   ▀  ██ █▄▄█ █   █ 
█▄  ▄▀ ▐█ █  █ ▀████ 
▀███▀   ▐    █       
            █        
           ▀    
  `);
  console.log("Email: %c lucaargentieri98@gmail.com", "color:white; background-color:#0000ff");
  console.log("Github: %c https://github.com/LucaArgentieri", "color:white; background-color:#0000ff");
  return (
    <div className="App">
      <h1>Ciao</h1>
      <p>
        I'm working at{" "}
        <a href="http://display.design/" target="_blank" rel="noopener noreferrer">
          display.design
        </a>{" "}
        as front-end developer.
      </p>
      <Canvas />
    </div>
  );
}

export default App;

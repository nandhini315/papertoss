import React, { useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import GameScreen from "./components/GameScreen";
import "./App.css";

function App() {
    const [gameStarted, setGameStarted] = useState(false);

    return (
        <div>
            {!gameStarted ? (
                <LoadingScreen onStart={() => setGameStarted(true)} />
            ) : (
                <GameScreen />
            )}
        </div>
    );
}

export default App;

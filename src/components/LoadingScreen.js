import React, { useEffect, useState } from "react";
import "../App.css";

const LoadingScreen = ({ onStart }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return oldProgress + 20;
            });
        }, 500);
    }, []);

    return (
        <div className="loading-screen">
            <h1>PAPER TOSS</h1>
            <p>LOADING...</p>
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <button onClick={onStart} disabled={progress < 100}>
                Get Started
            </button>
            <img src="/dustbin.png" className="bin" alt="bin" />
            <img src="/paperball.png" className="paper" alt="paper" />
        </div>
    );
};

export default LoadingScreen;

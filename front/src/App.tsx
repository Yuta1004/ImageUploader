import { useState } from "react";

const App = () => {
    const [count, setCount] = useState(0);

    return (<>
        <button
            onClick={() => setCount((count) => count+1)} 
        >
            Click me!
        </button>  
        <p>Count : { count }</p>
    </>);
}

export default App;
